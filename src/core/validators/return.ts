import { verify_covenant_psig } from './covenant.js'

import {
  create_return_template,
  get_return_session,
  parse_return_psig
} from '../lib/return.js'

import { RegisterTemplate } from '../types/index.js'

export function verify_return_psig (
  request     : RegisterTemplate,
  return_psig : string
) {
  //
  const [ pnonce, psig ] = parse_return_psig(return_psig)
  // Create a return transaction using the provided params.
  const txdata  = create_return_template(request)
  //
  const session = get_return_session(pnonce.hex, request, txdata)
  //
  verify_covenant_psig(session, psig.hex)
}
