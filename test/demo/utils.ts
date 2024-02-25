import { EventEmitter } from '@/client/class/emitter.js'

export class Logger extends EventEmitter <{
  'log'    : unknown[],
  'pause'  : undefined,
  'resume' : undefined
}> {

  constructor () {
    super()
  }

  log (...msg : unknown[]) {
    this.emit('log', msg)
  }

  pause () {
    this.emit('pause', undefined)
  }

  resume () {
    this.emit('resume', undefined)
  }
}
