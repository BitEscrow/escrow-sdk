import { Buff }         from '@cmdcode/buff'
import { stringify }    from '@/lib/util.js'
import { SignerAPI }    from '@/types/index.js'
import { EventEmitter } from './emitter.js'

import {
  NostrSocket,
  SOCKET_DEFAULTS
} from './socket.js'

import {
  EventFilter,
  EventMessage,
  StoreConfig
} from '../types.js'

const now = () => Math.floor(Date.now() / 1000)

const DEFAULT_OPT = {
  ...SOCKET_DEFAULTS(),
  buffer_timer : 2000,
  filter       : { limit : 10 } as EventFilter,
  kind         : 30000,
  refresh_ival : 10,
  update_timer : 5000
}

async function DEFAULT_PARSER <T> (data : unknown) {
  return data as Promise<T>
}

export class NostrStore <T extends Record<string, any>> extends EventEmitter<{
  'commit' : string
  'error'  : Error
  'ready'  : NostrStore<T>
  'update' : NostrStore<T>
}> {

  readonly _opt    : StoreConfig<T>
  readonly _parser : (data : unknown) => Promise<T>

  _buffer    ?: ReturnType<typeof setTimeout>
  _commit_id  : string | null
  _data       : T      | null
  _init       : boolean
  _prev       : T      | null
  _socket     : NostrSocket
  _updated    : number | null

  constructor(
    signer  : SignerAPI,
    config ?: Partial<StoreConfig<T>>
  ) {
    const opt = { ...DEFAULT_OPT, ...config, selfsub : true, }
    super()
    this._opt        = opt
    this._buffer     = undefined
    this._data       = null
    this._init       = false
    this._parser     = opt.parser ?? DEFAULT_PARSER
    this._prev       = null
    this._commit_id  = null
    this._updated    = null

    // Configure our underlying emitter object.
    this._socket     = new NostrSocket(signer, opt)

    this._socket.on('error', (err) => this.emit('error', err))

    // Our main event handler.
    this._socket.on_event<T>('post', async (msg) => {
      try {
        if (!this._filter(msg) || !this._validate(msg.body)) {
          this.log.info(' msg bounced    :', msg.envelope.id)
        } else {
          this._msg_handler(msg)
        }
      } catch (err) {
        return this._err_handler(err as Error)
      }
    })
  }

  get commit_id () {
    if (this._commit_id === null) {
      throw new Error('store is not initialized')
    }
    return this._commit_id
  }
 
  get data () {
    if (this._data === null) {
      throw new Error('store is not initialized')
    }
    return this._data
  }

  get is_init () {
    return this._init
  }

  get is_ready () {
    return this._socket.is_ready
  }

  get is_stale () {
    // Check if our subscription is stale.
    const ival = this.opt.refresh_ival
    return now() > this.updated_at + ival
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

  get store_id () {
    const body = stringify(this.data)
    return Buff.str(body).digest.hex
  }

  get updated_at () {
    if (this._updated === null) {
      throw new Error('store not initialized')
    }
    return this._updated
  }

  log = {
    debug : (...s : unknown[]) => {
      return (this.opt.debug) ? console.log('[store]', ...s) : null
    },
    info  : (...s : unknown[]) => {
      return (this.opt.verbose)  ? console.log('[store]', ...s) : null
    }
  }

  _filter (msg : EventMessage) {
    const { body, envelope, hash } = msg
    if (body === null || body === undefined) {
      return false 
    }
    if (this._updated !== null) {
      const cat = envelope.created_at
      if (this.updated_at > cat) {
        return false
      }
    }
    if (this.is_init) {
      const id = this._commit_id
      if (id === envelope.id || hash === this.store_id) {
        return false
      }
    }
    return true
  }

  async _commit (data : T, updated = now()) {
    if (!this.is_init || updated > this.updated_at) {
      clearTimeout(this._buffer)
      if (this._socket.is_subscribed) {
        this._buffer = setTimeout(() => {
          this._socket.cancel()
          this._update(data)
        }, this.opt.buffer_timer)
      } else {
        this._update(data)
      }
    }
    this._updated = updated
  }

  async _err_handler (err : unknown) {
    this._socket._err_handler(err)
  }

  async _msg_handler (msg : EventMessage) {
    const { body, envelope } = msg
    // Validate incoming data.
    const json   = JSON.parse(body, json_decoder)
    const parsed = await this._parser(json)
    this._commit(parsed, envelope.created_at)
  }

  async _send (method : string, data : unknown) {
    const parsed   = await this._parser(data)
    this.log.info(' store method   :', method)
    this.log.info(' store data     :', parsed)
    const encoded  = JSON.stringify(parsed, json_encoder)
    return this._socket.send(method, encoded)
  }

  _update (data : T) {
    this._prev = this._data ?? data
    this._data = data
    if (!this.is_init) {
      // Set init to true.
      this._init = true
      // Emit ready message.
      this.emit('ready', this)
    } else {
      this._send('post', data)
    }
    // Print debug message to console.
    this.log.debug('update data:', this.data)
    // Emit update message.
    this.emit('update', this)
  }

  async _validate (data : T) {
    try {
      await this._parser(data)
      return true
    } catch {
      return false
    }
  }

  async connect (address : string, secret : string) {
    const receipt = this.on_update()
    await this._socket.connect(address, secret)
    return receipt
  }

  async commit (id : string, data : Partial<T>) {
    const parsed = await this._parser(data)
    this._commit({ ...this.data, ...parsed })
    this.log.info(' create commit  :', id)
    this.emit('commit', id)
    return this
  }

  async init (address : string, secret : string, store : T) {
    this._update(store)
    this._updated = now()
    await this._socket.connect(address, secret)
    return this
  }

  async on_commit (commit_id : string) {
    const duration = this.opt.update_timer
    const timeout  = 'store update timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('commit', (id) => {
        if (id === commit_id) {
          this.log.info(' confirm commit  :', commit_id)
          clearTimeout(timer)
          res(this)
        }
      }, duration)
    }).catch(err => { throw new Error(err) })
  }

  async on_update () {
    const duration = this.opt.update_timer
    const timeout  = 'store update timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('update', () => {
        clearTimeout(timer)
        res(this)
      }, duration)
    }).catch(err => { throw new Error(err) })
  }

  async refresh () {
    // If the data is stale, resub to the relay.
    if (this.is_stale) {
      const receipt = this.on_update()
      await this._socket.subscribe()
      await receipt
    }
    return this.data
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
