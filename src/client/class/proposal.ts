import { find_program } from '@/lib/proposal.js'

import {
  MemberData,
  ProgramQuery,
  ProposalData,
  RolePolicy
} from '@/types/index.js'

import {
  add_membership,
  rem_membership
} from '../../lib/policy.js'

import EventEmitter from './emitter.js'

export class Proposal extends EventEmitter<{
  'update' : Proposal
}> {

  _data : ProposalData

  constructor (data : ProposalData) {
    super()
    this._data = data
  }

  get data () {
    return this._data
  }

  _update (data : ProposalData) {
    this._data = data
    this.emit('update', this)
  }

  get_program (query : ProgramQuery) {
    return find_program(query, this.data.programs)
  }

  add_membership (mship : MemberData, role : RolePolicy) {
    const prop = add_membership(mship, role, this.data)
    this._update(prop)
  }

  rem_membership (mship : MemberData, leave = true) {
    const prop = rem_membership(mship, this.data, leave)
    this._update(prop)
  }

  toJSON () {
    return this.data
  }

  toString () {
    return JSON.stringify(this.data)
  }
}