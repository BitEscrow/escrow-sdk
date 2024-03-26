import { parse_extkey }   from '@cmdcode/crypto-tools/hd'
import { verify_sig }     from '@cmdcode/crypto-tools/signer'
import { EscrowSigner }   from '@/client/index.js'
import { get_object_id }  from '@/util.js'

import {
  get_deposit_address,
  get_deposit_ctx
} from '@/core/lib/deposit.js'

import { DepositAccount } from '@/core/types/index.js'

import * as assert from '@/assert.js'

export function verify_account (
  account : DepositAccount,
  signer  : EscrowSigner
) {
  const { acct_id, acct_sig, ...rest } = account
  const { host_pub, network, pubkey }  = signer

  const {
    address, agent_pk, deposit_pk,
    sequence, spend_xpub
  } = rest

  assert.ok(host_pub !== undefined,           'host pubkey is not set on device')
  assert.ok(pubkey   === deposit_pk,          'deposit pubkey does not match device')
  assert.ok(signer.wallet.has(spend_xpub),    'account xpub is not recognized by master wallet')

  const return_pk = parse_extkey(spend_xpub).pubkey
  const context   = get_deposit_ctx(agent_pk, deposit_pk, return_pk, sequence)
  const depo_addr = get_deposit_address(context, network)
  const digest    = get_object_id(rest)

  assert.ok(address === depo_addr,            'account address does not match context')
  assert.ok(digest.hex === acct_id,           'account id does not match digest')

  verify_sig(acct_sig, acct_id, host_pub, { throws: true })
}
