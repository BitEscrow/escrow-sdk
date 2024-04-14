import { resolve_json } from '@/core/util/fetch.js'

import {
  ApiResponse,
  Network,
  ServerPolicy,
  VirtualMachineAPI
} from '@/core/types/index.js'

import { DEFAULT_CONFIG, get_client_config } from '../config.js'

import {
  ClientConfig,
  ClientOptions,
  FetchConfig
} from '../types.js'

import contract_api  from '../api/client/contract.js'
import deposit_api   from '../api/client/deposit.js'
import oracle_api    from '../api/client/oracle.js'
import proposal_api  from '../api/client/draft.js'
import server_api    from '../api/client/server.js'
import vmachine_api  from '../api/client/vm.js'
import witness_api   from '../api/client/witness.js'

import ClientSchema  from '../schema.js'

type Resolver = ReturnType<typeof get_fetcher>

export class EscrowClient {
  readonly _config  : ClientConfig
  readonly _fetcher : Resolver

  constructor (opt : ClientOptions = {}) {
    const options = { ...DEFAULT_CONFIG, ...opt }
    const client  = get_client_config(opt.network as Network)
    const config  = { ...client, ...options }
    this._config  = ClientSchema.client_config.parse(config)
    this._fetcher = get_fetcher(opt.fetcher ?? fetch)
  }

  get fetcher () {
    return this._fetcher
  }

  get machine () : VirtualMachineAPI {
    return this._config.machine
  }

  get network ()  : Network {
    return this._config.network
  }

  get oracle_url () : string {
    return this._config.oracle_url
  }

  get server_pol () : ServerPolicy {
    return this._config.server_pol
  }

  get server_pk () {
    return this._config.server_pk
  }

  get server_url () : string {
    return this._config.server_url
  }

  contract = contract_api(this)
  deposit  = deposit_api(this)
  oracle   = oracle_api(this)
  proposal = proposal_api(this)
  server   = server_api(this)
  vm       = vmachine_api(this)
  witness  = witness_api(this)

  check_issuer (pubkey : string) {
    if (pubkey !== this.server_pk) {
      throw new Error('issuer\'s pubkey is not recognized')
    }
  }

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
