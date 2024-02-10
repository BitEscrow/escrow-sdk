import { Buff }         from '@cmdcode/buff'
import { stringify }    from '@/lib/util.js'
import { SignerAPI }    from '@/types/index.js'
import { EventEmitter } from './emitter.js'

import {
  NostrSocket,
  SOCKET_DEFAULTS
} from './socket.js'

import {
  EventMessage,
  StoreConfig
} from '../types.js'

interface EventBus <T extends Record<string, any>> {
  error  : Error
  ready  : NostrStore<T>
  update : NostrStore<T>
}

const now = () => Math.floor(Date.now() / 1000)

const DEFAULT_OPT = {
  ...SOCKET_DEFAULTS(),
  buffer_timer    : 2000,
  commit_timer    : 5000,
  default_filter  : { limit : 10 },
  refresh_ival    : 5000,
  selfsub         : true
}

async function DEFAULT_PARSER <T> (data : unknown) {
  return data as Promise<T>
}

export class NostrStore <T extends Record<string, any>> {

  readonly _emitter   : EventEmitter<EventBus<T>>
  readonly _opt       : StoreConfig<T>
  readonly _parser    : (data : unknown) => Promise<T>

  _buffer    ?: ReturnType<typeof setTimeout>
  _commit_id  : string | null
  _data       : T | null
  _init       : boolean
  _prev       : T | null
  _socket     : NostrSocket
  _updated_at : number | null

  constructor(
    signer  : SignerAPI,
    config ?: Partial<StoreConfig<T>>
  ) {
    const opt = { ...DEFAULT_OPT, ...config }
    // Configure our store object.
    this._emitter    = new EventEmitter()
    this._opt        = opt
    this._buffer     = undefined
    this._data       = null
    this._init       = false
    this._parser     = opt.parser ?? DEFAULT_PARSER
    this._prev       = null
    this._commit_id  = null
    this._updated_at = null

    // Configure our underlying emitter object.
    this._socket     = new NostrSocket(signer, opt)

    this._socket.on('error', (err) => this.emit('error', err))

    // Our main event handler.
    this._socket.on('event', async (msg) => {
      try {
        if (!this._filter(msg) || !this._validate(msg.body)) {
          this.debug('msg bounced:', msg.envelope.id)
        } else {
          this._commit_id = msg.envelope.id
          this._req_handler(msg)
          this._updated_at = msg.envelope.created_at
        }
      } catch (err) {
        return this._err_handler(err as Error)
      }
    })
  }
 
  get data () {
    if (this._data === null) {
      throw new Error('store is not initialized')
    }
    return this._data
  }

  get hash () {
    const body = stringify(this.data)
    return Buff.str(body).digest.hex
  }

  get is_init () {
    return this._init
  }

  get is_ready () {
    return this._socket.is_ready
  }

  get is_stale () {
    // Check if our subscription is stale.
    const { refresh_ival } = this.opt
    return now() > this.updated_at + refresh_ival
  }

  get opt () {
    return this._opt
  }

  get pubkey () {
    return this._socket.pubkey
  }

  get socket () {
    return this._socket
  }

  get store () {
    return new Map(Object.entries(this.data))
  }

  get updated_at () {
    if (this._updated_at === null) {
      throw new Error('store not initialized')
    }
    return this._updated_at
  }

  _filter (msg : EventMessage) {
    const { body, envelope, hash } = msg
    if (body === null || body === undefined) {
      return false 
    }
    if (this._updated_at !== null) {
      const cat = envelope.created_at
      if (this.updated_at > cat) {
        return false
      }
    }
    if (this.is_init) {
      const id = this._commit_id
      if (id === envelope.id || hash === this.hash) {
        return false
      }
    }
    return true
  }

  async _validate (data : T) {
    try {
      await this._parser(data)
      return true
    } catch {
      return false
    }
  }

  async _send (method : string, data : unknown) {
    const parsed  = await this._parser(data)
    const encoded = JSON.stringify(parsed, json_encoder)
    return this._socket.send(method, encoded)
  }

