import { z } from 'zod'
import base  from '@/core/schema/base.js'
import tx    from '@/core/schema/tx.js'

const { bool, hash, hex, num, stamp, str } = base

const tx_confirmed = z.object({
  confirmed    : z.literal(true),
  block_hash   : hash,
  block_height : num,
  block_time   : stamp
})

const tx_unconfirmed = z.object({
  confirmed : z.literal(false)
})

const tx_status = z.discriminatedUnion('confirmed', [ tx_confirmed, tx_unconfirmed ])

const spent = z.object({
  status : tx_status,
  spent  : z.literal(true),
  txid   : hash,
  vin    : num
})

const unspent = z.object({
  spent : z.literal(false)
})

const outspend = z.discriminatedUnion('spent', [ spent, unspent ])

const utxo_data = z.object({
  spend  : outspend,
  status : tx_status,
  utxo   : tx.txout
})

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
  status   : tx_status,
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
  txid   : hash,
  vout   : num,
  status : tx_status,
  value  : num
})

export default {
  txin,
  txout,
  txdata,
  outspend,
  utxo_data,
  utxo
}
