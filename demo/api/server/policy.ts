import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

const res = await client.server.policy()
if (!res.ok) throw new Error(res.error)
const policy = res.data.policy

print_banner('server policy')
console.dir(policy, { depth: null })
console.log('\n')
