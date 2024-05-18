import { z } from 'zod'
import base  from './base.js'

const { bool, hash, hex, num, stamp } = base

const confirm_info = z.object({
  confirmed    : bool,
  block_hash   : hash.nullable(),
  block_height : num.nullable(),
  block_time   : stamp.nullable(),
  expires_at   : stamp.nullable()
})

const tx_confirmed = z.object({
  confirmed    : z.literal(true),
  block_hash   : hash,
  block_height : num,
  block_time   : stamp,
  expires_at   : stamp
})

const tx_unconfirmed = z.object({
  confirmed    : z.literal(false),
  block_hash   : z.null(),
  block_height : z.null(),
  block_time   : z.null(),
  expires_at   : z.null()
})

const spend_info  = z.object({
  spent       : z.boolean(),
  spent_at    : stamp.nullable(),
  spent_sig   : hex.nullable(),
  spent_txhex : hex.nullable(),
  spent_txid  : hash.nullable()
})

const tx_spent = z.object({
  spent       : z.literal(true),
  spent_at    : stamp,
  spent_sig   : hex,
  spent_txhex : hex,
  spent_txid  : hash
})

const tx_unspent = z.object({
  spent       : z.literal(false),
  spent_at    : z.null(),
  spent_sig   : z.null(),
  spent_txhex : z.null(),
  spent_txid  : z.null()
})

const settle_info = z.object({
  settled     : z.boolean(),
  settled_at  : stamp.nullable(),
  settled_sig : hex.nullable()
})

const tx_settled = z.object({
  settled     : z.literal(true),
  settled_at  : stamp,
  settled_sig : hex
})

const tx_unsettled = z.object({
  settled     : z.literal(false),
  settled_at  : z.null(),
  settled_sig : z.null()
})

const confirm_state = z.discriminatedUnion('confirmed', [ tx_confirmed, tx_unconfirmed ])
const spend_state   = z.discriminatedUnion('spent',     [ tx_spent,   tx_unspent       ])
const settle_state  = z.discriminatedUnion('settled',   [ tx_settled, tx_unsettled     ])

const txout = z.object({
  txid      : hash,
  vout      : num,
  value     : num,
  scriptkey : hex
})

export default {
  confirm_info,
  confirm_state,
  settle_info,
  settle_state,
  spend_info,
  spend_state,
  tx_spent,
  tx_unspent,
  txout
}
