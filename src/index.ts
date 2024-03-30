import DefaultConfig from './config/server.json' assert { type : 'json' }
import DefaultPolicy from './config/policy.json' assert { type : 'json' }

export * from './client/index.js'
export * from './core/index.js'
export * from './vm/types.js'

export * as Assert from './assert.js'
export * as Config from './config/index.js'
export * as Schema from './schema.js'
export * as Util   from './util.js'

export * from './types.js'

export {
  DefaultConfig,
  DefaultPolicy
}
