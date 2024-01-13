import { CoreWallet } from '@cmdcode/core-cmd'
import { SignerAPI }  from '@/index.js'

export interface EscrowMember {
  label  : string,
  signer : SignerAPI, 
  wallet : CoreWallet
}
