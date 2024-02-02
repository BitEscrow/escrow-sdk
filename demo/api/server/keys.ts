import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

const res = await client.server.keys()
if (!res.ok) throw new Error(res.error)
const pubkeys = res.data.pubkeys

print_banner('server pubkeys')
console.dir(pubkeys, { depth: null })
console.log('\n')
