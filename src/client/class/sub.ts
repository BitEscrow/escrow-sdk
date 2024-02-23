import { EventEmitter } from './emitter.js'
import { NostrSocket }  from './socket.js'

import {
  EventFilter,
  EventMessage,
  SubscribeConfig
} from '../types.js'

import { SignedEvent } from '@/types/index.js'

export class NostrSub extends EventEmitter <{
  'cancel'  : NostrSub
  'event'   : SignedEvent
  'message' : EventMessage
  'ready'   : NostrSub
}> {

  readonly _echo   : boolean
  readonly _socket : NostrSocket
  readonly _sub_id : string

  _envelope : Partial<SignedEvent>
  _filter   : EventFilter
  _init     : boolean

  constructor (
    socket : NostrSocket,
    config : SubscribeConfig
  ) {
    super()
    this._echo     = config.selfsub ?? false
    this._socket   = socket
    this._sub_id   = config.sub_id
    this._envelope = config.envelope ?? {}
    this._filter   = config.filter   ?? this._socket.opt.filter
    this._init     = false
  }

  get envelope () {
    return this._envelope
  }

  get filter () {
    return this._filter
  }

  get id () {
    return this._sub_id
  }

  get is_echo () {
    return this._echo
  }

  get is_ready () {
    return this._init
  }

  cancel () {
    this._socket.cancel(this.id)
  }

  on_msg <T> (
    subject : string,
    handler : (msg : EventMessage<T>) => void | Promise<void>
  ) {
    this.on('message', msg => {
      if (msg.subject === subject) {
        handler(msg)
      }
    })
  }

  send <T> (
    subject   : string, 
    body      : T, 
    envelope ?: Partial<SignedEvent>,
    recovery ?: boolean
  ) {
    envelope = { ...this.envelope, ...envelope }
    return this._socket.send(subject, body, envelope, recovery)
  }

  async update (filter ?: EventFilter) {
    filter = { ...this.filter, ...filter }
    const envelope = this.envelope
    const sub_id   = this.id
    const config   = { envelope, filter, sub_id }
    return this._socket.subscribe(config)
  }

  when_cancel () {
    return this._socket.when_cancel(this.id)
  }

  when_ready () {
    return this._socket.when_sub(this.id)
  }
}
