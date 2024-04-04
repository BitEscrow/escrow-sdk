export const DEPOSIT_TX_SIZE  = 234
export const DEPOSIT_TX_VSIZE = 154
export const RECOVER_TX_VSIZE = 118
export const RETURN_TX_VSIZE  = 90

// Version (4) + Locktime (4) + Vin Count(1+) + Vout Count(1+)
export const SPEND_TX_BASE_SIZE = 10
// Txid (32) + vout (4) + script (1) + sequence (4)
export const SPEND_TXIN_BASE_SIZE = 41
// Stack Count (1) + Varint (2) + Signature (64) + Sigflag (1)
export const SPEND_TXIN_WIT_VSIZE = 18 // 67 / 4
//
export const SPEND_TXIN_SIZE = SPEND_TXIN_BASE_SIZE + SPEND_TXIN_WIT_VSIZE
//
export const DEADLINE_DEFAULT  = 7200
export const DURATION_DEFAULT  = 7200
export const TXTIMEOUT_DEFAULT = 7200
export const MACHINE_DEFAULT   = 'cvm'

export const VALID_FEE_TARGETS = [
  ...Array.from({ length: 25 }, (_, i) => i + 1),
  144,
  504,
  1008
 ]
