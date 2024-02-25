import { EscrowClient } from 'https://unpkg.com/@scrow/core@latest/dist/module.mjs'
import { config }       from '../../src/config.js'

export const client = new EscrowClient(config.client)
