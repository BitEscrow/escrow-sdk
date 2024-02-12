import { Buff }            from '@cmdcode/buff'
import { verify_proposal } from '@/validators/proposal.js'
import { EventEmitter }    from './emitter.js'
import { EscrowSigner }    from './signer.js'
import { NostrStore }      from './store.js'
import { EscrowContract }  from './contract.js'
import { EscrowClient }    from './client.js'
import { NostrSocket }     from './socket.js'

import {
  EventMessage,
  SessionConfig
} from '../types.js'

import {
  get_membership,
  has_membership,
  verify_endorsement
}  from '@/lib/member.js'

import {
  has_full_enrollment,
  join_role,
  rem_enrollment
} from '@/lib/policy.js'

import {
  get_object_id,
  is_hash
} from '@/lib/util.js'

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

import * as assert from '@/assert.js'

export class DraftSession extends EventEmitter <{
  'endorse'    : string
  'error'      : Error
  'join'       : DraftSession
  'leave'      : DraftSession
  'members'    : MemberData[]
  'proposal'   : ProposalData
  'ready'      : DraftSession
  'reject'     : [ method : string, pub : string, reason :string ]
  'roles'      : RolePolicy[]
  'signatures' : string[]
  'update'     : DraftSession
  'publish'    : string
}> {
  
  readonly _opt    : SessionConfig
  readonly _signer : EscrowSigner
  readonly _socket : NostrSocket
  readonly _store  : NostrStore<DraftData>

  constructor (
    signer   : EscrowSigner, 
    options ?: Partial<SessionConfig>
  ) {
    const { socket_config, store_config, ...opt } = options ?? {}
    const socket_opt = { ...socket_config, selfsub : true,  }
    const store_opt  = { ...store_config }

    super()

    this._opt    = { debug : false, verbose : false, ...opt }
    this._signer = signer
    this._socket = new NostrSocket(signer._signer, socket_opt)
    this._store  = new NostrStore(signer._signer, store_opt)
    this._socket.on('error', (err)   => { this.emit('error', err)  })
    this._store.on('error',  (err)   => { this.emit('error', err)  })
    this._store.on('ready',  ()      => { this.emit('ready', this) })

    this._socket.on('event', (msg) => {
      switch (msg.subject) {
        case 'endorse':
          return this._endorse_handler(msg)
        case 'join':
          return this._join_handler(msg)
        case 'leave':
          return this._leave_handler(msg)
        case 'publish':
          if (!is_hash(msg.body)) return
          this.emit('publish', msg.body)
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

  get opt () {
    return this._opt
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

  get member_idx () {
    const idx = this.members.findIndex(e => {
      return this.signer.credential.claimable(e)
    })
    return idx !== -1 ? idx : null
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

  get updated_at () {
    return this._store.updated_at
  }

  log = {
    debug : (...s : unknown[]) => {
      return (this.opt.debug) ? console.log('[session]', ...s) : null
    },
    info  : (...s : unknown[]) => {
      return (this.opt.verbose)  ? console.log('[session]', ...s) : null
    }
  }

  _endorse_handler (msg : EventMessage<string>) {
      let err : string | undefined
    const pid = get_proposal_id(this.proposal)
    const sig = msg.body
    const pub = sig.slice(0, 64)
    if (this.signatures.includes(sig)) {
      err = 'duplicate signature from pub: ' + pub
    } else if (!verify_endorsement(pid, sig)) {
      err = 'invalid signature from pub: ' + pub
    }
    if (typeof err === 'string') {
      this.log.info('endorse rejected :', pub)
      this.log.debug(err)
      this.emit('reject', [ 'endorse', pub, err ])
      return
    }
    const commit_id  = Buff.str(sig).digest.hex
    const signatures = [ ...this.signatures, sig ]
    this._store.commit(commit_id, { signatures })
  }

  _join_handler (msg : EventMessage<MemberData>) {
    const mship = msg.body
    if (mship.pol === undefined || !this.has_policy(mship.pol)) {
      const err = 'invalid policy id: ' + mship.pol
      this.log.info('join rejected :', mship.pol)
      this.log.debug(err)
      this.emit('reject', [ 'join', mship.pub, err ])
      return
    }
    const policy    = this.get_policy(mship.pol)
    const new_draft = join_role(mship, policy, this.data)
    const commit_id = get_object_id(mship).hex
    this.log.info('member joined :', mship.pub)
    this.log.info('role joined   :', policy.id)
    this._store.commit(commit_id, new_draft)
  }

  _leave_handler (msg : EventMessage<MemberData>) {
    const mship     = msg.body
    const session   = rem_enrollment(mship, this.data)
    const commit_id = get_object_id(mship).hex
    this.log.info('member left :', mship.pub)
    this._store.commit(commit_id, session)
  }

  async connect (address : string, secret : string) {
    await Promise.all([
      this._socket.connect(address, secret),
      this._store.connect(address, secret)
    ])
    return this
  }

  endorse () {
    assert.ok(!this.is_endorsed, 'endorsement already exists')
    verify_proposal(this.proposal)
    const signer    = this.signer
    const signature = signer.draft.endorse(this.data)
    const commit_id = Buff.str(signature).digest.hex
    const receipt   = this._store.on_commit(commit_id)
    this._socket.send('endorse', signature)
    this.log.info('signer endorsed:', signer.pubkey)
    return receipt
  }

  get_policy (pol_id : string) {
    const pol = this.roles.find(e => e.id === pol_id)
    if (pol === undefined) throw new Error('policy does not exist')
    return pol
  }

  get_program (query : ProgramQuery) {
    return find_program(query, this.proposal.programs)
  }

  get_role (title : string) {
    const pol = this.roles.find(e => e.title === title)
    if (pol === undefined) throw new Error('policy does not exist')
    return pol
  }

  has_policy (pol_id : string) {
    return this.roles.find(e => e.id === pol_id) !== undefined
  }

  has_role (title : string) {
    return this.roles.find(e => e.title === title) !== undefined
  }

  async init (
    address : string, 
    secret  : string,
    store   : DraftData
  ) {
    await Promise.all([
      this._socket.connect(address, secret),
      this._store.init(address, secret, store)
    ])
    return this
  }

  join (policy_id : string, index ?: number) {
    const session = this.data
    const signer  = this.signer
    const mship   = (has_membership(session.members, signer._signer))
      ? get_membership(session.members, signer._signer)
      : signer.credential.generate(index)
    mship.pol = policy_id
    const commit_id = get_object_id(mship).hex
    const receipt   = this._store.on_commit(commit_id)
    this._socket.send('join', mship)
    return receipt
  }

  leave () {
    const members = this.data.members
    const signer  = this.signer   
    if (has_membership(members, signer._signer)) {
      const cred      = signer.credential.claim(members)
      const mship     = cred.data
      const commit_id = get_object_id(mship).hex
      const receipt   = this._store.on_commit(commit_id)
      this._socket.send('leave', mship)
      return receipt
    }
    return
  }

  async publish (client : EscrowClient) {
    verify_proposal(this.data.proposal)
    const contract = await EscrowContract.create(client, this.data)
    this._socket.send('publish', contract.cid)
    return contract
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
