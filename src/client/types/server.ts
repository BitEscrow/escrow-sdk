import { AccountPolicy, Network, ProposalPolicy } from '@/core/types/index.js'

export type ApiResponse<T> = DataResponse<T> | ErrorResponse

export interface DataResponse<T> {
  ok     : true
  data   : T
  error ?: string
  status : number
}

export interface ErrorResponse {
  ok     : false
  error  : string
  status : number
}

export interface ServerConfig {
  oracle_url : string
  server_pk  : string
  server_url : string
  network    : Network
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
