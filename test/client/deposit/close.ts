import { CoreDaemon } from '@cmdcode/core-cmd'

import {
  EscrowClient,
  Signer
} from '@scrow/core'

import ctx from '../const.js'

const core = new CoreDaemon({
  debug   : false,
  verbose : false
})

const cli      = await core.startup() 
const wallet   = await cli.load_wallet('alice')
const hostname = ctx.escrow
const oracle   = ctx.oracle
const signer   = Signer.seed('alice')
const client   = new EscrowClient(signer, { hostname, oracle })

const deposit_id = '9bab243c5a425826afa2ee1cac37da01790ff0ed5b13ef834770b87626ed4ab0'

const address = await wallet.new_address
const deposit = await client.deposit.read(deposit_id)
const closed  = await client.deposit.close(address, deposit)

console.log('Deposit data:', closed)
