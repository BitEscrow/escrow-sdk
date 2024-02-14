import { verify_proposal } from '@/validators/proposal.js'
import { EventEmitter }    from './emitter.js'
import { EscrowSigner }    from './signer.js'
import { NostrStore }      from './store.js'
import { EscrowContract }  from './contract.js'
import { EscrowClient }    from './client.js'
import { NostrSocket }     from './socket.js'
import { NostrSub }        from './sub.js'

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
  is_hash,
  now
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
  'commit'     : string
  'endorse'    : string
  'error'      : Error
  'join'       : MemberData
  'leave'      : MemberData
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
  readonly _sub    : NostrSub

  _init : boolean

  constructor (
    signer   : EscrowSigner, 
    options ?: Partial<SessionConfig>
  ) {
    const { socket_config, store_config, ...opt } = options ?? {}
    const socket_opt = { ...socket_config }
    const store_opt  = { ...store_config  }

    super()

    this._opt    = { debug : false, verbose : false, ...opt }
    this._signer = signer
    this._socket = new NostrSocket(signer._signer, socket_opt)
    this._store  = new NostrStore(this._socket, store_opt)
    this._sub    = this._socket.subscribe({ selfsub : true })
    this._init   = false

    this._socket.on('error', (err)   => { this.emit('error', err)  })
    this._store.on('error',  (err)   => { this.emit('error', err)  })

    this._store.on('ready', () => {
      if (!this.is_ready && this.sub.is_ready) {
        this._init = true
        this.emit('ready', this)
      }
    })

    this.sub.on('ready', () => {
      if (!this.is_ready && this._store.is_ready) {
        this._init = true
        this.emit('ready', this)
      }
    })

    this.sub.on('message', (msg) => {
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
    return (sig !== undefined)
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
    return this._init
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

  get sub () {
    return this._sub
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

  _endorse (sig : string, created_at ?: number) {
    const signatures = [ ...this.signatures, sig ]
    const session    = { ...this.data, signatures }
    this._update(session, created_at)
    this.emit('endorse', sig)
  }

  _endorse_handler (msg : EventMessage<string>) {
      let err : string | undefined
    const cat = msg.envelope.created_at
    const pid = get_proposal_id(this.proposal)
    const sig = msg.body
    const pub = sig.slice(0, 64)
    if (this.signatures.includes(sig)) {
      err = 'duplicate signature from pub: ' + pub
    } else if (!verify_endorsement(pid, sig)) {
      err = 'invalid signature from pub: ' + pub
    }
    if (typeof err === 'string') {
      this.log.info('sig rejected   :', pub)
      this.log.debug(err)
      this.emit('reject', [ 'endorse', pub, err ])
      return
    }
    this._endorse(sig, cat)
    this.log.info('recv endorse  :', pub)
  }

  _join (
    mship       : MemberData, 
    policy      : RolePolicy,
    created_at ?: number
  ) {
    const new_draft = join_role(mship, policy, this.data)
    this._update(new_draft, created_at)
    this.log.info('member joined :', mship.pub)
    this.log.info('role joined   :', policy.id)
    this.emit('join', mship)
  }

  _join_handler (msg : EventMessage<MemberData>) {
    const cat   = msg.envelope.created_at
    const mship = msg.body
    if (mship.pol === undefined || !this.has_policy(mship.pol)) {
      const err = 'invalid policy id: ' + mship.pol
      this.log.info('join rejected :', mship.pol)
      this.log.debug(err)
      this.emit('reject', [ 'join', mship.pub, err ])
      return
    }
    const pol = this.get_policy(mship.pol)
    this._join(mship, pol, cat)
  }

  _leave (mship : MemberData, created_at ?: number) {
    const session = rem_enrollment(mship, this.data)
    this._update(session, created_at)
    this.log.info('member left   :', mship.pub)
    this.emit('leave', mship)
  }

  _leave_handler (msg : EventMessage<MemberData>) {
    const mship = msg.body
    const cat   = msg.envelope.created_at
    this._leave(mship, cat)
    this.log.info('member left   :', mship.pub)
  }

  _update (data : DraftData, created_at = now()) {
    validate_draft(data)
    verify_draft(data)
    this._store._update(data, created_at)
    this.emit('update', this)
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
    const signer = this.signer
    const sig    = signer.draft.endorse(this.data)
    this._endorse(sig)
    this.sub.send('endorse', sig)
    this.log.info('send endorse  :', signer.pubkey)
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
    return Promise.all([
      this._store.init(address, secret, store),
      this.sub.when_ready()
    ])
  }

  join (policy_id : string, index ?: number) {
    const session = this.data
    const signer  = this.signer
    const mship   = (has_membership(session.members, signer._signer))
      ? get_membership(session.members, signer._signer)
      : signer.credential.generate(index)
    const pol = this.get_policy(policy_id)
    mship.pol = policy_id
    this._join(mship, pol)
    this.sub.send('join', mship)
    this.log.info('send join     :', mship.pub)
  }

  leave () {
    const members = this.data.members
    const signer  = this.signer   
    if (has_membership(members, signer._signer)) {
      const cred      = signer.credential.claim(members)
      const mship     = cred.data
      const commit_id = get_object_id(mship).hex
      const receipt   = this.when_commit(commit_id)
      this.log.info('send commit   :', commit_id)
      this.sub.send('leave', mship)
      return receipt
    }
    return
  }

  async publish (client : EscrowClient) {
    verify_proposal(this.data.proposal)
    const contract = await EscrowContract.create(client, this.data)
    this.sub.send('publish', contract.cid)
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

  async when_commit (commit_id : string) {
    const duration = 10_000
    const timeout  = 'commit timed out'
    return new Promise((res, rej) => {
      const timer = setTimeout(() => rej(timeout), duration)
      this.within('commit', (id) => {
        if (id === commit_id) {
          this.log.info('conf commit   :', commit_id)
          clearTimeout(timer)
          res(this)
        }
      }, duration)
    }).catch(err => { throw new Error(err) })
  }
}
