import 'websocket-polyfill'

import { Buff, Bytes }  from '@cmdcode/buff'
import { SignedEvent }  from '@cmdcode/signer'
import { verify_sig }   from '@cmdcode/crypto-tools/signer'
import { EventEmitter } from './emitter.js'

import {
  SignedNote,
  SignerAPI
} from '@scrow/core'

import { sleep, stringify } from '@/lib/util.js'

import {
  EventFilter,
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
    echo_timeout    : 4000,
    receipt_timeout : 4000,
    filter          : { since : now() } as EventFilter,
    kind            : 20000,  // Default event type.
    tags            : [],     // Global tags for events.
    selfsub         : false,  // React to self-published events.
    debug           : false,  // Silence noisy output.
    verbose         : false,  // Show verbose log output.
  }
}

export class NostrSocket extends EventEmitter <{
  'cancel'    : [ id : string, socket : NostrSocket, reason : string ]
  'close'     : NostrSocket
  'echo'      : string
  'error'     : Error
  'event'     : EventMessage
  'notice'    : string
  'ready'     : NostrSocket
  'reject'    : [ reason : string, envelope : unknown ]
  'receipt'   : [ id : string, ok : boolean, reason : string ]
  'subscribe' : [ id : string, socket : NostrSocket ]
}> {

  readonly _opt    : SocketConfig
  readonly _signer : SignerAPI
  readonly _tags   : string[][]

  _filter   : EventFilter
  _relay?   : string
  _secret?  : Buff
  _socket?  : WebSocket
  _sub_id   : string | null
  _topic_id : string | null

  constructor (
    signer   : SignerAPI,
    options ?: Partial<SocketConfig>
  ) {
    // Init the config object.
    const config = { ...SOCKET_DEFAULTS(), ...options }
    // Init the filter object.
    const filter = { kinds : [], ...config.filter }
    filter.kinds.push(config.kind)
    // Init parent class and attributes.
    super()
    this._opt      = config
    this._signer   = signer
    this._filter   = filter as EventFilter
    this._sub_id   = null
    this._tags     = [ ...config.tags ]
    this._topic_id = null
  }

  get filter () {
    return this._filter
  }

  get is_connected () {
    return this.socket.readyState === 1
  }

  get is_ready () {
    return (this.is_connected && this.is_subscribed)
  }

  get is_subscribed () {
    return this._sub_id !== null
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

  get sub_id () {
    if (this._sub_id === null) {
      throw new Error('there is no active subscription')
    }
    return this._sub_id
  }

  get tags () {
    return this._tags
  }

  get topic_id () {
    if (this._topic_id === null) {
      throw new Error('there is no active connection')
    }
    return this._topic_id
  }

  log = {
    debug : (...s : unknown[]) => {
      return (this.opt.debug) ? console.log('[socket]', ...s) : null
    },
    info  : (...s : unknown[]) => {
      return (this.opt.verbose) ? console.log('[socket]', ...s) : null
    }
  }

  _err_handler (err : unknown) {
    const error = (err instanceof Error)
      ? err
      : new Error(String(err))
    this.log.debug('error:', err)
    this.emit('error', error)
  }

  async _evt_handler (event : unknown) {
    const envelope = await parse_note(event)

    if (envelope === null) {
      this.log.debug('invalid format:', event)
      this.emit('reject', [ 'invalid format', event ])
      return
    }

    const { content, created_at, id, pubkey, sig } = envelope
    this.log.info('event id       :', id)
    this.log.info('event date     :', new Date(created_at * 1000))

    if (!verify_sig(sig, id, pubkey)) {
      this.log.debug('bad signature:', event)
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
      this.log.debug('invalid content:', content)
      this.emit('reject', [ 'invalid content', event ])
      return
    }

    const [ subject, hash, body ] = message
    const { content: _, ...rest } = envelope

    this.log.debug('recv message  :', message)
    this.log.debug('recv envelope :', rest)

    // Build the data payload.
    const data : EventMessage = { body, envelope, hash, subject }

    // Emit the event to our subscribed functions.
    this.emit('event', data)
  }

  _msg_handler (msg : any) {
    try {
      const payload = msg['data']
      const [ type, ...rest ] = JSON.parse(payload)
      switch (type) {
        case 'EOSE':
          const [ sub_id ] = rest
          this._sub_id = sub_id
          this.log.info('sub active     :', sub_id)
          this.emit('subscribe', [ sub_id, this ])
          break
        case 'EVENT':
          const [ event_id, event ] = rest
          this.log.info('event sub      :', event_id)
          this._evt_handler(event)
          break
        case 'OK':
          const [ id, ok, ok_reason ] = rest
          this.log.info('event receipt  :', id, ok ? 'ok' : ok_reason)
          this.emit('receipt', rest)
          break
        case 'CLOSED':
          const [ sid, reason ] = rest
          this.log.info('sub canceled:', sid, reason)
          if (sid === this.sub_id) {
            this._sub_id = null
            this.emit('cancel', [ sid, this, reason ])
          }
          break
        case 'NOTICE':
          const [ msg ] = rest
          this.log.info('server notice:', msg)
          this.emit('notice', msg)
          break
        default:
          this.log.debug('unknown payload:', type, type.length)
        }
      } catch (err) {
        this._err_handler(err)
      }
  }

  async _open_handler (_event : unknown) {
    /** Handle the socket open event. */
    this.log.info('socket pubkey  :', this.pubkey)
    this.log.info('connected to   :', this._relay)
    this.subscribe()
  }

  async cancel () {
    const sub_id  = this.sub_id
    const sub_req = [ 'CLOSE', sub_id ]
    this._sub_id  = null
    this.log.info('cancelling sub :', sub_id)
    this.socket.send(JSON.stringify(sub_req))
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

    if (address !== undefined || this.socket.readyState > 1) {
      this._socket = new WebSocket(this.relay)
      // Setup our main socket event listeners.
      this.socket.addEventListener('error',   (event) => this._err_handler(event))
      this.socket.addEventListener('open',    (event) => this._open_handler(event))
      this.socket.addEventListener('message', (event) => this._msg_handler(event))
    }

    if (this.is_ready) return

    // Return a promise that includes a timeout.
    const { connect_retries, connect_timeout } = this.opt
    const timeout = 'failed to connect'
    return new Promise((res, rej) => {
      let count = 0, retries = connect_retries
      let interval = setInterval(async () => {
        if (this.is_ready) {
          res(clearInterval(interval))
          this.emit('ready', this)
        } else if (count > retries) {
          rej(timeout)
        } else { count++ }
      }, connect_timeout)
    }).catch(err => { throw new Error(err) })
  }

  close () {
    this.socket.close()
    this._sub_id = null
    this.emit('close', this)
  }

  delete (event_id : string) {
    /** Send a data message to the relay. */
    const event = {
      content    : '',
      created_at : now(),
      kind       : 5,
      tags       : [['e', event_id ]],
      pubkey     : this.pubkey
    }
    const signed = this.sign(event)
    return this.publish(signed)
  }

  async on_cancel (sub_id : string) {
    const duration = this.opt.receipt_timeout
    const timeout  = 'cancel receipt timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('cancel', ([ id ]) => {
        if (id === sub_id) {
          this.log.info('confirmed cancel: ' + sub_id)
          clearTimeout(timer)
          res(id)
        }
      }, duration)
    }).catch(err => { throw new Error(err) })
  }

  async on_echo (event_id : string) {
    const duration = this.opt.echo_timeout
    const timeout  = 'echo listener timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('echo', async (id) => {
        if (id === event_id) {
          this.log.info('confirmed echo: ' + event_id)
          clearTimeout(timer)
          res(event_id)
        }
      }, duration)
    }).catch(err => { throw new Error(err) })
  }

  on_event <T> (
    subject : string,
    handler : (msg : EventMessage<T>) => void | Promise<void>
  ) {
    this.on('event', msg => {
      if (msg.subject === subject) {
        handler(msg)
      }
    })
  }

  async on_receipt (event_id : string) {
    const duration = this.opt.receipt_timeout
    const timeout  = 'message receipt timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('receipt', ([ id, ok, reason ]) => {
        if (id === event_id) {
          this.log.debug('receipt confirmed: ' + event_id)
          clearTimeout(timer)
          return (ok) ? res(id) : rej(reason)
        }
      }, duration)
    }).catch(err => { throw new Error(err) })
  }

  async on_sub (sub_id : string) {
    const duration = this.opt.receipt_timeout
    const timeout  = 'subscription receipt timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('subscribe', ([ id ]) => {
        if (id === sub_id) {
          this.log.debug('sub confirmed: ' + sub_id)
          clearTimeout(timer)
          res(id)
        }
      }, duration)
    }).catch(err => { throw new Error(err) })
  }

  publish (
    event : SignedNote
  ) {
    const { content, ...rest } = event

    this.log.info('event publish  :', rest.id)
    this.log.debug('send message  :', content)
    this.log.debug('send envelope :', rest)

    if (!this.is_connected) {
      throw new Error('not connected')
    }

    this.socket.send(JSON.stringify([ 'EVENT', event ]))
  }

  async send (
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
      kind       : kind || this.opt.kind,
      tags       : [...this.tags, ...tags, [ 'd', this.topic_id ] ],
      pubkey     : this.pubkey
    }

    // Sign our message.
    const signed  = this.sign(event)
    // Create a receipt promise.
    const receipt = this.on_receipt(signed.id)
    // Publish the signed event.
    this.publish(signed)
    // Return the promises.
    return Promise.all([ receipt, sleep(1000) ])
  }

  sign (event : Partial<SignedEvent>) {
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

  async subscribe (filter ?: EventFilter) {
    /** Send a subscription message to the socket peer. */
    filter = { ...this.filter, ...filter }
    const sub_id   = this._sub_id ?? Buff.random(32).hex
    const topic_id = this.secret.digest.hex
    const sub_opt  = { ...filter, '#d' : [ topic_id ]} 
    const sub_req  = [ 'REQ', sub_id, sub_opt ]
    this._filter   = sub_opt as unknown as EventFilter
    this._topic_id = topic_id
    const receipt  = this.on_sub(sub_id)
    this.log.info('activating sub : ' + sub_id)
    this.socket.send(JSON.stringify(sub_req))
    this.log.debug('sub filter:', sub_opt)
    return receipt
  }

  async update (filter : EventFilter) {
    this.cancel()
    this._filter = filter
    return this.subscribe()
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
