import { client }   from './client.js'

export async function register_utxo ({ account, utxo, term }) {
  try {
    term.log(`registering utxo with ${client.host} `)
    term.dotstart()
    const res = await client.deposit.register({ ...account, utxo })
    // Check the response is valid.
    if (!res.ok) throw new Error(res.error)
    term.dotstop()
    return res.data.deposit
  } catch (err) {
    term.dotstop()
    throw err
  }
}
