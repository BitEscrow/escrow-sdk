import { z } from 'zod'
import base  from '@/core/schema/base.js'
import prop  from '@/core/schema/proposal.js'
import serv  from '@/core/schema/server.js'
import vm    from '@/core/schema/vm.js'

const { hash, hex, label, network, num, str } = base

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

const mship = z.tuple([ str, hex, hex.optional() ])

const path  = z.tuple([ label, num ])

const role = z.object({
  title     : label,
  min_slots : num.optional(),
  max_slots : num.optional(),
  paths     : path.array().optional(),
  payment   : num.optional(),
  programs  : prop.programs.optional()
})

const policy = z.object({
  id        : hash,
  title     : label,
  min_slots : num,
  max_slots : num,
  paths     : path.array(),
  payment   : num.optional(),
  programs  : prop.programs
})

const session = z.object({
  members  : mship.array(),
  proposal : prop.data,
  roles    : policy.array()
})

export default { client_config, mship, path, policy, role, session, signer_config }
