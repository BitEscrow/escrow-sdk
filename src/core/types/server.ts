export interface ServerPolicy {
  account : {
    FEERATE_MIN   : number
    FEERATE_MAX   : number
    GRACE_PERIOD  : number
    LOCKTIME_MIN  : number
    LOCKTIME_MAX  : number
    TOKEN_EXPIRY  : number
  }
  proposal : {
    FEERATE_MIN   : number
    FEERATE_MAX   : number
    DEADLINE_MIN  : number
    DEADLINE_MAX  : number
    DURATION_MIN  : number
    DURATION_MAX  : number
    EFFECTIVE_MAX : number
    MULTISIG_MAX  : number
    TXTIMEOUT_MIN : number
    TXTIMEOUT_MAX : number
    VALID_ENGINES : string[]
  }
}
