import { verify_proposal } from '@/validators/proposal.js'
import { EventEmitter }    from './emitter.js'
import { EscrowSigner }    from './signer.js'
import { NostrStore }      from './store.js'
import { EscrowContract }  from './contract.js'
import { EscrowClient }    from './client.js'
import { NostrSocket }     from './socket.js'
import { NostrSub }        from './sub.js'

import {
  DraftItem,
  EventFilter,
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
  rem_enrollment,
  tabulate_enrollment
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
} from '@/validators/draft.js'

import {
  DraftData,
  MemberData,
  ProgramQuery,
  ProposalData,
  RolePolicy,
} from '@/types/index.js'

import * as assert from '@/assert.js'
import * as schema from '@/schema/index.js'
import { sha256 } from '@cmdcode/crypto-tools/hash'

export class DraftSession extends EventEmitter <{
  'approve'    : string
  'commit'     : string
  'confirmed'  : DraftSession
  'debug'      : unknown[]
  'endorse'    : string
  'error'      : Error
  'full'       : DraftSession
  'info'       : unknown[]
  'join'       : MemberData
  'leave'      : MemberData
  'members'    : MemberData[]
  'proposal'   : ProposalData
  'ready'      : DraftSession
  'reject'     : [ method : string, pub : string, reason :string ]
  'roles'      : RolePolicy[]
  'signatures' : string[]
  'terms'      : Partial<ProposalData>
  'update'     : DraftSession
  'published'  : string
}> {

  readonly _opt    : SessionConfig
  readonly _signer : EscrowSigner
  readonly _socket : NostrSocket
  readonly _store  : NostrStore<DraftData>
  readonly _sub    : NostrSub

  _agreed : boolean
  _full   : boolean
  _init   : boolean

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
    this._sub    = this._socket.subscribe({ selfsub : false })
    this._agreed = false
    this._full   = false
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
        case 'approve':
          return this._approve_handler(msg)
        case 'endorse':
          return this._endorse_handler(msg)
        case 'join':
          return this._join_handler(msg)
        case 'leave':
          return this._leave_handler(msg)
        case 'publish':
          if (!is_hash(msg.body)) return
          this.emit('published', msg.body)
          break
        case 'terms':
          return this._terms_handler(msg)
      }
    })
  }

  get approvals () {
    return this.data.approvals
  }
  
  get available () {
    const map = tabulate_enrollment(this.members, this.roles)
    return this.roles.filter(e => {
      const score = map.get(e.id) ?? e.max_slots
      return score >= e.max_slots
    })
  }

  get data () {
    return this._store.data
  }

  get id () {
    return this._store._socket.topic_id
  }

  get is_approved () {
    const mship = this.membership.data
    const sig   = this.approvals.find(e => {
      return e.slice(0, 64) === mship.pub
    })
    return (sig !== undefined)
  }

  get is_confirmed () {
    const pubkeys = this.members.map(e => e.pub)
    return this.is_full && this.approvals.every(e => {
      const included = pubkeys.includes(e.slice(0 ,64))
      const verified = verify_endorsement(this.prop_id, e)
      return included && verified
    })
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

  get members () {
    return this.data.members
  }

  get member_idx () {
    const idx = this.members.findIndex(e => {
      return this.signer.credential.claimable(e)
    })
    return idx !== -1 ? idx : null
  }

  get membership () {
    if (!this.is_member) {
      throw new Error('signer is not a member of the draft')
    }
    return this.signer.credential.claim(this.members)
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

  get roles () {
    return this.data.roles
  }

  get secret () {
    return this._store._socket.secret
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

  get terms () {
    return this.data.terms
  }

  get updated_at () {
    return this._store.updated_at
  }

  log = {
    debug : (...s : unknown[]) => {
      if (this.opt.debug) {
        console.log('[session]', ...s)
        this.emit('debug', s)
      }
    },
    info  : (...s : unknown[]) => {
      if (this.opt.verbose) {
        console.log('[session]', ...s)
        this.emit('info', s)
      }
    }
  }

  _approve (sig : string, created_at ?: number) {
    const approvals = [ ...this.approvals, sig ]
    const session   = { ...this.data, approvals }
    this._update(session, created_at)
    this.emit('approve', sig)
  }

  _approve_handler (msg : EventMessage<string>) {
      let err : string | undefined
    const cat = msg.envelope.created_at
    const pid = get_proposal_id(this.proposal)
    const sig = msg.body
    const pub = sig.slice(0, 64)
    if (this.approvals.includes(sig)) {
      err = 'duplicate approval from pub: ' + pub
    } else if (!this.check_member(pub)) {
      err = 'pubkey is not a member: ' + pub
    } else if (!verify_endorsement(pid, sig)) {
      err = 'invalid approval from pub: ' + pub
    }
    if (typeof err === 'string') {
      this.log.info('approval rejected :', pub)
      this.log.debug(err)
      this.emit('reject', [ 'approve', pub, err ])
      return
    }
    this._approve(sig, cat)
    this.log.info('recv approve :', pub)
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

  _terms_handler (msg : EventMessage<Partial<ProposalData>>) {
    const terms = msg.body
    const cat   = msg.envelope.created_at
    const pub   = msg.envelope.pubkey
    if (!this.check_terms(terms)) {
      const err = 'terms rejected: ' + terms.toString()
      this.log.info('terms rejected :', terms)
      this.log.debug(err)
      this.emit('reject', [ 'terms', pub, err ])
      return
    }
    this._update_terms(terms, cat)
    this.log.info('terms updated :', terms)
  }

  _update_terms (terms : Partial<ProposalData>, created_at ?: number) {
    const { paths, payments, programs, schedule, ...rest } = this.proposal

    const proposal = {
      ...this.proposal,
      ...rest, 
      paths    : [ ...paths,    ...terms.paths    ?? [] ],
      payments : [ ...payments, ...terms.payments ?? [] ],
      programs : [ ...programs, ...terms.programs ?? [] ],
      schedule : [ ...schedule, ...terms.schedule ?? [] ],
    }

    const session = { ...this.data, proposal }
    this._update(session, created_at)
    this.emit('terms', terms)
  }

  _update (data : DraftData, created_at = now()) {
    validate_draft(data)
    verify_draft(data)
    this._store._update(data, created_at)
    if (this.is_full && !this._agreed) {
      this.emit('full', this)
    }
    if (this.is_approved && !this._agreed) {
      this.emit('confirmed', this)
    }
    this._agreed = this.is_approved
    this._full   = this.is_full
    this.emit('update', this)
  }

  approve () {
    const sig = this.signer.draft.approve(this.data)
    this._approve(sig)
    this.sub.send('approve', sig)
    this.log.info('send approve  :', this.signer.pubkey)
  }

  check_member (pubkey : string) {
    return this.members.find(e => e.pub === pubkey) !== undefined
  }

  check_terms (terms : Partial<ProposalData>) {
    const parser = schema.proposal.data.partial()
    const parsed = parser.safeParse(terms)
    if (!parsed.success) return false
    for (const key of Object.keys(terms)) {
      const term = key as keyof ProposalData
      if (!this.has_term(term)) return false
    }
    return true
  }

  async connect (address : string, secret : string) {
    await Promise.all([
      this._socket.connect(address, secret),
      this._store.connect(address, secret)
    ])
    return this
  }

  delete (store_id : string) {
    this._store._socket.delete(store_id)
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
    if (pol === undefined) throw new Error('policy does not exist: ' + pol_id)
    return pol
  }

  get_program (query : ProgramQuery) {
    const program = find_program(query, this.proposal.programs)
    if (program === undefined) throw new Error('program does not exist')
    return program
  }

  get_role (title : string) {
    const pol = this.roles.find(e => e.title === title)
    if (pol === undefined) throw new Error('role does not exist')
    return pol
  }

  get_term <K extends keyof ProposalData> (key : K) {
    if (!this.terms.includes(key)) throw new Error('term is not negotiable: ' + key)
    return this.proposal[key]
  }

  has_policy (pol_id : string) {
    return this.roles.find(e => e.id === pol_id) !== undefined
  }

  has_program (query : ProgramQuery) {
    return find_program(query, this.proposal.programs) !== undefined
  }

  has_role (title : string) {
    return this.roles.find(e => e.title === title) !== undefined
  }

  has_term <K extends keyof ProposalData> (key : K) {
   return this.terms.includes(key)
  }

  async init (
    address  : string, 
    secret   : string,
    session  : DraftData
  ) {
    validate_draft(session)
    verify_draft(session)
    return Promise.all([
      this._store.init(address, secret, session),
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

  async list (address : string) {
    const filter : EventFilter = {
      authors : [ this._store.pubkey   ],
      kinds   : [ this._store.opt.kind ],
      until   : now()
    }
    let sessions : DraftItem[] = []
    const socket = new NostrSocket(this._signer._signer)
    const events = await socket.query(address, filter)
    socket.close()
    events.filter(e => socket.can_recover(e)).forEach(e => {
      const pubkey     = e.pubkey
      const updated_at = e.created_at
      const store_id   = e.id
      try {
        const secret   = socket.recover(e)
        const id       = sha256(secret).hex
        sessions.push({ pubkey, id, secret, store_id, updated_at })
      } catch { return }
    })
    return sessions
  }

  async publish (client : EscrowClient) {
    verify_proposal(this.data.proposal)
    const contract = await EscrowContract.create(client, this.data)
    this.sub.send('publish', contract.cid)
    return contract
  }

  async refresh () {
    return this._store.refresh()
  }

  update_terms (terms : Partial<ProposalData>) {
    if (!this.check_terms(terms)) {
      throw new Error('invalid terms: ' + terms.toString())
    }
    this._update_terms(terms)
    this.sub.send('terms', terms)
    this.log.info('send terms     :', terms)
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
