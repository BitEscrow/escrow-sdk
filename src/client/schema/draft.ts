import { z } from 'zod'
import base  from '@/core/schema/base.js'
import prop  from '@/core/schema/proposal.js'

const { bool, hash, hex, label, num, str } = base

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

export default { cred, mship, path, policy, role, session }
