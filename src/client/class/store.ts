import { SignerAPI }    from '@/types/index.js'
import { EventEmitter } from './emitter.js'

import {
  NostrSocket,
  SOCKET_DEFAULTS
} from './socket.js'

import { EventMessage, StoreConfig } from '../types.js'

type Timeout = ReturnType<typeof setTimeout>

interface EventBus <T extends Record<string, any>> {
  error  : Error
  ready  : NostrStore<T>
  update : NostrStore<T>
}

const now = () => Math.floor(Date.now() / 1000)

const DEFAULT_OPT = {
  ...SOCKET_DEFAULTS(),
  buffer_timer  : 2000,
  commit_timer  : 5000,
  filter        : { limit : 10 },
  refresh_ival  : 5000,
  selfsub       : true,
  store_parser  : DEFAULT_PARSER,
  store_timeout : 5000,
}

async function DEFAULT_PARSER <T> (data : unknown) {
  return data as Promise<T | null>
}

export class NostrStore <T extends Record<string, any>> {

  readonly _emitter : EventEmitter<EventBus<T>>
  readonly _opt     : StoreConfig<T>
  readonly _parser  : (data : unknown) => Promise<T | null>

  _buffer     : Timeout | undefined
  _connected  : boolean
  _init       : boolean
  _prev       : Map<keyof T, T> | null
  _socket     : NostrSocket
  _store      : Map<keyof T, T> | null
  _store_id   : string | null
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
    this._connected  = false
    this._parser     = opt.store_parser
    this._init       = false
    this._prev       = null
    this._store      = null
    this._store_id   = null
    this._updated_at = null

    // Configure our underlying emitter object.
    this._socket     = new NostrSocket(signer, opt)

    // Our main event handler.
    this._socket.on('event', msg => {
      switch (msg.subject) {
        case 'update':
          this._update_handler(msg)
        default:
          break
      }
    })
  }

  get data () {
    return Object.fromEntries(this.entries()) as T
  }

  get diff () {
    const diffs = []
    for (const entry of this.prev) {
      const [ key, val ] = entry
      const new_val = this.store.get(key)
      if (new_val !== val) diffs.push(entry)
    }
    return new Map(diffs)
  }

  get id () {
    return this._store_id
  }

  get is_fresh () {
    // Check if our data store has expired.
    const { refresh_ival } = this.opt
    return (now() - this.updated_at) <= refresh_ival
  }

  get is_init () {
    return this._init
  }

  get opt () {
    return this._opt
  }

  get prev () {
    if (this._prev === null) {
      throw new Error('store not initialized')
    }
    return this._prev.entries()
  }

  get ready () {
    return this._socket.is_ready
  }

  get socket () {
    return this._socket
  }

  get store () {
    if (this._store === null) {
      throw new Error('store not initialized')
    }
    return new Map(this._store)
  }

  get store_id () {
    if (this._store_id === null) {
      throw new Error('store not initialized')
    }
    return this._store_id
  }

  get updated_at () {
    if (this._updated_at === null) {
      throw new Error('store not initialized')
    }
    return this._updated_at
  }

  async _commit (data : Map<keyof T, T>) {
    const curr    = this.data
    const json    = Object.fromEntries(data.entries())
    const updated = { ...curr, ...json }
    return this._push(updated)
  }

  async _push (data : T) {
    return new Promise((res, rej) => {
      const timeout = this.opt.commit_timer
      const encoded = JSON.stringify(data, json_encoder)
      const error   = new Error('commit operation timed out')
      const timer   = setTimeout(() => rej(error), timeout)
      this._socket.within('event', (msg) => {
        if (msg.body === encoded) {
          clearTimeout(timer)
          res(this)
        }
      }, timeout)
      this._socket.send('update', encoded)
    })
  }

  async _update_handler (msg : EventMessage) {
    // Define the message timestamp.
    const cat = msg.envelope.created_at
    // If store is initialized:
    if (this._updated_at !== null) {
      // If timestamp is old, ignore message.
      if (cat < this.updated_at) return
    }
    // Try to update the store.
    try {
      // Convert message body to json
      const json  = JSON.parse(msg.body, json_decoder)
      // Parse the json object.
      const store = await this._parser(json)
      // If parsing failed, ignore message.
      if (store === null) return
      // If store is initialized:
      if (this.is_init) {
        // Save a copy of current store.
        this._prev = this.store
      }
      // Set store with new data.
      this._store      = new Map(Object.entries(store))
      // Set store_id with new id.
      this._store_id   = msg.envelope.id
      // Set timestamp with new stamp.
      this._updated_at = cat
      // Clear the eisting message buffer.
      clearTimeout(this._buffer)
      // Set the buffer.
      this._buffer = setTimeout(() => {
        // If store is not initialized:
        if (!this.is_init) {
          // Set init to true.
          this._init = true
          // Print debug message to console.
          this.debug('init data:', this.data)
          // Emit ready message.
          this._emitter.emit('ready', this)
        } else {
          // Print debug message to console.
          this.debug('update data:', this.data)
          // Emit update message.
          this._emitter.emit('update', this)
        }
      }, this.opt.buffer_timer)
    } catch (err) {
      this._emitter.emit('error', err as Error)
    }
  }

  debug (...s : unknown[]) {
    return (this.opt.verbose) ? console.log(...s) : null
  }

  info (...s : unknown[]) {
    return (this.opt.silent)  ? null : console.log(...s)
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
      this._emitter.within('ready', () => {
        clearTimeout(timer)
        res(this)
      }, timeout)
      this._socket.connect(address, secret)
    })
  }

  async init (address : string, secret : string, store : T) {
    await this._socket.connect(address, secret)
    return this.reset(store)
  }

  async refresh () {
    // If the data is stale, resub to the relay.
    if (!this.is_fresh) {
      await this._socket.subscribe()
    }
  }

  async commit (data : Partial<T>) {
    const tmp = new Map(Object.entries(data))
    return this._commit(tmp)
  }

  async has (key : keyof T) {
    await this.refresh()
    return this.store.has(key)
  }

  async get (key : keyof T) {
    await this.refresh()
    return this.store.get(key)
  }

  async set <K extends keyof T> (
    key : K,
    val : T[K]
  ) {
    if (this.get(key) === val) {
      return
    }
    const tmp = this.store.set(key, val)
    return this._commit(tmp)
  }

  async delete (key : string) {
    const tmp = this.store
    const ok  = tmp.delete(key)
    const obj = Object.fromEntries(tmp.entries())
    return (ok)
      ? this._push(obj as T) 
      : this
  }

  async reset (data : T) {
    return this._push(data)
  }

  async destroy () {
    await this.refresh()
    await this._socket.delete(this.store_id)
    return
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