  async _req_handler (msg : EventMessage) {
    try {
      const json = JSON.parse(msg.body, json_decoder)
      if (!this.is_init) {
        return this._post_handler(json)
      } else {
        switch (msg.subject) {
          case 'patch':
            return this._patch_handler(json)
          case 'post':
            return this._post_handler(json)
          default:
            const err = 'invalid method: ' + msg.subject
            return this._err_handler(new Error(err))
        }
      }
    } catch (err) {
      return this._err_handler(err as Error)
    }
  }

  async _err_handler (err : unknown) {
    this._socket._err_handler(err)
  }

  async _patch_handler (data : Partial<T>) {
    const patched = { ...this.data, ...data }
    this._update_handler(patched)
  }

  async _post_handler (data : Partial<T>) {
    this._update_handler(data)
  }

  async _update_handler (data : unknown) {
    // Validate incoming data.
    const parsed = await this._parser(data)
    //
    this._prev = this._data ?? parsed
    // Set store with new data.
    this._data = parsed
    if (!this.is_init) {
      // If store is not initialized, return early.
      clearTimeout(this._buffer)
      //
      this._buffer = setTimeout(() => {
        // Set init to true.
        this._init = true
        // Print debug message to console.
        this.debug('init data:', this.data)
        // Emit ready message.
        this.emit('ready', this)
      }, 1000)
    } else {
      // Print debug message to console.
      this.debug('update data:', this.data)
      // Emit update message.
      this.emit('update', this)
    }
  }

  debug (...s : unknown[]) {
    return (this.opt.verbose) ? console.log(...s) : null
  }

  info (...s : unknown[]) {
    return (this.opt.silent)  ? null : console.log(...s)
  }

  emit <K extends keyof EventBus<T>> (
    event : K, 
    args  : EventBus<T>[K]
  ) {
    return this._emitter.emit(event, args)
  }

  on <K extends keyof EventBus<T>> (
    event   : K,
    handler : (data : EventBus<T>[K]) => void | Promise<void>
  ) {
    this._emitter.on(event, handler)
  }

  async connect (address : string, secret : string) {
    return new Promise((res, rej) => {
      const timeout = this.opt.commit_timer
      const error   = new Error('commit operation timed out')
      const timer   = setTimeout(() => rej(error), timeout)
      this._socket.within('ready', () => {
        clearTimeout(timer)
        res(this)
      }, timeout)
      this._socket.connect(address, secret)
    })
  }

  async init (address : string, secret : string, store : T) {
    await this._socket.connect(address, secret)
    return this.post(store)
  }

  async refresh () {
    // If the data is stale, resub to the relay.
    if (this.is_stale) {
      await this._socket.subscribe()
    }
    return this.data
  }

  async patch (data : Partial<T>) {
    const parsed  = await this._parser(data)
    await this._send('patch', parsed)
    return this
  }

  async post (data : T) {
    const parsed = await this._parser(data)
    await this._send('post', parsed)
    return this
  }

  keys () {
    return this.store.keys()
  }
  
  values () {
    return this.store.values()
  }

  entries () {
    return this.store.entries()
  }

  toString () {
    return JSON.stringify(this.data, null, 2)
  }

  toJSON () {
    return this.data
  }

  [Symbol.iterator] () {
    return this.store[Symbol.iterator]()
  }
}

function json_encoder (_key : string, value : any) {
  // Convert non-standard javascript objects to json.
  if (value instanceof Map)
    return { type: 'Map', value: [ ...value ] }
  if (value instanceof Date)
    return { type: 'Date', value: value }
  return value
}

function json_decoder (_key : string, value : any) {
  // Convert non-standard json objects to javascript.
  if (typeof value === 'object' && value !== null) {
    if (value.type === 'Map') return new Map(value.value)
    if (value.type === 'Date') return new Date(value.value)
  }
  return value
}
