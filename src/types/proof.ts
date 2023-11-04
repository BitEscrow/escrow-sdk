import { Literal } from './base.js'

export interface ProofConfig {
  since ?: number
  throws : boolean
  until ?: number
}

export interface ProofData {
  ref    : string
  pub    : string
  pid    : string
  sig    : string
  params : string[][]
}

export interface SignedEvent {
  pubkey     : string
  created_at : number
  id         : string
  sig        : string
  kind       : number
  content    : string
  tags       : Literal[][]
}
