import { ContractData, ContractPreImage, ContractStatus } from '@/core/types/index.js'
import { INIT_SPEND_STATE, INIT_SETTLE_STATE }            from '@/core/lib/tx.js'
import { assert, parse_proof, sort_record }               from '@/util/index.js'

export const INIT_PUBLISH_STATE = () => {
  return {
    funds_conf : 0,
    funds_pend : 0,
    tx_fees    : 0,
    tx_total   : 0,
    tx_vsize   : 0,
    vin_count  : 0
  }
}

export const INIT_CANCEL_STATE = () => {
  return {
    canceled     : false as const,
    canceled_at  : null,
    canceled_sig : null
  }
}

export const INIT_FUNDING_STATE = () => {
  return {
    secured      : false as const,
    secured_sig  : null,
    effective_at : null
  }
}

export const INIT_ACTIVE_STATE = () => {
  return {
    activated    : false as const,
    active_at    : null,
    active_sig   : null,
    machine_head : null,
    machine_vmid : null,
    expires_at   : null
  }
}

export const INIT_CLOSE_STATE = () => {
  return {
    closed       : false as const,
    closed_at    : null,
    closed_sig   : null,
    machine_vout : null
  }
}

export const GET_PUBLISH_STATE = () => {
  return {
    ...GET_ACTIVE_STATE(),
    ...INIT_ACTIVE_STATE(),
    ...INIT_CANCEL_STATE(),
    ...INIT_PUBLISH_STATE(),
    ...INIT_FUNDING_STATE(),
    created_sig : null,
    status      : 'published' as ContractStatus
  }
}

export const GET_CANCEL_STATE = () => {
  return {
    ...INIT_PUBLISH_STATE(),
    canceled_sig : null,
    status       : 'canceled' as ContractStatus
  }
}

export const GET_FUNDING_STATE = () => {
  return {
    ...GET_ACTIVE_STATE(),
    ...INIT_ACTIVE_STATE(),
    secured_sig : null,
    status      : 'secured' as ContractStatus
  }
}

export const GET_ACTIVE_STATE = () => {
  return {
    ...GET_CLOSE_STATE(),
    ...INIT_CLOSE_STATE(),
    active_sig   : null,
    machine_head : null,
    status       : 'active' as ContractStatus
  }
}

export const GET_CLOSE_STATE = () => {
  return {
    ...GET_SPEND_STATE(),
    ...INIT_SPEND_STATE(),
    closed_sig : null,
    status     : 'closed' as ContractStatus
  }
}

export const GET_SPEND_STATE = () => {
  return {
    ...INIT_SETTLE_STATE(),
    spent_sig : null,
    status    : 'spent' as ContractStatus
  }
}

export const GET_SETTLE_STATE = () => {
  return {
    settled_sig : null,
    status      : 'settled' as ContractStatus
  }
}

export function get_contract_state (
  contract : ContractPreImage,
  status   : ContractStatus
) {
  const { updated_at, ...rest } = contract
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
      state = { ...rest, ...GET_SETTLE_STATE() }
      stamp = contract.settled_at
      break
    default:
      throw new Error('unrecognized signature status: ' + status)
  }
  assert.exists(stamp)
  return { content: JSON.stringify(sort_record(state)), created_at: stamp }
}

export function get_contract_proof (
  contract : ContractData,
  status   : ContractStatus
) : { id : string, sig : string } {
  let sig
  switch (status) {
    case 'published':
      sig = contract.created_sig; break
    case 'canceled':
      sig = contract.canceled_sig; break
    case 'secured':
      sig = contract.secured_sig;  break
    case 'active':
      sig = contract.active_sig;   break
    case 'closed':
      sig = contract.closed_sig;   break
    case 'spent':
      sig = contract.spent_sig;    break
    case 'settled':
      sig = contract.settled_sig;  break
    default:
      throw new Error('unrecognized signature status: ' + status)
  }
  assert.exists(sig, 'contract signature returned null for status: ' + status)
  const proof = parse_proof(sig)
  return { id: proof[0], sig: proof[1] }
}
