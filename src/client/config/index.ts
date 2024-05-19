import { Network }     from '@/core/types/index.js'
import DEFAULT_POLICY  from './policy.js'
import DEFAULT_SERVERS from './settings.js'

export const DEFAULT_NETWORK = 'mutiny'

export const DEFAULT_CONFIG = {
  network : DEFAULT_NETWORK
}

export function get_client_config (network : Network) {
  return DEFAULT_SERVERS[network]
}

export { DEFAULT_POLICY, DEFAULT_SERVERS }
