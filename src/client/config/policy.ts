export default {
  account : {
    LOCKTIME_MIN : 172800,
    LOCKTIME_MAX : 2592000,
    TOKEN_EXPIRY : 512
  },
  contract : {
    HOST_FEE_FLAT : 1000,
    HOST_FEE_PCT  : 0,
    UPDATE_IVAL   : 512
  },
  deposit : {
    FEERATE_MIN  : 1,
    FEERATE_MAX  : 500,
    GRACE_PERIOD : 86400,
    UPDATE_IVAL  : 512
  },
  proposal : {
    FEERATE_MIN   : 1,
    FEERATE_MAX   : 500,
    DEADLINE_MIN  : 7200,
    DEADLINE_MAX  : 2592000,
    DURATION_MIN  : 7200,
    DURATION_MAX  : 2592000,
    EFFECTIVE_MAX : 172800,
    MULTISIG_MAX  : 27,
    TXTIMEOUT_MIN : 3600,
    TXTIMEOUT_MAX : 86400
  },
  vm : {
    VALID_MACHINES : [ 'cvm' ]
  },
  witness : {
    UPDATE_IVAL : 512
  }
}
