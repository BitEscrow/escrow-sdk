import { EscrowClient } from '@/client/class/client.js'
import { DraftData }    from '@/types/index.js'
import { Logger }       from './utils.js'

export async function publish_contract_api (
  console : Logger
) {
  return async (
    client : EscrowClient,
    draft  : DraftData,
  ) => {
    console.log(`publishing contract on ${client.host} `)
    console.pause()
    try {
      // Deliver proposal and endorsements to server.
      const res = await client.contract.create(draft)
      // Check if response is valid.
      if (!res.ok) throw new Error(res.error)
      console.resume()
      return res.data.contract
    } catch (err) {
      console.resume()
      throw err
    }
  }
}
