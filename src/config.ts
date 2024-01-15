const _MIN  =  60
const _HOUR = _MIN  * 60
const _DAY  = _HOUR * 24

export const SPEND_TXVIN_SIZE = 48
export const SPEND_TXWIT_SIZE = 66
export const SPEND_TXOUT_SIZE = 43
export const SPEND_TXDAT_SIZE = 10
export const REFUND_TX_VSIZE  = 118
export const RETURN_TX_VSIZE  = 520

export const VALID_ACTIONS = [ 'close', 'dispute', 'lock', 'resolve', 'unlock' ]
export const VALID_METHODS = [ 'sign' ]

export const MIN_DEADLINE = _MIN  * 30
export const MAX_EFFECT   = _DAY  * 30
export const MIN_EXPIRY   = _HOUR * 2
export const MAX_EXPIRY   = _DAY  * 30
export const MIN_WINDOW   = _MIN  * 10
export const MAX_WINDOW   = _DAY  * 30
export const GRACE_PERIOD = _DAY  * 2
export const MAX_MULTISIG = 100
export const STAMP_THOLD  = 500_000_000

export const DEFAULT_LOCKTIME = _DAY * 30
export const DEFAULT_NETWORK  = 'regtest'
export const DEFAULT_DEADLINE = MIN_WINDOW
export const DEFAULT_EXPIRES  = MIN_WINDOW
