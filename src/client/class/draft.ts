import { verify_endorsement }  from '@/lib/member.js'
import { has_full_enrollment } from '@/lib/policy.js'
import { is_hash }             from '@/lib/util.js'
import { verify_proposal }     from '@/validators/proposal.js'
import { EventEmitter }        from './emitter.js'
import { EscrowSigner }        from './signer.js'
import { NostrStore }          from './store.js'
import { StoreConfig }         from '../types.js'
import { EscrowContract }      from './contract.js'
import { EscrowClient }        from './client.js'
import { NostrSocket }         from './socket.js'

import draft_endorse_api from '../api/draft/endorse.js'
import draft_member_api  from '../api/draft/member.js'
import draft_policy_api  from '../api/draft/policy.js'
import draft_signer_api  from '../api/draft/mship.js'

import {
  find_program,
  get_proposal_id
} from '@/lib/proposal.js'

import {
  validate_draft,
  verify_draft
} from '@/validators/policy.js'

import {
  DraftData,
  MemberData,
  ProgramQuery,
  ProposalData,
  RolePolicy,
} from '@/types/index.js'

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
  'publish'    : string
}> {

  readonly _signer : EscrowSigner
  readonly _socket : NostrSocket
  readonly _store  : NostrStore<DraftData>

  constructor (
    signer  : EscrowSigner, 
    config ?: Partial<StoreConfig<DraftData>>
  ) {
    const opt = { silent : true, ...config }

    super()

    this._signer = signer
    this._socket = new NostrSocket(signer._signer, { ...opt, default_kind : 20000, selfsub : true })
    this._store  = new NostrStore(signer._signer, opt)
    this._socket.on('error', (err)   => { this.emit('error', err)  })
    this._store.on('error',  (err)   => { this.emit('error', err)  })
    this._store.on('ready',  ()      => { this.emit('ready', this) })

    this._socket.on('event', (msg) => {
      switch (msg.subject) {
        case 'publish':
          if (!is_hash(msg.body)) return
          this.emit('publish', msg.body)
          break
        default:
          break
      }
    })

    this._store.on('update', (draft) => {
      try {
        validate_draft(draft.data)
        verify_draft(draft.data)
        this.emit('update', this)
      } catch (err) {
        this._store._err_handler(err)
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

  get pubkey () {
    return this.signer.pubkey
  }

  get is_endorsed () {
    const sig = this.signatures.find(e => {
      return e.slice(0, 64) === this.pubkey
    })
    return (sig !== undefined && verify_endorsement(this.prop_id, sig, true))
  }

  get is_full () {
    return has_full_enrollment(this.members, this.roles)
  }

  get is_member () {
    return this.signer.credential.exists(this.members)
  }

  get is_moderated () {
    return this.proposal.moderator !== undefined
  }

  get is_moderator () {
    return this.proposal.moderator === this.pubkey
  }

  get is_ready () {
    return this._store.is_ready
  }

  get is_valid () {
    try {
      this.verify()
      return true
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

  endorse    = draft_endorse_api(this) 
  membership = draft_signer_api(this)

  moderator  = {
    member : draft_member_api(this),
    policy : draft_policy_api(this)
  }

  async commit (session : Partial<DraftData>) {
    return this._store.patch(session)
  }

  async connect (address : string, secret : string) {
    await Promise.all([
      this._socket.connect(address, secret),
      this._store.connect(address, secret)
    ])
    return this
  }

  find_program (query : ProgramQuery) {
    return find_program(query, this.proposal.programs)
  }

  async init (
    address : string, 
    secret  : string,
    store   : DraftData
  ) {
    await this.connect(address, secret)
    return this.reset(store)
  }

  async publish (client : EscrowClient) {
    verify_proposal(this.data.proposal)
    const contract = await EscrowContract.create(client, this.data)
    this._socket.send('publish', contract.cid)
    return contract
  }

  async reset (draft : DraftData) {
    return this._store.post(draft)
  }

  toJSON () {
    return this.data
  }

  toString () {
    return JSON.stringify(this.data)
  }

  verify () {
    validate_draft(this.data)
    verify_draft(this.data)
  }
}
