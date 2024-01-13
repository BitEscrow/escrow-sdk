import { find_program } from '@/lib/witness.js'

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

export class Proposal {

  _data : ProposalData

  constructor (data : ProposalData) {
    this._data = data
  }

  get data () {
    return this._data
  }

  get_program (query : ProgramQuery) {
    return find_program(query, this.data.programs)
  }

  add_membership (mship : MemberData, role : RolePolicy) {
    this._data = add_membership(mship, role, this.data)
  }

  rem_membership (mship : MemberData, leave = true) {
    this._data = rem_membership(mship, this.data, leave)
  }

  toJSON () {
    return this.data
  }

  toString () {
    return JSON.stringify(this.data)
  }
}