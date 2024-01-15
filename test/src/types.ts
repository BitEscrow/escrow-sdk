import { CoreWallet } from '@cmdcode/core-cmd'
import { Wallet }     from '@cmdcode/signer'
import { SignerAPI }  from '@/types/index.js'

export interface CoreSigner {
  core   : CoreWallet,
  signer : SignerAPI, 
  wallet : Wallet
}
