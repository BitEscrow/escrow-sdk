import { Signer }     from '@scrow/core'
import { CoreWallet } from '@cmdcode/core-cmd'

export interface MemberData {
  label  : string,
  signer : Signer, 
  wallet : CoreWallet
}
