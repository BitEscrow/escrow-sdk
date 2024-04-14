import CVM         from '@/vm/index.js'
import { Network } from '@/core/types/index.js'

import ServerConfigs from './config/settings.json' assert { type : 'json' }
import DefaultPolicy from './config/policy.json'   assert { type : 'json' }

const DEFAULT_NETWORK = 'mutiny'

export const DEFAULT_CONFIG = {
  machine    : CVM,
  network    : DEFAULT_NETWORK,
  server_pol : DefaultPolicy
}

export function get_client_config (network : Network) {
  return ServerConfigs[network]
}
