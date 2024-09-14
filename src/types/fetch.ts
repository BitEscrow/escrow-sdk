export type ApiResponse<T> = DataResponse<T> | ErrorResponse

export interface DataResponse<T> {
  ok     : true
  data   : T
  error ?: string
  status : number
}

export interface ErrorResponse {
  ok     : false
  error  : string
  status : number
}
