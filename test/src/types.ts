import { CoreWallet } from '@cmdcode/core-cmd'
import { Wallet }     from '@cmdcode/signer'
import { SignerAPI }  from '@scrow/sdk'

export interface CoreSigner {
  alias  : string
  core   : CoreWallet,
  signer : SignerAPI, 
  wallet : Wallet
}
