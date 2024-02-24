import { EventEmitter }   from './emitter.js'
import { EscrowClient }   from './client.js'
import { EscrowContract } from './contract.js'
import { EscrowDeposit }  from './deposit.js'
import { EscrowSigner }   from './signer.js'

import { compare, now, sleep } from '@/lib/util.js'

import {
  AccountRequest,
  AccountStatus,
  CommitRequest,
  ContractData,
  DepositAccount,
  DepositData,
  FundingDataResponse,
  OracleSpendData,
  RegisterRequest,
  TxOutput
} from '@/types/index.js'

interface EscrowAccountConfig {
  refresh_ival : number
  verbose      : boolean
}

const DEFAULT_CONFIG : EscrowAccountConfig = {
  refresh_ival : 10,
  verbose      : true
}

export class EscrowAccount extends EventEmitter <{
  'commit'   : FundingDataResponse
  'fetch'    : EscrowAccount
  'payment'  : TxOutput
  'register' : DepositData
  'reserved' : DepositAccount
}> {

  readonly _client : EscrowClient
  readonly _signer : EscrowSigner
  readonly _opt    : EscrowAccountConfig
  
  _data     : DepositAccount | null
  _deposit  : DepositData    | null
  _payments : OracleSpendData[]
  _status   : AccountStatus
  _updated  : number         | null

  constructor (
    client  : EscrowClient,
    signer  : EscrowSigner,
    config ?: Partial<EscrowAccountConfig>
  ) {
    const opt = { ...DEFAULT_CONFIG, ...config }
    super()
    this._client   = client
    this._signer   = signer
    this._opt      = opt
    this._data     = null
    this._deposit  = null
    this._payments = []
    this._status   = 'init'
    this._updated  = null
  }

  get address () {
    return this.data.address
  }

  get id () {
    return this.data.acct_id
  }

  get client () {
    return this._client
  }

  get data () {
    if (this._data === null) {
      throw new Error('deposit account not initialized')
    }
    return this._data
  }

  get deposit () {
    if (this._deposit === null) {
      throw new Error('deposit account not registered')
    }
    return this._deposit
  }

  get is_funded () {
    return this._payments.length > 0
  }

  get is_registered () {
    return this._deposit !== null
  }

  get is_ready () {
    return (this.is_reserved && this.is_funded)
  }

  get is_reserved () {
    return this._data !== null
  }

  get opt () {
    return this._opt
  }

  get payments () {
    return this._payments
  }

  get request () {
    const { deposit_pk, sequence, spend_xpub } = this.data
    return { deposit_pk, sequence, spend_xpub }
  }

  get signer () {
    return this._signer
  }

  get status () : AccountStatus {
    if (this.is_registered) return 'registered'
    if (this.is_funded)     return 'funded'
    if (this.is_reserved)   return 'reserved'
    return 'init'
  }

  get updated_at () {
    if (this._updated === null) {
      throw new Error('account is not initialized')
    }
    return this._updated
  }

  get utxo () {
    if (!this.is_funded) {
      throw new Error('deposit account is not funded')
    }
    return this.payments[0].txspend
  }

  async _reserve (req : AccountRequest) {
    const res = await this._client.deposit.request(req)
    if (!res.ok) throw new Error(res.error)
    this._data = res.data.account
    this.emit('reserved', res.data.account)
    return res.data.account
  }

  async _commit (req : CommitRequest) {
    const res = await this.client.deposit.commit(req)
    if (!res.ok) throw new Error(res.error)
    this.emit('commit', res.data)
    return res.data
  }

  async _fetch () {
    const addr   = this.data.address
    const oracle = this.client.oracle
    const utxos  = await oracle.get_address_utxos(addr)
    if (!compare(this._payments, utxos)) {
      this._payments = utxos
      this.emit('payment', this.utxo)
    } else {
      this._updated = now()
    }
    this.emit('fetch', this)
    return this
  }

  async _register (req : RegisterRequest) {
    const res = await this.client.deposit.register(req)
    if (!res.ok) throw new Error(res.error)
    this._deposit = res.data.deposit
    this.emit('register', res.data.deposit)
    return res.data.deposit
  }

  async commit (
    contract : ContractData,
    utxo    ?: TxOutput
  ) {
    utxo = utxo ?? this.utxo
    const acct = this.data
    const req  = this.signer.account.commit(acct, contract, utxo)
    const res  = await this._commit(req)
    return {
      contract : new EscrowContract(this.client, res.contract),
      deposit  : new EscrowDeposit(this.client, res.deposit)
    }
  }

  async fetch () {
    return this._fetch()
  }

  async register (utxo ?: TxOutput) {
    utxo = utxo ?? this.utxo
    const req = { ...this.request, utxo }
    const res = await this._register(req)
    return new EscrowDeposit(this.client, res)
  }

  async reserve (
    locktime : number,
    index   ?: number
  ) {
    const req = this.signer.account.create(locktime, index)
    const res = await this._reserve(req)
    this.verify()
    return res
  }

  async poll (
    interval : number, 
    retries  : number
  ) {
    for (let i = 0; i < retries; i++) {
      if (this.is_funded) {
        return this
      } else {
        await this.fetch()
      }
      await sleep(interval * 1000)
    }
    throw new Error('polling timed out')
  }

  verify () {
    return this.signer.account.verify(this.data)
  }

  toJSON () {
    return this.data
  }

  toString() {
    return JSON.stringify(this.data)
  }
}
