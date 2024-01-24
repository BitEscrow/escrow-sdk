import { parse_proposal } from '@/lib/parse.js'
import { EventEmitter }   from './emitter.js'
import { EscrowSigner }   from './signer.js'

import {
  create_proposal,
  find_program,
  get_proposal_id
} from '@/lib/proposal.js'

import {
  MemberData,
  ProgramQuery,
  ProposalData,
  ProposalTemplate,
  RolePolicy
} from '@/types/index.js'

import {
  add_membership,
  rem_membership
} from '../../lib/policy.js'

export class EscrowProposal extends EventEmitter<{
  'update' : EscrowProposal
}> {

  _data : ProposalData

  constructor (data : ProposalTemplate) {
    super()
    this._data = create_proposal(data)
  }

  get copy () {
    return new EscrowProposal(this.data)
  }

  get data () {
    return this._data
  }

  get id () {
    return get_proposal_id(this.data).hex
  }

  _update (data : ProposalData) {
    this._data = parse_proposal(data)
    this.emit('update', this)
  }

  join (
    role   : RolePolicy,
    member : EscrowSigner,
    index ?: number
  ) {
    const mdata = member.gen_membership(index)
    this.add_membership(mdata, role)
  }

  leave (member : EscrowSigner) {
    const mship = member.get_membership(this)
    this.rem_membership(mship.token)
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
