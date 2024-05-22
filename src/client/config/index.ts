import { ChainNetwork }     from '@/core/types/index.js'
import DEFAULT_POLICY  from './policy.js'
import DEFAULT_SERVERS from './settings.js'

const DEFAULT_NETWORK = 'mutiny'

const DEFAULT_CONFIG = {
  network : DEFAULT_NETWORK
}

function get_server_config (network : ChainNetwork) {
  return DEFAULT_SERVERS[network]
}

export {
  DEFAULT_CONFIG,
  DEFAULT_NETWORK,
  DEFAULT_POLICY,
  DEFAULT_SERVERS,
  get_server_config
}
