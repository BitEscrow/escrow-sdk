import { CoreUtil } from '@scrow/test'
import { config }   from './00_demo_config.js'
import { client }   from './01_create_client.js'

export async function fund_address (
  address : string,
  amount  : number,
  feerate = 1
) {
  // Compute a txfee from the feerate.
  const vin_fee   = feerate * 65
  // Compute a total amount (in sats) with the txfee.
  const amt_total = amount + vin_fee

  switch (config.network) {
    case 'mutiny':
      fund_mutiny_address(address, amt_total)
      break
    case 'regtest':
      fund_regtest_address(address, amt_total)
      break
    default:
      fund_chain_address(address, amt_total)
  }

  await sleep(2000)

  const [ ival, retries ] = config.poll

  let tries = 1,
      utxos = await client.blockchain.get_address_utxos(address)

  // While there are no utxos (and we still have tries):
  while (utxos.length === 0 && tries < retries) {
    // Print current status to console.
    console.log(`[${tries}/${retries}] checking address in ${ival} seconds...`)
    // Sleep for interval number of secords.
    await sleep(ival * 1000)
    // Check again for utxos at address.
    utxos = await client.blockchain.get_address_utxos(address)
    // Increment our tries counter
    tries += 1
  }

  // If we still have no utxos, throw error.
  if (utxos.length === 0) throw new Error('utxo not found')

  print_banner('payment utxo')
  console.dir(utxos[0], { depth : null })

  return utxos[0].txspend
}

export async function fund_regtest_address (
  address : string,
  amount  : number  
)  {
  const daemon = CoreUtil.get_daemon({
    network : 'regtest',
    spawn   : false,
    verbose : false
  })
  console.log('\nfunding address :', address)
  console.log('sending amount  :', amount, '\n')
  return daemon.run(async client => {
    await CoreUtil.fund_address(client, 'faucet', address, amount, true)
    await daemon.shutdown()
  })
}

export async function fund_mutiny_address (
  address : string,
  amount  : number
) {
  console.log('\nfunding address :', address)
  console.log('sending amount  :', amount, '\n')

  const url = 'https://faucet.mutinynet.com/api/onchain'
  const opt = {
    body    : JSON.stringify({ address,  sats : amount }),
    headers : { 'content-type' : 'application/json' },
    method  : 'POST'
  }
  const res = await fetch(url, opt)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const { txid } = await res.json()
  return txid
}

export async function fund_chain_address (
  address : string,
  amount  : number,
) {
  // Also compute a total amount in bitcoin.
  const btc_total = amount / 100_000_000

  print_banner('make a deposit')
  console.log('copy this address :', address)
  console.log('send this amount  :', `${amount} sats || ${btc_total} btc`)
  console.log('get funds here    :', config.faucet, '\n')   
}