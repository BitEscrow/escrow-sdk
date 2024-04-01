import { ServerConfig } from '@/core/types/index.js'
import { CVM }          from '@/vm/index.js'

import { SignerConfig }   from '../types.js'
import DefaultConfig      from '../config/server.json' assert { type : 'json' }
import DefaultPolicy      from '../config/policy.json' assert { type : 'json' }

export const DEFAULT_CONFIG : SignerConfig = {
  ...DefaultConfig as ServerConfig,
  machine    : CVM,
  server_pol : DefaultPolicy
}
