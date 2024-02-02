import { print_banner } from '@scrow/test'
import { client }       from '@scrow/demo/01_create_client.js'

const res = await client.server.status()
if (!res.ok) throw new Error(res.error)
const status = res.data.status

print_banner('server status')
console.dir(status, { depth: null })
console.log('\n')
