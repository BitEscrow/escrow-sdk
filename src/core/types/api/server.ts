import { ServerPolicy } from '../server.js'

export interface ServerKeysResponse {
  pubkeys : string[]
}

export interface ServerPolicyResponse {
  policy : ServerPolicy
}

export interface ServerStatusResponse {
  status : string
}
