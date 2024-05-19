import { z } from 'zod'
import base  from '@/core/schema/base.js'

const { hash, network, str } = base

const signer_config = z.object({
  network,
  server_pk  : hash,
  server_url : str
})

const client_config = signer_config.extend({
  oracle_url : str
})

export default { client_config, signer_config }
