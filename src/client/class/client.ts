import { resolve_json } from '@/fetch.js'

import {
  DefaultPolicy,
  get_server_config
} from '@/config/index.js'

import contract_api from '../api/client/contract.js'
import deposit_api  from '../api/client/deposit.js'
import oracle_api   from '../api/client/oracle.js'
import server_api   from '../api/client/server.js'
import vmachine_api from '../api/client/vm.js'
import witness_api  from '../api/client/witness.js'

import {
  ClientConfig,
  ClientOptions,
  FetchConfig
} from '../types.js'

import ClientSchema from '../schema.js'

type Resolver = ReturnType<typeof get_fetcher>

const DEFAULT_CONFIG = {
  ...get_server_config('mutiny'),
  policy : DefaultPolicy
}

export class EscrowClient {
  readonly _config  : ClientConfig
  readonly _fetcher : Resolver

  constructor (opt : ClientOptions = {}) {
    const config  = { ...DEFAULT_CONFIG, ...opt }
    this._config  = ClientSchema.client_config.parse(config)
    this._fetcher = get_fetcher(opt.fetcher ?? fetch)
  }

  get fetcher () {
    return this._fetcher
  }

  get network () {
    return this._config.network
  }

  get oracle_url () {
    return this._config.oracle_url
  }

  get server_url () {
    return this._config.server_url
  }

  contract = contract_api(this)
  deposit  = deposit_api(this)
  oracle   = oracle_api(this)
  server   = server_api(this)
  vm       = vmachine_api(this)
  witness  = witness_api(this)

  toJSON () {
    return this._config
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
        Authorization : 'Bearer ' + token
      }
    }
    // Run the fetcher method.
    const res = await fetcher(url, init)
    // Resolve, validate, then return the response.
    return resolve_json<T>(res)
  }
}
