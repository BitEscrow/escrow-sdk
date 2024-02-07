/**
 *  ## EventEmitter
 *
 *  Type-safe implementation of a
 *  standard event emitter object.
 *
 * */

export class EventEmitter <T extends Record<string, any> = {}> {
  readonly _events : Map<keyof T, Set<Function>>

  constructor () {
    this._events = new Map()
  }

  _get_methods (event : string) : Set<Function> {
    /** 
     * If key undefined, create a new set for the event,
     * else return the stored subscriber list.
     */
    const label  = String(event)
      let events = this._events.get(label)

    if (events === undefined) {
      events = new Set()
      this._events.set(label, events)
    }

    return events
  }

  has <K extends keyof T> (topic : K) : boolean {
    const res = this._events.get(topic)
    return (res instanceof Set && res.size > 0)
  }

  on <K extends string & keyof T> (
    event  : K, 
    method : (args : T[K]) => void | Promise<void>
  ) : void {
    /** 
     * Subscribe function to run on a given event.
     */
    this._get_methods(event).add(method)
  }

  once <K extends string & keyof T> (
    event  : K,
    method : (args : T[K]) => void | Promise<void>
  ) : void {
    /** 
     * Subscribe function to run once, using
     * a callback to cancel the subscription.
     */
    const onceFn = (args : T[K]) : void => {
      this.remove(event, onceFn)
      void method.apply(this, [ args ])
    }

    this.on(event, onceFn)
  }

  within <K extends string & keyof T> (
    event   : K,
    method  : (args : T[K]) => void | Promise<void>,
    timeout : number
  ) : void {
    /** Subscribe function to run within a given,
     *  amount of time, then cancel the subscription.
     * */
    const withinFn = (args : T[K]) : void => {
      void method.apply(this, [ args ])
    }
    setTimeout(() => { this.remove(event, withinFn) }, timeout)

    this.on(event, withinFn)
  }

  emit <K extends string & keyof T> (
    event : K,
    args  : T[K]
  ) : void {
    /** Emit a series of arguments for the event, and
     *  present them to each subscriber in the list.
     * */
    const methods : Function[] = []
    this._get_methods(event).forEach(fn => {
      methods.push(fn.apply(this, [ args ]))
    })

    this._get_methods('*').forEach(fn => {
      methods.push(fn.apply(this, [ event, args ]))
    })

    void Promise.allSettled(methods)
  }

  remove <K extends keyof T> (
    event  : string,
    method : (args : T[K]) => void | Promise<void>
  ) : void {
    /** Remove function from an event's subscribtion list. */
    this._get_methods(event).delete(method)
  }

  clear (event : string) : void {
    this._events.delete(event)
  }
}
