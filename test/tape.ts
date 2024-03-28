import tape           from 'tape'
import { get_daemon } from './src/core.js'

import e2e_recover_test from './src/e2e/recover.test.js'
import e2e_return_test  from './src/e2e/return.test.js'
import e2e_settle_test  from './src/e2e/settle.test.js'

// import vm_test  from './src/vm/vm.test.js'

const local_config = {
  network  : 'regtest',
  verbose  : false,
  core_params : [ '-reindex' ]
}

tape('Escrow Core Test Suite', async t => {
  // vm_test(t)
  const core   = get_daemon(local_config)
  const client = await core.startup()

  await e2e_settle_test(client, t)
  await e2e_return_test(client, t)
  await e2e_recover_test(client, t)

  t.teardown(() => { core.shutdown() })
})
