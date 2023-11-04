import { Signer } from '../../signer.js'
import { is_hex } from '../../lib/util.js'

import contract_api from '../lib/contract.js'
import covenant_api from '../lib/covenant.js'
import deposit_api  from '../lib/deposit.js'
import witness_api  from '../lib/witness.js'

import {
  broadcast_tx,
  fee_estimates,
  get_fee_target,
  get_spend_data,
  get_tx_data,
  resolve
} from '../../lib/oracle.js'

import { OracleQuery }   from '../../types/index.js'
import { ClientOptions } from '../types.js'

import * as assert from '@/assert.js'

type Resolver = ReturnType<typeof get_fetcher>

const DEFAULT_HOST   = 'http://localhost:3000'
const DEFAULT_ORACLE = 'http://172.21.0.3:3000'

export default class EscrowClient {
  readonly _fetcher : Resolver
  readonly _host    : string
  readonly _oracle  : string
  readonly _signer  : Signer

  constructor (
    signer  : Signer,
    options : ClientOptions = {}
  ) {
    const { fetcher, hostname, oracle } = options
    this._fetcher = get_fetcher(fetcher ?? fetch)
    this._host    = hostname ?? DEFAULT_HOST
    this._oracle  = oracle   ?? DEFAULT_ORACLE
    this._signer  = signer
  }

  get fetcher() {
    return this._fetcher
  }

  get host () {
    return this._host
  }

  get signer () {
    return this._signer
  }
 
  contract = {
    cancel : contract_api.cancel(this),
    create : contract_api.create(this),
    list   : contract_api.list(this),
    read   : contract_api.read(this),
    status : contract_api.status(this)
  }

  covenant = {
    add    : covenant_api.add(this),
    list   : covenant_api.list(this),
    remove : covenant_api.remove(this)
  }

  deposit = {
    close    : deposit_api.close(this),
    create   : deposit_api.create(this),
    list     : deposit_api.list(this),
    read     : deposit_api.read(this),
    register : deposit_api.register(this),
    request  : deposit_api.request(this),
    status   : deposit_api.status(this)
  }

  oracle = {
    broadcast_tx : async (txhex : string) => {
      assert.ok(is_hex(txhex))
      return broadcast_tx(this._oracle, txhex)
    },
    fee_estimates : async () => {
      return fee_estimates(this._oracle)
    },
    get_fee_target : async (target : number) => {
      return get_fee_target(this._oracle, target)
    },
    get_tx_data : async (txid : string) => {
      assert.is_hash(txid)
      return get_tx_data(this._oracle, txid)
    },
    get_spend_out : async (query : OracleQuery) => {
      assert.is_hash(query.txid)
      return get_spend_data(this._oracle, query)
    }
  }

  witness = {
    list   : witness_api.list(this),
    read   : witness_api.read(this),
    submit : witness_api.submit(this)
  }

  toJSON() {
    return { host : this.host }
  }

  toString() {
    return JSON.stringify(this.toJSON())
  }

}

export function get_fetcher (
  fetcher : typeof fetch
) {
  return async <T> (
    input : RequestInfo | URL, 
    init ?: RequestInit | undefined
  ) => {
    const res = await fetcher(input, init)
    return resolve<T>(res)
  }
}
