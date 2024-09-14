import { z } from 'zod'
import base  from '@/schema/base.js'

const { hash, network, str } = base

const signer = z.object({
  network,
  server_pk  : hash,
  server_url : str
})

const client = signer.extend({
  oracle_url : str
})

export default { client, signer }
