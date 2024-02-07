import { config }              from '@scrow/demo/00_demo_config.js'
import { client }              from '@scrow/demo/01_create_client.js'
import { print_banner, sleep } from '@scrow/test'
import { fund_amt, signer }    from './00_config.js'

/** ========== [ Get latest Contract ] ========== **/

const contracts_res = await signer.fetch.contracts()

if (!contracts_res.ok) throw new Error(contracts_res.error)

const contract = contracts_res.data.contracts[0]

/** ========== [ Get Deposit Accout ] ========== **/

// Define our deposit locktime.
const locktime  = 60 * 60  // 1 hour locktime
// Get an account request from the device.
const acct_req = signer.account.create(locktime)
// Submit the account request to the server
const acct_res = await client.deposit.request(acct_req)
// Check the response is valid.
if (!acct_res.ok) throw new Error(acct_res.error)
// 
const new_account = acct_res.data.account
// Verify the deposit.
signer.account.verify(new_account)
//
const address = new_account.address

/** ========== [ Print Deposit Info ] ========== **/

print_banner('make a deposit')
console.log('copy this address :', new_account.address)
console.log('send this amount  :', `${fund_amt} sats`)
console.log('get funds here    :', config.faucet, '\n')

/** ========== [ Poll Deposit Status ] ========== **/

const [ ival, retries ] = config.poll

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

/** ========== [ Create Deposit Covenant ] ========== **/

// Get the output data from the utxo.
const utxo       = utxos[0].txspend
// Request the funders device to sign a covenant.
const commit_req = signer.account.commit(new_account, contract, utxo)
// Deliver our registration request to the server.
const res = await client.deposit.commit(commit_req)
// Check the response is valid.
if (!res.ok) throw new Error(res.error)

const funded_contract = res.data.contract
const locked_deposit  = res.data.deposit

print_banner('locked deposit')
console.dir(locked_deposit, { depth : null })

print_banner('funded contract')
console.dir(funded_contract, { depth : null })
