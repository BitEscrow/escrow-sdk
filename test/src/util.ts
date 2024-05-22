import { ChainNetwork } from '@scrow/sdk'

import ServerConfigs from './config/servers.json' assert { type : 'json' }

export function get_server_config (network : ChainNetwork) {
  return ServerConfigs[network as keyof typeof ServerConfigs]
}

export function print_banner (title : string) {
  console.log(`\n\n=== [ ${title} ] ===`.padEnd(80, '=') + '\n\n')
}
