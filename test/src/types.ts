import { CoreWallet }   from '@cmdcode/core-cmd'
import { EscrowSigner } from '@/client/class/signer.js'

export interface EscrowMember {
  label  : string,
  client : EscrowSigner, 
  wallet : CoreWallet
}
