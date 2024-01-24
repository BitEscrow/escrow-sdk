## Deposits

Deposits are the most magical part of the protocol, and a good amount of engineering has been poured into their construction.

Each deposit account is a time-locked 2-of-2 taproot address. All deposits are guaranteed refundable, and the script path is only revealed in a worst-case scenario.

In addition, this address is constructed using an extended version of the musig2 protocol, optimized for non-interactive signing a batch of transactions. This protocol is compatible with BIP327 and does not comprimise on any of the security features in the specification.

```ts
interface DepositData {
  agent_id     : string
  agent_key    : string
  agent_pn     : string
  block_hash   : string | null
  block_height : number | null
  block_time   : number | null
  confirmed    : boolean
  covenant     : CovenantData | null
  created_at   : number
  expires_at   : number | null
  deposit_id   : string
  deposit_key  : string
  return_tx    : string
  scriptkey    : string
  sequence     : number
  settled      : boolean
  settled_at   : number | null
  spent        : boolean,
  spent_at     : number | null
  spent_txid   : string | null
  status       : DepositStatus
  txid         : string
  updated_at   : number
  value        : number
  vout         : number
}
```

It is important to note that a deposit can be released from one contract, and signed to another, without requiring an on-chain transaction. This is particularly useful if a contract expires or is otherwise cancelled, as the deposits can be reused immediately.

The caveat with this is that there is currently no revocation protocol in place for past covenants, so technically the agent has a limited opportunity to double-spend. There are plans to impove the off-chain use of deposits in a future version of the protocol.

```ts
type DepositStatus =
'reserved' | // An account has been reserved, no deposit registered.
'pending'  | // Deposit is registered in mempool and ready for signing.
'stale'    | // Deposit is stuck in mempool, must wait for confirmation.
'open'     | // Deposit is confirmed and ready for signing
'locked'   | // Deposit is currently locked to a covenant.
'spent'    | // Deposit has been spent and is awaiting confirmation.
'settled'  | // Deposit spending tx has been confirmed.
'expired'  | // Deposit time-lock is expired, no longer secured.
'error'      // Something went wrong, may need manual intervention.
```

When a contract is settled, it will appear on the blockchain as a simple P2TR (Pay to Taproot) transaction. No information about the contract, its depositors, or its participating members, are ever revealed.

## Covenants

A covenant is created using a custom protocol that wraps the musig2 protocol, and allows us to perform batch signing of transactions. It involves the use of a `root` nonce value for each signing member, which is then further tweaked in a non-interactive way. Each tweaked nonce value is then used in a standard musig2 signing session.

In regards to scaling, the protocol is O(1) for the coordinated negotiation of root nonces, requires O(n = outputs) partial signatures from each depositor, and O(n * m = depositors) for verification of signatures by the agent.

The protocol is relatively simple:

* All parties compute a hash that commits to the full terms of the contract.
  > Ex: hash340('root_nonce', serialize(contract_terms))
* Each member uses this hash to produce a root nonce value using BIP340 nonce generation.
* The agent includes their root public nonce value with the contract.
* For _each_ transaction, the depositor performs the following:
  - The depositor computes a second commitment that includes both root pnonces, plus the transaction.
    > Ex: hash340('contract/root_tweak', depositor_root_pnonce, agent_root_pnonce, sighash(tx))
  - This second hash is used to tweak the root pnonce for both the depositor and the agent.
  - The new pnonce values are used to compute a musig2 signing session, plus partial signature for the transaction.
* Each depositor delivers their pubkey, root pnonce value and payload of signatures to the agent.
* The agent can select a particular transaction, compute the tweak and musig context, then finalize the signature.

The purpose of the root nonce value is to guarantee that each derived nonce value is computed fairly, regardless of whom performs the computation. Each tweak extends the commitment of the root nonce value to the specific transaction being signed.

The root nonce value is never used directly in any signing operation. Each partial signature is computed using a derived nonce, via the standard musig2 protocol. This includes a full commitment to the session state and tweaked nonce values.

```ts
export interface CovenantData {
  cid    : string
  pnonce : string
  psigs  : [ string, string ][]
}
```

Each signature is flagged using the sighash flag ANYONECANPAY, allowing each deposit to be included among any combination of other inputs signed to the contract. Once all deposits and covenants have been collected for a given contract (and verified by the agent), the contract is considered active.
