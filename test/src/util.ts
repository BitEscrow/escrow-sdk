import { Buff }           from "@cmdcode/buff"
import { Signer, Wallet } from "@cmdcode/signer"
import { EscrowSigner }   from "@/client/class/signer.js"
import { ClientConfig }   from "@/client/types.js"
import { parse_network }  from "@/lib/parse.js"
import { Network }        from "@/types/index.js"

// Basic sleep method.
export const sleep = (ms = 1000) => new Promise(res => setTimeout(res, ms)) 

/**
 * Take a string label as input, and return an
 * escrow client that is configured for testing.
 */

export function get_member (
  alias  : string,
  config : ClientConfig
) : EscrowSigner {
  // Unpack the config object.
  const network = (config.network !== undefined)
    ? parse_network(config.network)
    : 'regtest' as Network
  // Freeze the idx generation at 0 for test purposes.
  const idxgen = () => 0
  // Create a basic deterministic seed.
  const seed   = Buff.str(alias).digest
  // Create a new signer using the seed.
  const signer = new Signer({ seed })
  // Create a new wallet using the seed.
  const wallet = Wallet.create({ seed, network })
  // Return an escrow client.
  return new EscrowSigner({ ...config, idxgen, signer, wallet })
}

/**
 * Create a banner message in the console.
 */
export function print_banner (msg : string) {
  console.log('\n' + '='.repeat(40))
  console.log(` ${msg} `)
  console.log('='.repeat(40) + '\n')
}
