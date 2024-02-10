import { config }        from '@scrow/demo/00_demo_config.js'
import { client }        from '@scrow/demo/01_create_client.js'
import { print_banner }  from '@scrow/test'
import { EscrowAccount } from '@/index.js'
import { fund_amt }      from './00_config.js'

import { fund_address, sleep } from '@scrow/demo/util.js'

const account = new EscrowAccount(client)

account.on('reserved', async (acct) => {
  if (config.network !== 'regtest') {
    print_banner('make a deposit')
    console.log('copy this address :', acct.data.address)
    console.log('send this amount  :', `${fund_amt} sats`)
    console.log('get funds here    :', config.faucet, '\n')
  } else {
    print_banner('sending deposit')
    await fund_address(acct.data.address, fund_amt)
    await sleep(2000)
  }

  let ival = 10, retries = 30

  await acct.poll(ival, retries)
})

account.on('fetch', () => {
  console.log('checking the oracle for new payments...')
})

export { account }
