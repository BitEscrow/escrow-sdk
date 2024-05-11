import { z } from 'zod'
import base  from '@/core/schema/base.js'
import prop  from '@/core/schema/proposal.js'

const { bool, hash, hex, label, network, num, str } = base

const signer_config = z.object({
  network,
  server_pk  : hash,
  server_url : str
})

const client_config = signer_config.extend({
  oracle_url : str
})

const cred = z.object({
  pub  : hash,
  xpub : str
})

const mship = cred.extend({
  pid : hash,
  sig : hex.optional()
})

const path  = z.tuple([ label, num ])

const role = z.object({
  title     : label,
  moderator : bool.optional(),
  paths     : path.array().optional(),
  payment   : num.optional(),
  programs  : prop.programs.optional(),
  seats     : num.optional()
})

const policy = z.object({
  id        : hash,
  title     : label,
  moderator : bool,
  paths     : path.array(),
  payment   : num.optional(),
  programs  : prop.programs,
  seats     : num
})

const session = z.object({
  members  : mship.array(),
  proposal : prop.data,
  roles    : policy.array(),
  sigs     : hex.array()
})

export default { client_config, cred, mship, path, policy, role, session, signer_config }
