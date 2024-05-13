import { ContractData, ContractStatus }        from '@/core/types/index.js'
import { INIT_SPEND_STATE, INIT_SETTLE_STATE } from '@/core/lib/tx.js'
import { sort_record } from '@/core/util/base.js'

export const INIT_PUBLISH_STATE = () => {
  return {
    fund_count : 0,
    fund_pend  : 0,
    fund_value : 0
  }
}

export const INIT_CANCEL_STATE = () => {
  return {
    canceled    : false as const,
    canceled_at : null
  }
}

export const INIT_FUNDING_STATE = () => {
  return {
    secured      : false as const,
    effective_at : null,
    tx_fees      : null,
    tx_total     : null,
    tx_vsize     : null
  }
}

export const INIT_ACTIVE_STATE = () => {
  return {
    activated   : false as const,
    active_at   : null,
    engine_vmid : null,
    expires_at  : null
  }
}

export const INIT_CLOSE_STATE = () => {
  return {
    closed      : false as const,
    closed_at   : null,
    engine_head : null,
    engine_vout : null
  }
}

export const GET_PUBLISH_STATE = () => {
  return {
    ...GET_ACTIVE_STATE(),
    ...INIT_ACTIVE_STATE(),
    ...INIT_CANCEL_STATE(),
    ...INIT_PUBLISH_STATE(),
    ...INIT_FUNDING_STATE(),
    status : 'published' as ContractStatus
  }
}

export const GET_CANCEL_STATE = () => {
  return {
    ...INIT_PUBLISH_STATE(),
    status : 'canceled' as ContractStatus
  }
}

export const GET_FUNDING_STATE = () => {
  return {
    ...GET_ACTIVE_STATE(),
    ...INIT_ACTIVE_STATE(),
    status : 'secured' as ContractStatus
  }
}

export const GET_ACTIVE_STATE = () => {
  return {
    ...GET_CLOSE_STATE(),
    ...INIT_CLOSE_STATE(),
    status : 'active' as ContractStatus
  }
}

export const GET_CLOSE_STATE = () => {
  return {
    ...GET_SPEND_STATE(),
    ...INIT_SPEND_STATE(),
    status : 'closed' as ContractStatus
  }
}

export const GET_SPEND_STATE = () => {
  return {
    ...INIT_SETTLE_STATE(),
    status : 'spent' as ContractStatus
  }
}

export function get_contract_state (
  contract : ContractData,
  status   : ContractStatus
) {
  const { sigs, updated_at, ...rest } = contract
  let preimage
  switch (status) {
    case 'published':
     preimage = { ...rest, ...GET_PUBLISH_STATE() }
     break
    case 'canceled':
      preimage = rest
      break
    case 'secured':
      preimage = { ...rest, ...GET_FUNDING_STATE() }
      break
    case 'active':
      preimage = { ...rest, ...GET_ACTIVE_STATE() }
      break
    case 'closed':
      preimage = { ...rest, ...GET_CLOSE_STATE() }
      break
    case 'spent':
      preimage = { ...rest, ...GET_SPEND_STATE() }
      break
    case 'settled':
      preimage = rest
      break
    default:
      throw new Error('unrecognized signature status: ' + status)
  }
  return JSON.stringify(sort_record(preimage))
}

export function get_contract_stamp (
  contract : ContractData,
  status   : ContractStatus
) {
  switch (status) {
    case 'published':
      return contract.created_at
    case 'canceled':
      return contract.canceled_at
    case 'secured':
      return contract.effective_at
    case 'active':
      return contract.active_at
    case 'closed':
      return contract.closed_at
    case 'spent':
      return contract.spent_at
    case 'settled':
      return contract.settled_at
    default:
      throw new Error('invalid signature status: ' + status)
  }
}
