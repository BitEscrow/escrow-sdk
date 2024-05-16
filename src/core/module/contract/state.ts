import { ContractData, ContractStatus }        from '@/core/types/index.js'
import { INIT_SPEND_STATE, INIT_SETTLE_STATE } from '@/core/lib/tx.js'
import { assert, sort_record }                 from '@/core/util/index.js'

export const INIT_PUBLISH_STATE = () => {
  return {
    funds_conf : 0,
    funds_pend : 0,
    vin_count  : 0
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
  let state, stamp
  switch (status) {
    case 'published':
     state = { ...rest, ...GET_PUBLISH_STATE() }
     stamp = contract.created_at
     break
    case 'canceled':
      state = rest
      stamp = contract.canceled_at
      break
    case 'secured':
      state = { ...rest, ...GET_FUNDING_STATE() }
      stamp = contract.effective_at
      break
    case 'active':
      state = { ...rest, ...GET_ACTIVE_STATE() }
      stamp = contract.active_at
      break
    case 'closed':
      state = { ...rest, ...GET_CLOSE_STATE() }
      stamp = contract.closed_at
      break
    case 'spent':
      state = { ...rest, ...GET_SPEND_STATE() }
      stamp = contract.spent_at
      break
    case 'settled':
      state = rest
      stamp = contract.settled_at
      break
    default:
      throw new Error('unrecognized signature status: ' + status)
  }
  assert.exists(stamp)
  return { content: JSON.stringify(sort_record(state)), created_at: stamp }
}
