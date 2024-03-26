import { resolve_json }  from '@/core/lib/oracle.js'
import { parse_network } from '@/core/lib/parse.js'
import { Network }       from '@/types.js'

import contract_api from '../api/client/contract.js'
import deposit_api  from '../api/client/deposit.js'
import oracle_api   from '../api/client/oracle.js'
import server_api   from '../api/client/server.js'
import witness_api  from '../api/client/witness.js'

import {
  ClientConfig,
  FetchConfig
} from '../types/index.js'

type Resolver = ReturnType<typeof get_fetcher>

const DEFAULT_HOST   = 'http://localhost:3000'
const DEFAULT_ORACLE = 'http://172.21.0.3:3300'
const DEFAULT_CHAIN  = 'regtest'

export class EscrowClient {
  readonly _fetcher : Resolver
  readonly _host    : string
  readonly _oracle  : string
  readonly _network : Network

  constructor (config : ClientConfig) {
    this._fetcher = get_fetcher(config.fetcher ?? fetch)
    this._host    = config.hostname ?? DEFAULT_HOST
    this._oracle  = config.oracle   ?? DEFAULT_ORACLE
    this._network = (config.network !== undefined)
      ? parse_network(config.network)
      : DEFAULT_CHAIN as Network
  }

  get fetcher () {
    return this._fetcher
  }

  get host () {
    return this._host
  }

  get network () {
    return this._network
  }

  contract = contract_api(this)
  deposit  = deposit_api(this)
  oracle   = oracle_api(this)
  server   = server_api(this)
  witness  = witness_api(this)

  toJSON () {
    return { host: this.host }
  }

  toString () {
    return JSON.stringify(this.toJSON())
  }
}

/**
 * Takes a fetch method as input, and wraps it
 * with schema validation and request signing.
 */
export function get_fetcher (
  fetcher : typeof fetch
) {
  // Return the wrapped fetch method.
  return async <T> (config : FetchConfig) => {
    // Unpack the config.
    const { init = {}, token, url } = config
    // Initialize the options object.
    if (token !== undefined) {
      init.headers = {
        ...init.headers,
        Authorization: 'Bearer ' + token
      }
    }
    // Run the fetcher method.
    const res = await fetcher(url, init)
    // Resolve, validate, then return the response.
    return resolve_json<T>(res)
  }
}
