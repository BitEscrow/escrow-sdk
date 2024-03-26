import { TxData } from '@scrow/tapscript'

export interface ReturnContext {
  pubkey    : string
  sequence  : number
  signature : string
  tapkey    : string
  tx        : TxData
}

export interface ReturnData {
  dpid   : string
  pnonce : string
  psig   : string
  txhex  : string
}
