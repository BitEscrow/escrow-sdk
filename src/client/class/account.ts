import { EventEmitter }   from './emitter.js'
import { EscrowClient }   from './client.js'
import { EscrowContract } from './contract.js'
import { EscrowDeposit }  from './deposit.js'
import { EscrowSigner }   from './signer.js'

import { compare, now, sleep } from '@/lib/util.js'

import {
  AccountRequest,
  CommitRequest,
  ContractData,
  DepositAccount,
  DepositDataResponse,
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
  'error'    : unknown
  'fetch'    : EscrowAccount
  'payment'  : EscrowAccount
  'ready'    : EscrowAccount
  'register' : DepositDataResponse
  'reserved' : EscrowAccount
  'update'   : EscrowAccount
}> {

  readonly _client : EscrowClient
  readonly _opt    : EscrowAccountConfig
  
  _data     : DepositAccount | null
  _init     : boolean
  _payments : OracleSpendData[]
  _updated  : number         | null

  constructor (
    client  : EscrowClient,
    config ?: Partial<EscrowAccountConfig>
  ) {
    const opt = { ...DEFAULT_CONFIG, ...config }
    super()
    this._client   = client
    this._opt      = opt
    this._data  = null
    this._init     = false
    this._payments = []
    this._updated  = null
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

  get is_funded () {
    return this._payments.length > 0
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

  get req () {
    const { deposit_pk, sequence, spend_xpub } = this.data
    return { deposit_pk, sequence, spend_xpub }
  }

  get updated_at () {
    if (this._updated === null) {
      throw new Error('account not initialized')
    }
    return this._updated
  }

  get utxo () {
    if (!this.is_funded) {
      throw new Error('utxo is not defined')
    }
    return this.payments[0].txspend
  }

  async _request (req : AccountRequest) {
    if (this._data === null) {
      const res = await this._client.deposit.request(req)
      if (!res.ok) throw new Error(res.error)
      this._data = res.data.account
      this.emit('reserved', this)
    }
    return this.data
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
    console.log('existing:', this._payments)
    console.log('incoming:', utxos)
    if (!compare(this._payments, utxos)) {
      this._update(utxos)
    } else {
      this._updated = now()
    }
    this.emit('fetch', this)
    return this
  }

  async _register (req : RegisterRequest) {
    const res = await this.client.deposit.register(req)
    if (!res.ok) throw new Error(res.error)
    this.emit('register', res.data)
    return res.data
  }

  _update (utxos : OracleSpendData[]) {
    this._payments = utxos 
    if (!this.is_ready) {
      this._init = true
      this.emit('ready', this)
    }
    this.emit('update', this)
    this._updated = now()
  }

  async commit (
    contract : ContractData,
    signer   : EscrowSigner,
    utxo    ?: TxOutput
  ) {
    utxo = utxo ?? this.utxo
    const acct = this.data
    const req  = signer.account.commit(acct, contract, utxo)
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
    const req = { ...this.req, utxo }
    const res = await this.client.deposit.register(req)
    if (!res.ok) throw new Error(res.error)
    const dep = res.data.deposit
    return new EscrowDeposit(this.client, dep)
  }

  async request (
    signer   : EscrowSigner,
    locktime : number,
    index   ?: number
  ) {
    const req = signer.account.create(locktime, index)
    const res = await this._request(req)
    this.verify(signer)
    return res
  }

  async poll (interval : number, retries : number) {
    for (let i = 0; i < retries; i++) {
      if (this.is_funded) {
        return this.utxo
      } else {
        await this.fetch()
      }
      await sleep(interval * 1000)
    }
    return this.utxo
  }

  verify (signer : EscrowSigner) {
    return signer.account.verify(this.data)
  }

  toJSON () {
    return this.data
  }

  toString() {
    return JSON.stringify(this.data)
  }
}
