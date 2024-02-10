import 'websocket-polyfill'

import { Buff, Bytes }  from '@cmdcode/buff'
import { SignedEvent }  from '@cmdcode/signer'
import { verify_sig }   from '@cmdcode/crypto-tools/signer'
import { EventEmitter } from './emitter.js'

import {
  SignedNote,
  SignerAPI
} from '@scrow/core'

import {
  sleep,
  stringify
} from '@/lib/util.js'

import {
  EventMessage,
  SocketConfig
} from '../types.js'

import {
  encrypt_cbc,
  decrypt_cbc
} from '@cmdcode/crypto-tools/cipher'

import * as schema from '@/schema/index.js'

const now = () => Math.floor(Date.now() / 1000)

// Default options to use.
export const SOCKET_DEFAULTS = () : SocketConfig => {
  return {
    connect_retries : 10,
    connect_timeout : 500,
    receipt_delay   : 1000,
    receipt_timeout : 4000,
    default_filter  : { since : now() },
    default_kind    : 30000,  // Default event type.
    default_tags    : [],     // Global tags for events.
    selfsub         : false,  // React to self-published events.
    silent          : false,  // Silence noisy output.
    verbose         : false,  // Show verbose log output.
  }
}

export class NostrSocket extends EventEmitter <{
  'close'   : string | undefined,
  'echo'    : string
  'eose'    : string,
  'error'   : Error,
  'event'   : EventMessage,
  'notice'  : string,
  'ready'   : NostrSocket,
  'reject'  : [ reason : string, envelope : unknown ],
  'receipt' : [ id : string, ok : boolean, reason : string ]
}> {

  readonly _filter : Record<string, any>
  readonly _opt    : SocketConfig
  readonly _signer : SignerAPI
  readonly _tags   : string[][]

  _relay?  : string
  _secret? : Buff
  _socket? : WebSocket
  _subbed  : boolean
  _sub_id  : string

  constructor(
    signer   : SignerAPI,
    options ?: Partial<SocketConfig>
  ) {
    // Init the config object.
    const config = { ...SOCKET_DEFAULTS(), ...options }
    // Init the filter object.
    const filter = {
      kinds : [ config.default_kind ],
      ...config.default_filter
    }
    // Init class attributes.
    super()
    this._filter  = filter
    this._opt     = config
    this._signer  = signer
    this._subbed  = false
    this._sub_id  = Buff.random(32).hex
    this._tags    = [ ...config.default_tags ]
  }

  get channel_id () {
    return this.secret.digest.hex
  }

  get filter () {
    return this._filter
  }

  get is_ready () {
    return (this.is_connected && this.is_subscribed)
  }

  get is_connected () {
    return this.socket.readyState === 1
  }

  get is_subscribed () {
    return this._subbed
  }

  get opt () {
    return this._opt
  }

  get pubkey () {
    return this._signer.pubkey
  }

  get relay () {
    if (this._relay === undefined) {
      throw new Error('socket relay is undefined')
    }
    return this._relay
  }

  get secret () {
    if (this._secret === undefined) {
      throw new Error('socket secret is undefined')
    }
    return this._secret
  }

  get socket () {
    if (this._socket === undefined) {
      throw new Error('socket is undefined')
    }
    return this._socket
  }

  get tags () {
    return this._tags
  }

  debug (...s : unknown[]) {
    return (this.opt.verbose) ? console.log(...s) : null
  }

  info (...s : unknown[]) {
    return (this.opt.silent)  ? null : console.log(...s)
  }

  async subscribe () {
    /** Send a subscription message to the socket peer. */
    const subscription = ['REQ', this._sub_id, this.filter]
    this.socket.send(JSON.stringify(subscription))
    this.debug('sub filter:', this.filter)
  }

  async connect (
    address ?: string,
    secret  ?: string
  ) {
    if (address !== undefined) {
      this._relay = address
    }
    
    if (secret !== undefined) {
      this._secret = Buff.str(secret).digest
    }

    if (!this._relay) {
      throw new Error('Must provide a valid relay address!')
    }

    if (!this._secret) {
      throw new Error('Must provide a shared secret!')
    }

    const chid = this.channel_id

    if (address !== undefined || this.socket.readyState > 1) {
      this._socket = new WebSocket(this.relay)

      // Setup our main socket event listeners.
      this.socket.addEventListener('error',   (event) => this._err_handler(event))
      this.socket.addEventListener('open',    (event) => this._open_handler(event))
      this.socket.addEventListener('message', (event) => this._msg_handler(event))

      // Configure our event tags and filter.
      this.tags.push([ 'd', chid ])
      this.filter['#d'] = [ chid ]
    }

    if (this.is_ready) return

    // Return a promise that includes a timeout.
    const { connect_retries, connect_timeout } = this.opt
    return new Promise((res, rej) => {
      let count = 0, retries = connect_retries
      let interval = setInterval(async () => {
        if (this.is_ready) {
          res(clearInterval(interval))
          this.emit('ready', this)
        } else if (count > retries) {
          this.info('failed to connect')
          rej(clearInterval(interval))
        } else { count++ }
      }, connect_timeout)
    })
  }

  _err_handler (err : unknown) {
    const error = (err instanceof Error)
      ? err
      : new Error(String(err))
    this.debug('error:', err)
    this.emit('error', error)
  }

  _msg_handler (msg : any) {
    const payload = msg['data']
    const [ type, ...rest ] = JSON.parse(payload)

    switch (type) {
      case 'EOSE':
        const [ sub_id ] = rest
        this._subbed = true
        this.info('subscription id :', sub_id)
        this.emit('eose', sub_id)
        return
    
      case 'EVENT':
        const [ event_id, event ] = rest
        this.debug('inbound event:', event_id)
        this._evt_handler(event)
        return

      case 'OK':
        this.debug('inbound receipt:', rest)
        this.emit('receipt', rest)
        return

      case 'CLOSED':
        const [ sid, reason ] = rest
        this.debug('sub canceled:', sid, reason)
        this.emit('close', reason)
        return

      case 'NOTICE':
        const [ msg ] = rest
        this.debug('server notice:', msg)
        this.emit('notice', msg)
        return

      default:
        this.debug('unknown payload type:', type, type.length)
        return
    }
  }

  async _open_handler (_event : unknown) {
    /** Handle the socket open event. */
    this.info('socket pubkey   :', this.pubkey)
    this.info('connected to    :', this._relay)
    this.subscribe()
  }

  async _evt_handler (event : unknown) {
    const envelope = await parse_note(event)

    if (envelope === null) {
      this.debug('invalid format:', event)
      this.emit('reject', [ 'invalid format', event ])
      return
    }

    const { content, id, pubkey, sig } = envelope

    if (!verify_sig(sig, id, pubkey)) {
      this.debug('bad signature:', event)
      this.emit('reject', [ 'bad signature', event ])
      return
    }

    // If the event is from ourselves, 
    if (pubkey === this.pubkey) {
      this.emit('echo', id)
      if (!this.opt.selfsub) return
    }

    let message : [ string, string, any ]

    try {
      const arr = decrypt_content(content, this.secret)
      message = JSON.parse(arr)
    } catch (err) {
      this.debug('invalid content:', content)
      this.emit('reject', [ 'invalid content', event ])
      return
    }

    const [ subject, hash, body ] = message
    const { content: _, ...rest } = envelope

    this.debug('recv message  :', message)
    this.debug('recv envelope :', rest)

    // Build the data payload.
    const data : EventMessage = { body, envelope, hash, subject }

    // Emit the event to our subscribed functions.
    this.emit('event', data)
  }

  sign (event : Partial<SignedEvent>) {
    /** Create a has and signature for our 
     *  event, then return it with the event.
     * */
    const preimg = JSON.stringify([
      0,
      event['pubkey'],
      event['created_at'],
      event['kind'],
      event['tags'],
      event['content'],
    ])

    // Append event ID and signature
    event.id  = Buff.str(preimg).digest.hex
    event.sig = this._signer.sign(event.id)

    return event as SignedEvent
  }

  on_event (
    subject : string,
    handler : (msg : EventMessage) => void | Promise<void>
  ) {
    this.on('event', msg => {
      if (msg.subject === subject) {
        handler(msg)
      }
    })
  }

  delete (id : string) {
    /** Send a data message to the relay. */
    const event = {
      content    : '',
      created_at : now(),
      kind       : 5,
      tags       : [['e', id ]],
      pubkey     : this.pubkey
    }
    const signed = this.sign(event)
    return this.publish(signed)
  }

  send (
    subject   : string,
    body      : unknown,
    envelope ?: Partial<SignedEvent>
  ) {
    /** Send a data message to the relay. */
    const { kind, tags = [] } = envelope ?? {}
    const preimg  = stringify(body)
    const hash    = Buff.str(preimg).digest.hex
    const content = JSON.stringify([ subject, hash, body ])
    
    const event = {
      content    : encrypt_content(content, this.secret),
      created_at : now(),
      kind       : kind || this.opt.default_kind,
      tags       : [...this.tags, ...tags ],
      pubkey     : this.pubkey
    }

    // Sign our message.
    const signed = this.sign(event)
    
    const { receipt_delay, receipt_timeout } = this.opt
    // Return a receipt wrapped in a promise.
    return new Promise((res, rej) => {
      const duration = receipt_delay + receipt_timeout
      const timeout  = new Error('message delivery timed out')
      const timer    = setTimeout(() => rej(timeout), duration)
      this.within('receipt', ([ id, ok, reason ]) => {
        if (id === signed.id) {
          if (!ok) {
            clearTimeout(timer)
            rej(reason)
          }
        }
      }, duration)
      this.within('echo', async (evt_id) => {
        if (evt_id === signed.id) {
          clearTimeout(timer)
          await sleep(receipt_delay)
          res(signed)
        }
      }, duration)
      this.publish(signed)
    })
  }

  publish (
    event : SignedNote
  ) {
    const { content, ...rest } = event

    this.debug('send message  :', content)
    this.debug('send envelope :', rest)

    if (!this.is_connected) {
      throw new Error('not connected')
    }

    this.socket.send(JSON.stringify([ 'EVENT', event ]))
  }

  close (reason ?: string) {
    this.socket.close()
    this._subbed = false
    this.emit('close', reason)
  }
}

async function parse_note (
  note : unknown
) : Promise<SignedNote | null> {
  const parser = schema.base.note
  const parsed = await parser.spa(note)
  return (parsed.success)
    ? parsed.data
    : null
}

function encrypt_content (
  content : string,
  secret  : Bytes
) {
  const bytes   = Buff.str(content) 
  const vector  = Buff.random(16)
  const encoded = encrypt_cbc(bytes, secret, vector)
  return Buff.join([ vector, encoded ]).b64url
}

function decrypt_content (
  content : string, 
  secret  : Bytes
) {
  const bytes   = Buff.b64url(content)
  const vector  = bytes.subarray(0, 16)
  const data    = bytes.subarray(16)
  return decrypt_cbc(data, secret, vector).str
}
