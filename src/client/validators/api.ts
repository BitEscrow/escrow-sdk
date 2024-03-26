import {
  AccountRequest,
  RegisterRequest,
  CloseRequest,
  CommitRequest,
  LockRequest
} from '../../core/types/index.js'

import * as schema from '../../core/schema/index.js'

export function validate_account_req (
  template : unknown
) : asserts template is AccountRequest {
  schema.api.deposit.account.parse(template)
}

export function validate_register_req (
  template : unknown
) : asserts template is RegisterRequest {
  schema.api.deposit.register.parse(template)
}

export function validate_commit_req (
  template : unknown
) : asserts template is CommitRequest {
  schema.api.deposit.commit.parse(template)
}

export function validate_lock_req (
  template : unknown
) : asserts template is LockRequest {
  schema.api.deposit.lock.parse(template)
}

export function validate_close_req (
  template : unknown
) : asserts template is CloseRequest {
  schema.api.deposit.close.parse(template)
}
