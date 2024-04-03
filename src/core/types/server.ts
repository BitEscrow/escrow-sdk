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
    UPDATE_IVAL   : number
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
  }
  vm : {
    VALID_MACHINES : string[]
  }
  witness : {
    UPDATE_IVAL   : number
  }
}
