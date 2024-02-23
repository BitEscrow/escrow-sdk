import 'websocket-polyfill'

import { Buff, Bytes }  from '@cmdcode/buff'
import { verify_sig }   from '@cmdcode/crypto-tools/signer'
import { EventEmitter } from './emitter.js'
import { NostrSub }     from './sub.js'

import {
  SignedEvent,
  SignerAPI
} from '@scrow/core'

import {
  sleep,
  stringify
} from '@/lib/util.js'

import {
  EventFilter,
  EventMessage,
  SocketConfig,
  SubscribeConfig
} from '../types.js'

import {
  encrypt_cbc,
  decrypt_cbc
} from '@cmdcode/crypto-tools/cipher'

import * as schema from '@/schema/index.js'

type ReceiptEnvelope = [ id : string, ok : boolean, reason : string ]

const now = () => Math.floor(Date.now() / 1000)

// Default options to use.
export const SOCKET_DEFAULTS = () : SocketConfig => {
  return {
    connect_retries : 10,
    connect_timeout : 500,
    echo_timeout    : 4000,
    send_delta      : 1000,
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
  'cancel'    : [ id : string, sub : NostrSub, reason : string ]
  'close'     : NostrSocket
  'connect'   : NostrSocket
  'echo'      : string
  'error'     : Error
  'event'     : EventMessage
  'notice'    : string
  'ready'     : NostrSocket
  'reject'    : [ reason : string, envelope : unknown ]
  'receipt'   : ReceiptEnvelope
  'subscribe' : [ id : string, sub : NostrSub ]
}> {

  readonly _opt    : SocketConfig
  readonly _signer : SignerAPI
  readonly _tags   : string[][]

  _buffer  ?: ReturnType<typeof setTimeout>
  _init     : boolean
  _outbox   : SignedEvent[]
  _relay?   : string
  _secret?  : Buff
  _socket   : WebSocket | null
  _subs     : Map<string, NostrSub>
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
    this._tags     = [ ...config.tags ]
    this._init     = false
    this._outbox   = []
    this._socket   = null
    this._subs     = new Map()
    this._topic_id = null
  }

  get is_connected () {
    return (this._socket !== null && this._socket.readyState === 1)
  }

  get opt () {
    return this._opt
  }

  get pubkey () {
    return this._signer.pubkey
  }

  get is_ready () {
    return this._init
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

  get subs () {
    return this._subs
  }

  get socket () {
    if (this._socket === null) {
      throw new Error('socket not initialized')
    }
    return this._socket
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

  async _event_handler (payload : string[]) {
    const [ sub_id, json ] = payload

    const event = await parse_note(json)
    const sub   = this.get_sub(sub_id)

    if (event === null) {
      this.log.debug('invalid event:', json)
      this.emit('reject', [ 'invalid event', json ])
      return
    }

    const { content, created_at, id, pubkey, sig } = event

    this.log.info('event sub      :', sub_id)
    this.log.info('event id       :', id)
    this.log.info('event date     :', new Date(created_at * 1000))

    if (!verify_sig(sig, id, pubkey)) {
      this.log.debug('bad signature:', json)
      this.emit('reject', [ 'bad signature', json ])
      return
    }

    sub.emit('event', event)

    // If the event is from ourselves, 
    if (pubkey === this.pubkey) {
      this.emit('echo', id)
      if (!sub.is_echo) return
    }

    if (content.includes('?iv=') && this._secret !== undefined) {
      let message : [ string, string, any ]

      try {
        const arr = decrypt_content(content, this.secret)
        message = JSON.parse(arr)
      } catch (err) {
        this.log.debug('invalid content:', content)
        this.emit('reject', [ 'invalid content', event ])
        return
      }

      const [ subject, hash, body ]     = message
      const { content: _, ...rest } = event

      this.log.debug('recv message  :', message)
      this.log.debug('recv envelope :', rest)

      // Build the data payload.
      const msg : EventMessage = { body, envelope : event, hash, subject }

      // Emit the event to our subscribed functions.
      sub.emit('message', msg)
    }
  }

  _msg_handler (msg : any) {
    try {
      const payload = msg['data']
      const [ type, ...rest ] = JSON.parse(payload)
      switch (type) {
        case 'EOSE':
          return this._eose_handler(rest)
        case 'EVENT':
          return this._event_handler(rest)
        case 'OK':
          return this._receipt_handler(rest)
        case 'CLOSED':
          return this._cancel_handler(rest)
        case 'NOTICE':
          return this._notice_handler(rest)
        default:
          this.log.debug('unknown payload:', type, type.length)
      }
    } catch (err) {
      this._err_handler(err)
    }   
  }

  _cancel_handler (payload : string[]) {
    const [ sub_id, reason ] = payload
    if (this.subs.has(sub_id)) {
      const sub = this.get_sub(sub_id)
      sub._init = false
      sub.emit('cancel', sub)
      this.subs.delete(sub_id)
      this.log.info('sub canceled   :', sub_id, reason)
      this.emit('cancel', [ sub_id, sub, reason ])
    }
  }

  _eose_handler (payload : string[]) {
    const [ sub_id ] = payload
    const sub = this.get_sub(sub_id)
    sub._init = true
    sub.emit('ready', sub)
    this.log.info('sub active     :', sub_id)
    this.emit('subscribe', [ sub_id, sub ])
  }

  _open_handler (_event : unknown) {
    /** Handle the socket open event. */
    this.log.info('socket pubkey  :', this.pubkey)
    this.log.info('connected to   :', this._relay)
  }

  _notice_handler (payload : string[]) {
    const [ msg ] = payload
    this.log.info('server notice:', msg)
    this.emit('notice', msg)
  }

  _receipt_handler (payload : ReceiptEnvelope) {
    const [ id, ok, ok_reason ] = payload
    this.log.info('event receipt  :', id, ok ? 'ok' : ok_reason)
    this.emit('receipt', payload)
  }

  _publish (events ?: SignedEvent[]) {
    let delay  = 0 
    const arr  = events ?? [ ...this._outbox ]
    const prom = arr.map(async (event) => {
      const req = [ 'EVENT', event ]
      this.socket.send(JSON.stringify(req))
      await sleep(delay)
      delay += this.opt.send_delta
    })
    return Promise.all(prom)
  }

  _subscribe (subs ?: [ string, NostrSub ][]) {
    let delay  = 0 
    const arr  = subs ?? [ ...this.subs ]
    const prom = arr.map(async ([ sub_id, sub ]) => {
      if (this._secret !== undefined) {
        sub.filter['#d'] = [ this.topic_id ]
      }
      const req = [ 'REQ', sub_id, sub.filter ]
      this.socket.send(JSON.stringify(req))
      await sleep(delay)
      delay += this.opt.send_delta
    })
    return Promise.all(prom)
  }

  async cancel (sub_id : string) {
    if (this.subs.has(sub_id)) {
      const sub_req = [ 'CLOSE', sub_id ]
      this.log.info('cancelling sub :', sub_id)
      this._cancel_handler([ sub_id, '' ])
      this.socket.send(JSON.stringify(sub_req))
    }
  }

  can_recover (event : SignedEvent) {
    return event.tags.find(e => e[0] === 'rec') !== undefined
  }

  async connect (address ?: string, secret  ?: string) {
    if (address !== undefined) {
      this._relay = address
    }
    
    if (secret !== undefined) {
      this._secret   = Buff.str(secret).digest
      this._topic_id = this.secret.digest.hex
    }

    if (!this._relay) {
      throw new Error('Must provide a valid relay address!')
    }

    // if (!this._secret) {
    //   throw new Error('Must provide a shared secret!')
    // }

    if (address !== undefined || this.socket.readyState > 1) {
      this._socket = new WebSocket(this.relay)
      // Setup our main socket event listeners.
      this.socket.addEventListener('error',   (event) => this._err_handler(event))
      this.socket.addEventListener('open',    (event) => this._open_handler(event))
      this.socket.addEventListener('message', (event) => this._msg_handler(event))
    }

    this.emit('connect', this)

    if (this.is_connected) return

    // Return a promise that includes a timeout.
    const { connect_retries, connect_timeout } = this.opt
    const timeout = 'failed to connect'
    return new Promise((res, rej) => {
      let count = 0, retries = connect_retries
      let interval = setInterval(async () => {
        if (this.is_connected) {
          clearInterval(interval)
          if (!this.is_ready) {
            await this._subscribe()
            await this._publish()
            this._init = true
            this.emit('ready', this)
          }
          res(this)
        } else if (count > retries) {
          rej(timeout)
        } else { count++ }
      }, connect_timeout)
    }).catch(err => { throw new Error(err) })
  }

  close () {
    this.socket.close()
    this._subs = new Map()
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

  get_sub (sub_id : string) {
    const sub = this.subs.get(sub_id)
    if (sub === undefined) {
      throw new Error('subscription does not exist: ' + sub_id)
    }
    return sub
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

  publish (event : SignedEvent) {
    const { content, ...rest } = event

    this.log.info('event publish  :', rest.id)
    this.log.debug('send message  :', content)
    this.log.debug('send envelope :', rest)

    if (!this.is_connected) {
      this.log.info('buffered evt : ' + event.id)
      this._outbox.push(event)
    } else {
      this._publish([ event ])
    }
  }

  async query (
    address : string,
    filter  : EventFilter
  ) {
    const events : SignedEvent[] = []
    const sub = this.subscribe({ filter })
    sub.on('event', (event) => void events.push(event))
    sub.on('ready', (sub) => sub.cancel())
    this.connect(address)
    await sub.when_ready()
    return events
  }

  recover (event : SignedEvent) {
    const reckey = event.tags.find(e => e[0] === 'rec')
    if (reckey === undefined) throw new Error('recovery key not found')
    const preimg = event.content + String(event.created_at)
    const rec_id = Buff.str(preimg).digest.hex
    const cipher = this._signer.hmac('256', rec_id).hex
    return decrypt_content(reckey[1], cipher)
  }

  send (
    subject   : string,
    body      : unknown,
    envelope ?: Partial<SignedEvent>,
    recovery  = false
  ) {
    /** Send a data message to the relay. */
    const { kind, tags = [] } = envelope ?? {}
    const preimg  = stringify(body)
    const hash    = Buff.str(preimg).digest.hex
    const content = JSON.stringify([ subject, hash, body ])
    
    const event = {
      content    : content,
      created_at : now(),
      kind       : kind || this.opt.kind,
      tags       : [ ...this.tags, ...tags ],
      pubkey     : this.pubkey
    }

    if (this._secret !== undefined) {
      event.content = encrypt_content(content, this.secret)
      event.tags.push([ 'd', this.topic_id ])
    }

    if (recovery && this._secret !== undefined) {
      const preimg = event.content + String(event.created_at)
      const rec_id = Buff.str(preimg).digest.hex
      const cipher = this._signer.hmac('256', rec_id).hex
      const recstr = encrypt_content(this.secret.hex, cipher)
      event.tags.push([ 'rec', recstr ])
    }

    // Sign our message.
    const signed  = this.sign(event)
    // Create a receipt promise.
    const receipt = this.when_receipt(signed.id)
    // Publish the signed event.
    this.publish(signed)
    // Return the promises.
    return receipt
  }

  sign (event : Partial<SignedEvent>) {
    event.id  = get_event_id(event)
    event.sig = this._signer.sign(event.id)
    return event as SignedEvent
  }

  subscribe (config : Partial<SubscribeConfig> = {}) {
    /** Send a subscription message to the socket peer. */
    const filter  = config.filter as EventFilter
    const sub_id  = config.sub_id ?? Buff.random(32).hex
    const subdata = new NostrSub(this, { ...config, filter, sub_id })  

    this.subs.set(sub_id, subdata)

    if (this.is_connected) {
      this.log.info('buffered sub : ' + sub_id)
      this._subscribe([[ sub_id, subdata ]])
    }

    this.log.info('registered sub : ' + sub_id)
    this.log.debug('sub filter:', filter)
    
    return subdata
  }

  async when_cancel (sub_id : string) {
    const duration = this.opt.receipt_timeout
    const timeout  = 'cancel receipt timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('cancel', ([ id ]) => {
        if (id === sub_id) {
          this.log.info('cancel confirm  : ' + sub_id)
          clearTimeout(timer)
          res(id)
        }
      }, duration)
    }).catch(err => { throw new Error(err) })
  }

  async when_echo (event_id : string) {
    const duration = this.opt.echo_timeout
    const timeout  = 'echo listener timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('echo', async (id) => {
        if (id === event_id) {
          this.log.info('echo confirm    : ' + event_id)
          clearTimeout(timer)
          res(event_id)
        }
      }, duration)
    }).catch(err => { throw err })
  }

  async when_receipt (event_id : string) {
    const duration = this.opt.receipt_timeout
    const timeout  = 'message receipt timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('receipt', ([ id, ok, reason ]) => {
        if (id === event_id) {
          this.log.debug('event confirm  : ' + event_id)
          clearTimeout(timer)
          return (ok) ? res(id) : rej(reason)
        }
      }, duration)
    }).catch(err => { throw new Error(err) })
  }

  async when_sub (sub_id : string) {
    const duration = this.opt.receipt_timeout
    const timeout  = 'subscription receipt timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('subscribe', ([ id ]) => {
        if (id === sub_id) {
          this.log.debug('sub confirm    : ' + sub_id)
          clearTimeout(timer)
          res(id)
        }
      }, duration)
    }).catch(err => { throw new Error(err) })
  }

}

function get_event_id (event : Partial<SignedEvent>) {
  const preimg = JSON.stringify([
    0,
    event['pubkey'],
    event['created_at'],
    event['kind'],
    event['tags'],
    event['content'],
  ])
  return Buff.str(preimg).digest.hex
}

async function parse_note (
  note : unknown
) : Promise<SignedEvent | null> {
  const parser = schema.base.note
  const parsed = await parser.spa(note)
  return (parsed.success)
    ? parsed.data
    : null
}

export function encrypt_content (
  content : string,
  secret  : Bytes
) {
  const bytes   = Buff.str(content) 
  const vector  = Buff.random(16)
  const encoded = encrypt_cbc(bytes, secret, vector)
  return encoded.b64url + '?iv=' + vector.b64url
}

export function decrypt_content (
  content : string, 
  secret  : Bytes
) {
  const [ enc, iv ] = content.split('?iv=')
  const data   = Buff.b64url(enc)
  const vector = Buff.b64url(iv)
  return decrypt_cbc(data, secret, vector).str
}
