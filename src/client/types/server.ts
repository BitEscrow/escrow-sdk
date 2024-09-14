import type { AccountPolicy, ChainNetwork, ProposalPolicy } from '@/types/index.js'

export interface ServerConfig {
  oracle_url : string
  server_pk  : string
  server_url : string
  network    : ChainNetwork
}

export interface ServerKeysResponse {
  pubkeys : string[]
}

export interface ServerPolicyResponse {
  policy : ServerPolicy
}

export interface ServerStatusResponse {
  status : string
}

export interface ServerPolicy {
  account  : AccountPolicy
  proposal : ProposalPolicy
}
