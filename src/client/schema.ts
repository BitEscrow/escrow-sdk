import { z } from 'zod'
import base  from '@/schema.js'

const { hash, network, str } = base

const client_config = z.object({
  network,
  oracle_url : str,
  server_url : str
})

const signer_config = z.object({
  network,
  server_pk  : hash,
  server_url : str
})

export default { client_config, signer_config }
