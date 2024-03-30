import { Network, ServerConfig } from '@/types.js'

import DefaultPolicy  from './policy.json' assert { type : 'json' }
import DefaultConfigs from './server.json' assert { type : 'json' }

import * as CONST from './const.js'

function get_server_config (
  network : Network
) : ServerConfig {
  return DefaultConfigs[network as keyof typeof DefaultConfigs] as ServerConfig
}

export {
  CONST,
  DefaultPolicy,
  DefaultConfigs,
  get_server_config
}
