import { z } from 'zod'
import base  from '@/core/schema/base.js'
import serv  from '@/core/schema/server.js'
import vm    from '@/core/schema/vm.js'

const { hash, network, str } = base

const signer_config = z.object({
  machine    : vm.api,
  network,
  server_pol : serv.policy,
  server_pk  : hash,
  server_url : str
})

const client_config = signer_config.extend({
  oracle_url : str
})

export default { client_config, signer_config }
