import { Buff }         from '@cmdcode/buff'
import { stringify }    from '@/lib/util.js'
import { EventEmitter } from '../../src/client/class/emitter.js'
import { NostrSub }     from './sub.js'

import {
  NostrSocket,
  SOCKET_DEFAULTS
} from './socket.js'

import {
  EventFilter,
  EventMessage,
  StoreConfig
} from '../../src/client/types.js'

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
  'reject' : EventMessage<T>
  'update' : NostrStore<T>
}> {

  readonly _opt    : StoreConfig<T>
  readonly _parser : (data : unknown) => Promise<T>

  _buffer    ?: ReturnType<typeof setTimeout>
  _commit_id  : string   | null
  _data       : T        | null
  _init       : boolean
  _outbox    ?: ReturnType<typeof setTimeout>
  _prev       : T        | null
  _socket     : NostrSocket
  _sub        : NostrSub | null
  _updated    : number   | null

  constructor (
    socket  : NostrSocket,
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
    this._socket     = socket
    this._sub        = socket.subscribe({
      envelope : { kind  : 30000 },
      filter   : { limit : 1 },
      selfsub  : true
    })

    this._socket.on('error', (err) => this.emit('error', err))

    this.sub.on('message', (msg : EventMessage<T>) => {
      try {
        if (!this._msg_filter(msg) || !this._validate(msg.body)) {
          this._bounce_handler(msg)
        } else {
          this._msg_handler(msg)
        }
      } catch (err) {
        this._err_handler(err)
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

  get is_ready () {
    return this._init
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

  get sub () {
    if (this._sub === null) {
      throw new Error('store not subscribed')
    }
    return this._sub
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

  _bounce_handler (msg : EventMessage<T>) {
    this.log.info(' msg bounced    :', msg.envelope.id)
    this.emit('reject', msg)
  }

  async _err_handler (err : unknown) {
    this._socket._err_handler(err)
  }

  _initialize (data : T) {
    this._updated = now()
    this._prev    = this._data ?? data
    this._data    = data
    this._init    = true
    this._socket.subs.delete(this.sub.id)
    this._socket.on('connect', () => {
      this._send('post', data)
    })
    this._socket.on('ready', () => {
      this.emit('ready', this)
    })
  }

  _msg_filter (msg : EventMessage) {
    const { body, envelope } = msg
    if (body === null || body === undefined) {
      return false 
    }
    if (this._updated !== null) {
      const cat = envelope.created_at
      if (this.updated_at > cat) {
        return false
      }
    }
    return true
  }

  async _msg_handler (msg : EventMessage) {
    const { body, envelope } = msg
    const cat = envelope.created_at
    try {
      if (!this.is_ready || cat > this.updated_at) {
        this._updated = cat
        clearTimeout(this._buffer)
        this._buffer = setTimeout(() => {
          this.sub.cancel()
          this._msg_update(body, cat)
        }, this.opt.buffer_timer)
      }
    } catch (err) {
      this._err_handler(err)
    }
  }

  async _msg_update (data : unknown, created_at : number) {
    const json = (typeof data === 'string')
      ? JSON.parse(data, json_decoder)
      : data
    const parsed = await this._parser(json)
    this._update(parsed, created_at)
  }

  async _send (method : string, data : unknown) {
    clearTimeout(this._outbox)
    this._outbox = setTimeout(async () => {
      const parsed  = await this._parser(data)
      const encoded = JSON.stringify(parsed, json_encoder)
      this.log.info(' store method   :', method)
      this.log.info(' store data     :', parsed)
      this.sub.send(method, encoded, undefined, true)
    }, this.opt.buffer_timer)
  }

  _update (data : T, updated = now()) {
    this._updated = updated
    this._prev    = this._data ?? data
    this._data    = data
    if (!this.is_ready) {
      // Set init to true.
      this._init = true
      // Emit ready message.
      this.emit('ready', this)
    } else {
      this._send('post', data)
      this.emit('update', this)
    }
    // Print debug message to console.
    this.log.debug('update data:', this.data)
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
    await this._socket.connect(address, secret)
    return this
  }

  async init (address : string, secret : string, store : T) {
    // Initialize the store
    this._initialize(store)
    // Wait for a connection to the relay.
    await this._socket.connect(address, secret)
    // Return the store object.
    return this
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
    const receipt = this.sub.when_ready()
    this.sub.update()
    return receipt
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
