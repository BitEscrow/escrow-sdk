import BaseSchema   from './base.js'

import ClientSchema from '@/client/schema/index.js'
import CoreSchema   from '@/core/schema/index.js'
import CVMSchema    from '@/cvm/schema.js'

export default {
  base   : BaseSchema,
  client : ClientSchema,
  core   : CoreSchema,
  cvm    : CVMSchema
}
