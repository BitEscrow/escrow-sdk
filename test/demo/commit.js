import { client }  from './client.js'
import { signers } from './signer.js'

export async function commit_utxo ({ account, contract, utxo, term }) {
  term.log(`commit utxo with ${client.host} `)
  term.dotstart()
  try {
    const funder = signers[0]
    const req    = funder.account.commit(account, contract, utxo)
    const res    = await client.deposit.commit(req)
    // Check the response is valid.
    if (!res.ok) throw new Error(res.error)
    term.dotstop()
    return res.data.deposit
  } catch (err) {
    term.dotstop()
    throw err
  }
}
