import { has_full_enrollment } from '@/lib/policy.js'
import { validate_draft }      from '@/validators/policy.js'
import { EventEmitter }        from './emitter.js'
import { EscrowSigner }        from './signer.js'
import { NostrStore }          from './store.js'

import draft_member_api from '../api/draft/member.js'
import draft_policy_api from '../api/draft/policy.js'

import {
  find_program,
  get_proposal_id
} from '@/lib/proposal.js'

import {
  DraftData,
  MemberData,
  ProgramQuery,
  ProposalData,
  RolePolicy,
} from '@/types/index.js'

import { StoreConfig } from '../types.js'

export class DraftSession extends EventEmitter <{
  'endorse'    : string
  'error'      : Error
  'join'       : DraftSession
  'leave'      : DraftSession
  'members'    : MemberData[]
  'proposal'   : ProposalData
  'ready'      : DraftSession
  'roles'      : RolePolicy[]
  'signatures' : string[]
  'update'     : DraftSession
}> {

  readonly _signer : EscrowSigner
  readonly _store  : NostrStore<DraftData>

  constructor (
    signer  : EscrowSigner, 
    config ?: Partial<StoreConfig<DraftData>>
  ) {
    const opt = { silent : true, ...config }
    super()
    this._signer = signer
    this._store  = new NostrStore(signer._signer, opt)

    this._store.on('ready', () => { this.emit('ready', this) })

    this._store.on('update', () => {
      this.emit('update', this)
      if (this._store.diff.has('members')) {
        this.emit('members', this.members)
      }
      if (this._store.diff.has('roles')) {
        this.emit('roles', this.roles)
      }
      if (this._store.diff.has('proposal')) {
        this.emit('proposal', this.proposal)
      }
      if (this._store.diff.has('signatures')) {
        this.emit('signatures', this.signatures)
      }
    })
  }

  get data () {
    return this._store.data
  }

  get members () {
    return this.data.members
  }

  get proposal () {
    return this.data.proposal
  }

  get prop_id () {
    return get_proposal_id(this.proposal)
  }

  get is_full () {
    return has_full_enrollment(this.members, this.roles)
  }

  get is_ready () {
    try {
      this.validate()
      return this.is_full
    } catch {
      return false
    }
  }

  get roles () {
    return this.data.roles
  }

  get signatures () {
    return this.data.signatures
  }

  get signer () {
    return this._signer
  }

  async _commit (session : Partial<DraftData>) {
    const draft = { ...this.data, ...session }
    validate_draft(draft)
    return this._store.commit(draft)
  }

  async connect (address : string, secret : string) {
    return this._store.connect(address, secret)
  }

  async commit (session : Partial<DraftData>) {
    return this._commit(session)
  }

  membership = draft_member_api(this)
  role       = draft_policy_api(this)

  endorse () {
    const draft = this.signer.draft.endorse(this.data)
    return this._commit(draft)
  }

  find_program (query : ProgramQuery) {
    return find_program(query, this.proposal.programs)
  }

  async init (
    address : string, 
    secret  : string,
    store   : DraftData
  ) {
    return this._store.init(address, secret, store)
  }

  async reset (draft : DraftData) {
    return this._store.reset(draft)
  }

  toJSON () {
    return this.data
  }

  toString () {
    return JSON.stringify(this.data)
  }

  validate () {
    validate_draft(this.data)
  }
}
