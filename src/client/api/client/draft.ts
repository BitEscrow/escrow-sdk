import { EscrowClient } from '@/client/class/client.js'

import {
  create_session,
  decode_session,
  encode_session,
  publish_session,
  verify_session
} from '@/client/lib/session.js'

export default function (_client : EscrowClient) {
  return {
    create  : create_session,
    decode  : decode_session,
    encode  : encode_session,
    publish : publish_session,
    verify  : verify_session
  }
}
