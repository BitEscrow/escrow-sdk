import { resolve_json } from '@/client/util/fetch.js'
import { Network }      from '@/core/types/index.js'

import {
  DEFAULT_CONFIG,
  get_client_config
} from '@/client/config/index.js'

import {
  ApiResponse,
  ClientConfig,
  ClientOptions,
  FetchConfig
} from '@/client/types/index.js'

import account_api   from '../api/client/account.js'
import contract_api  from '../api/client/contract.js'
import deposit_api   from '../api/client/deposit.js'
import draft_api     from '../api/client/draft.js'
import oracle_api    from '../api/client/oracle.js'
import server_api    from '../api/client/server.js'
import vmachine_api  from '../api/client/vm.js'
import witness_api   from '../api/client/witness.js'

import ClientSchema  from '../schema/index.js'

type Resolver = ReturnType<typeof get_fetcher>

export class EscrowClient {
  readonly _config  : ClientConfig
  readonly _fetcher : Resolver

  constructor (opt : ClientOptions = {}) {
    const options = { ...DEFAULT_CONFIG, ...opt }
    const client  = get_client_config(opt.network as Network)
    const config  = { ...client, ...options }
    this._config  = ClientSchema.base.client_config.parse(config)
    this._fetcher = get_fetcher(opt.fetcher ?? fetch)
  }

  get fetcher () {
    return this._fetcher
  }

  get network ()  : Network {
    return this._config.network
  }

  get oracle_url () : string {
    return this._config.oracle_url
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
  return async <T> (
    config : FetchConfig
  ) : Promise<ApiResponse<T>> => {
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
