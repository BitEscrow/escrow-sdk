import { z } from 'zod'
import base  from './base.js'
import tx    from './tx.js'

const { bool, hash, hex, num, stamp, str } = base

const confirmed = z.object({
  confirmed    : z.literal(true),
  block_hash   : hash,
  block_height : num,
  block_time   : stamp
})

const unconfirmed = z.object({
  confirmed : z.literal(false)
})

const status = z.discriminatedUnion('confirmed', [ confirmed, unconfirmed ])

const spent = z.object({
  status,
  spent : z.literal(true),
  txid  : hash,
  vin   : num
})

const unspent = z.object({
  spent : z.literal(false)
})

const state = z.discriminatedUnion('spent', [ spent, unspent ])

const spend = z.object({ state, status, txout: tx.txspend })

const txout = z.object({
  scriptpubkey         : hex,
  scriptpubkey_asm     : str,
  scriptpubkey_type    : str,
  scriptpubkey_address : str.optional(),
  value                : num
})

const txin = z.object({
  txid          : hash,
  vout          : num,
  prevout       : txout.nullable().default(null),
  scriptsig     : hex,
  scriptsig_asm : str,
  sequence      : num,
  witness       : hex.array(),
  is_coinbase   : bool
})

const txdata = z.object({
  status,
  txid     : hash,
  version  : num,
  locktime : num,
  vin      : txin.array(),
  vout     : txout.array(),
  size     : num,
  weight   : num,
  fee      : num,
  hex      : hex.optional()
})

const utxo = z.object({
  txid  : hash,
  vout  : num,
  status,
  value : num
})

export default {
  txin,
  txout,
  txdata,
  txodata  : spend,
  txostate : state,
  txstatus : status,
  utxo
}
