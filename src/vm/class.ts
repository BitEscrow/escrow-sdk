import { Literal } from '@/types.js'

import {
  VMConfig,
  VMData,
  WitnessData
} from '@/core/types/index.js'

import { check_params } from './lib/program.js'

import {
  eval_schedule,
  eval_witness,
  get_vmdata,
  init_vm
} from './lib/main.js'

import { VMState } from './types.js'

export class VirtualMachine {
  _state  : VMState

  static check = check_params

  constructor (config : VMConfig) {
    this._state = init_vm(config)
  }

  get active () {
    return this._state.output === null
  }

  get data () : VMData {
    return get_vmdata(this._state)
  }

  get methods () {
    return [ 'endorse' ]
  }

  get state () {
    return this._state
  }

  check (method : string, params : Literal[]) {
    return check_params(method, params)
  }

  eval (witness : WitnessData, marker ?: number) {
    if (!this.active) return this.data
    const state = eval_witness(this._state, witness, marker)
    if (state.error === null) this._state = state
    return get_vmdata(state)
  }

  run (marker ?: number) {
    if (!this.active) return this.data
    const state = eval_schedule(this._state, marker)
    if (state.error === null) this._state = state
    return get_vmdata(state)
  }
}
