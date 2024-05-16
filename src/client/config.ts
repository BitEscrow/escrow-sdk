import { Network }   from '@/core/types/index.js'
import ServerPolicy  from './config/policy.js'
import ServerConfigs from './config/settings.js'

export const DEFAULT_NETWORK = 'mutiny'

export const DEFAULT_CONFIG = {
  network : DEFAULT_NETWORK
}

export const DEFAULT_POLICY = ServerPolicy

export function get_client_config (network : Network) {
  return ServerConfigs[network]
}
