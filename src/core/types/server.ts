export interface ServerPolicy {
  account : {
    LOCKTIME_MIN  : number
    LOCKTIME_MAX  : number
    TOKEN_EXPIRY  : number
  }
  contract : {
    HOST_FEE_FLAT : number
    HOST_FEE_PCT  : number
    UPDATE_IVAL   : number
  }
  deposit : {
    FEERATE_MIN   : number
    FEERATE_MAX   : number
    GRACE_PERIOD  : number
    LOCK_FEE_FLAT : number
    UPDATE_IVAL   : number
  }
  proposal : {
    DEADLINE_MIN  : number
    DEADLINE_MAX  : number
    DEADLINE_DEF  : number
    DURATION_MIN  : number
    DURATION_MAX  : number
    DURATION_DEF  : number
    EFFECTIVE_MAX : number
    MULTISIG_MAX  : number
    TIMEOUT_MIN   : number
    TIMEOUT_MAX   : number
    TIMEOUT_DEF   : number
    VALID_ACTIONS : string[]
    VALID_METHODS : string[]
  }
  witness : {
    UPDATE_IVAL   : number
  }
}
