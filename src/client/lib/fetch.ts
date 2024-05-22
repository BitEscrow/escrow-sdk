import { ApiResponse, OracleTxSpendData } from '@/client/types/index.js'

import { TxConfirmState } from '@/core/types/index.js'

export async function fetcher <T> (
  input   : URL | RequestInfo,
  init   ?: RequestInit,
  fetcher = fetch
) {
  // Fetch response using fetcher.
  const res = await fetcher(input, init)
  // Resolve response as json.
  return resolve_json<T>(res)
}

/**
 * Helper method for resolving json
 * and other data from HTTP responses.
 */
export async function resolve_json <T> (
  res : Response
) : Promise<ApiResponse<T>> {
  // Unpack response object.
  const { status, statusText } = res
  // Initialize our data variable.
  let data : any
  // Try to resolve the data:
  try {
    // Resolve the data as json.
    data = await res.json()
  } catch {
    // Else, leave undefined.
    data = undefined
  }
  // If the response is not ok:
  if (!res.ok) {
    // Find and set error message.
    const error = (typeof data?.error === 'string')
      ? data.error
      : statusText
    // Return response with error.
    return { status, ok: false, error }
  }
  // If data is undefined:
  if (data === undefined) {
    // Return response with error.
    return {
      status,
      ok    : false,
      error : 'data is undefined'
    }
  }
  // Return response with data.
  return { status, ok: true, data }
}

export function get_confirm_state (
  data     : OracleTxSpendData,
  locktime : number
) : TxConfirmState {
  if (data.status.confirmed) {
      const expires_at = data.status.block_time + locktime
      return { ...data.status, expires_at }
  } else {
    return {
      confirmed    : false as const,
      block_hash   : null,
      block_height : null,
      block_time   : null,
      expires_at   : null
    }
  }
}
