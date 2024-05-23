import { get_fetcher }  from '@/client/lib/fetch.js'
import { ChainNetwork } from '@/core/types/index.js'
import { assert }       from '@/core/util/index.js'
import { ChainOracle }  from './oracle.js'

import {
  DEFAULT_CONFIG,
  get_server_config
} from '@/client/config/index.js'

import {
  ClientConfig,
  ClientOptions
} from '@/client/types/index.js'

import account_api   from '../api/client/account.js'
import contract_api  from '../api/client/contract.js'
import deposit_api   from '../api/client/deposit.js'
import draft_api     from '../api/client/draft.js'
import machine_api   from '../api/client/machine.js'
import server_api    from '../api/client/server.js'
import witness_api   from '../api/client/witness.js'

import ClientSchema  from '../schema/index.js'

type Resolver = ReturnType<typeof get_fetcher>

export class EscrowClient {
  readonly _config  : ClientConfig
  readonly _fetcher : Resolver
  readonly _oracle  : ChainOracle

  constructor (opt : ClientOptions = {}) {
    const options = { ...DEFAULT_CONFIG, ...opt }
    const client  = get_server_config(opt.network as ChainNetwork)
    const config  = { ...client, ...options }
    this._config  = ClientSchema.config.client.parse(config)
    this._fetcher = get_fetcher(opt.fetcher ?? fetch)
    this._oracle  = new ChainOracle(config.oracle_url)
  }

  get fetcher () {
    return this._fetcher
  }

  get network ()  : ChainNetwork {
    return this._config.network
  }

  get oracle () : ChainOracle {
    return this._oracle
  }

  get server_pk () : string {
    return this._config.server_pk
  }

  get server_url () : string {
    return this._config.server_url
  }

  account  = account_api(this)
  contract = contract_api(this)
  deposit  = deposit_api(this)
  draft    = draft_api(this)
  machine  = machine_api(this)
  server   = server_api(this)
  witness  = witness_api(this)

  verify_pk (pubkey : string) {
    assert.ok(pubkey === this.server_pk, 'pubkey not recognized')
  }

  toJSON () {
    return this._config
  }

  toString () {
    return JSON.stringify(this.toJSON())
  }
}
