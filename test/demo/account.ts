import { EscrowClient } from '@/client/class/client.js'
import { EscrowSigner } from '@/client/class/signer.js'
import { Logger }       from './utils.js'

export async function reserve_account_api (
  console : Logger
) {
  return async (
    client : EscrowClient,
    funder : EscrowSigner
  ) => {
    console.log(`fetching account from ${client.host} `)
    console.pause()
    try {
      // Define our deposit locktime.
      const locktime = 60 * 60  // 1 hour locktime
      // Get an account request from the funder device.
      const req = funder.account.create(locktime)
      // Submit the account request to the server
      const res = await client.deposit.request(req)
      // Check the response is valid.
      if (!res.ok) throw new Error(res.error)
      const account = res.data.account
      // Verify the deposit.
      funder.account.verify(account)
      console.resume()
      return account
    } catch (err) {
      console.resume()
      throw err
    }
  }
}
