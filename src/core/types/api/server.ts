import { ServerConfig } from '../server.js'

export interface ServerKeysResponse {
  pubkeys : string[]
}

export interface ServerPolicyResponse {
  policy : ServerConfig
}

export interface ServerStatusResponse {
  status : string
}
