import { print_banner }        from '@scrow/test'
import { faucet, poll, sleep } from './00_demo_config.js'
import { client }              from './01_create_client.js'
import { signers }             from './02_create_signer.js'
import { contract }            from './05_create_contract.js'
import { account }             from './06_request_account.js'

/** ========== [ Calculate Deposit Amount ] ========== **/

// Unpack account data.
const { address, deposit_pk, sequence, spend_xpub } = account
// Compute a txfee from the feerate.
const vin_fee   = contract.feerate * 65
// Compute a total amount (in sats) with the txfee.
const amt_total = contract.total + vin_fee
// Also compute a total amount in bitcoin.
const btc_total = amt_total / 100_000_000

/** ========== [ Print Deposit Info ] ========== **/

print_banner('make a deposit')

console.log('copy this address :', address)
console.log('send this amount  :', `${amt_total} sats || ${btc_total} btc`)
console.log('get funds here    :', faucet, '\n')

/** ========== [ Poll Deposit Status ] ========== **/

const [ ival, retries ] = poll

let tries = 1,
    utxos = await client.oracle.get_address_utxos(address)

// While there are no utxos (and we still have tries):
while (utxos.length === 0 && tries < retries) {
  // Print current status to console.
  console.log(`[${tries}/${retries}] checking address in ${ival} seconds...`)
  // Sleep for interval number of secords.
  await sleep(ival * 1000)
  // Check again for utxos at address.
  utxos = await client.oracle.get_address_utxos(address)
  // Increment our tries counter
  tries += 1
}
// If we still have no utxos, throw error.
if (utxos.length === 0) throw new Error('utxo not found')
// Print our utxo to console.
console.log('\nutxo:', utxos[0])

/** ========== [ Create Deposit Covenant ] ========== **/

// Choose our first signer as the funder.
const signer    = signers[0]
// Get the output data from the utxo.
const utxo      = utxos[0].txspend
// Request the funders device to sign a covenant.
const covenant  = signer.account.commit_utxo(account, contract, utxo)
// Build our registration request to the server.
const reg_req   = { covenant, deposit_pk, sequence, spend_xpub, utxo }
// Deliver our registration request to the server.
const res = await client.deposit.fund(reg_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)

/**
 * Define our deposit and funded contract.
 */
const { contract: funded_contract, deposit } = res.data

export const cid = funded_contract.cid

/** ========== [ Export New Data ] ========== **/

print_banner('locked deposit')
console.dir(deposit, { depth : null })

print_banner('funded contract')
console.dir(funded_contract, { depth : null })
