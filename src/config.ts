const _MIN  =  60
const _HOUR = _MIN  * 60
const _DAY  = _HOUR * 24

export const SPEND_TXIN_WEIGHT  = 1
export const SPEND_TXOUT_WEIGHT = 1
export const REFUND_TX_WEIGHT = 400
export const RETURN_TX_WEIGHT = 520

export const ACTION_LIST = [ 'close', 'dispute', 'lock', 'resolve', 'unlock' ]
export const METHOD_LIST = [ 'sign' ]

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
