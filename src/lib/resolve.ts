import { ZodError, ZodSchema, ZodTypeAny } from 'zod'

/**
 * Helper method for resolving json
 * and other data from HTTP responses.
 */
export async function resolve_res <T> (
  res     : Response,
  schema ?: ZodTypeAny
) : Promise<T> {
  let data : T | undefined
  
  try {
    data = await res.json()
  } catch {
    data = undefined
  }

  if (!res.ok || data === undefined) {
    const { status, statusText } = res
    throw new ResponseError(statusText, status, data)
  }

  if (schema instanceof ZodSchema) {
    const parsed = await schema.spa(data)
    if (!parsed.success) {
      throw new SchemaError(parsed.error)
    } else {
      data = parsed.data as T
    }
  }

  return data
}

/**
 * Error class for handling response data.
 */
export class ResponseError <
  T = Record<string, any>
> extends Error {
  readonly status : number
  readonly info  ?: T

  constructor(
    reason : string,
    status : number,
    info  ?: T
  ) {
    super(reason)
    this.status = status
    this.info   = info
  }
}

export class SchemaError extends Error {
  readonly info : ZodError
  constructor (info : ZodError) {
    super('response data failed validation')
    this.info = info
  }
}
