import { z }      from 'zod'
import CoreSchema from '@/core/schema/index.js'

const { hash, network, str } = CoreSchema.base

const signer = z.object({
  network,
  server_pk  : hash,
  server_url : str
})

const client = signer.extend({
  oracle_url : str
})

export default { client, signer }
