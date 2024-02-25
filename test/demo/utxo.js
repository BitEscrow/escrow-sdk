import { config }       from '../config.js'
import { client }       from './client.js'

const sleep = (ms = 1000) => new Promise(res => setTimeout(res, ms))

/** ========== [ Calculate Deposit Amount ] ========== **/

export async function get_utxo ({ account, contract, term }) {
  try {
    // Unpack account address.
    const { address } = account
    // Compute a txfee from the feerate.
    const vin_fee = contract.feerate * 65
    // Compute a total amount (in sats) with the txfee.
    const amount  = contract.total + vin_fee

    const url = `${config.faucet}/api/onchain`

    const opt = {
      body    : JSON.stringify({ address,  sats : amount }),
      headers : { 'content-type' : 'application/json' },
      method  : 'POST'
    }

    term.log(`requesting funds from ${config.faucet} `)
    term.dotstart()

    await fetch(url, opt)

    const [ ival, retries ] = config.poll

    let tries = 1,
        utxos = await client.oracle.get_address_utxos(address)

    // While there are no utxos (and we still have tries):
    while (utxos.length === 0 && tries < retries) {
      // Sleep for interval number of secords.
      await sleep(ival * 1000)
      // Check again for utxos at address.
      utxos = await client.oracle.get_address_utxos(address)
      // Increment our tries counter
      tries += 1
    }
  
    // If we still have no utxos, throw error.
    if (utxos.length === 0) throw new Error('utxo not found')

    term.log(`${amount} sats delivered to address:\n${address}`)
    
    const utxo = utxos[0].txspend

    term.dotstop()
    term.log(`confirmed utxo at satpoint:\n${utxo.txid}:${utxo.vout}`)
    
    return utxo
  } catch (err) {
    term.dotstop()
    throw err
  }
}
