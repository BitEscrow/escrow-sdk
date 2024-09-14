import { ApiResponse } from '@/types/index.js'

export function get_fetcher (fetcher = fetch) {
  return {
    json : async <T> (
      input : URL | RequestInfo,
      init ?: RequestInit
    ) => {
      return fetch_json<T>(input, init, fetcher)
    },
    text : async (
      input : URL | RequestInfo,
      init ?: RequestInit
    ) => {
      return fetch_text(input, init, fetcher)
    }
  }
}

export async function fetch_json <T> (
  input : URL | RequestInfo,
  init ?: RequestInit,
  fetcher = fetch
) {
    // Fetch response using fetcher.
    const res = await fetcher(input, init)
    // Resolve response as json.
    return resolve_json<T>(res)
}

export async function fetch_text (
  input : URL | RequestInfo,
  init ?: RequestInit,
  fetcher = fetch
) {
  // Fetch response using fetcher.
  const res = await fetcher(input, init)
  // Resolve response as json.
  return resolve_text(res)
}

/**
 * Helper method for resolving json from HTTP responses.
 */
export async function resolve_json <T> (
  res : Response
) : Promise<ApiResponse<T>> {
  // Unpack response object.
  const { status, statusText } = res
  // Try to resolve the data:
  if (!res.ok) {
    const error = await res.text() ?? statusText
    return { error, status, ok: false }
  } else {
    const data = await res.json() as T
    return { status, ok: true, data }
  }
}

/**
 * Helper method for resolving text from HTTP responses.
 */
export async function resolve_text (
  res : Response
) : Promise<ApiResponse<string>> {
  // Unpack response object.
  const { status, statusText } = res
  // Try to resolve the data:
  if (!res.ok) {
    const error = await res.text() ?? statusText
    return { error, status, ok: false }
  } else {
    const data = await res.text()
    return { status, ok: true, data }
  }
}
