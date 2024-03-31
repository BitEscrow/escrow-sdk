import { z } from 'zod'

type Literal = z.infer<typeof literal>
type Json    = Literal | { [key : string] : Json } | Json[]

const address = z.string(),
      bool    = z.boolean(),
      date    = z.date(),
      index   = z.number().max(1024),
      num     = z.number().max(Number.MAX_SAFE_INTEGER),
      script  = z.string().array(),
      str     = z.string(),
      stamp   = z.number().min(500_000_000),
      value   = z.bigint().max(100_000_000n * 21_000_000n)

const hex = z.string()
  .regex(/^[0-9a-fA-F]*$/)
  .refine(e => e.length % 2 === 0)

const literal = z.union([
  z.string(), z.number(), z.boolean(), z.null()
])

const json : z.ZodType<Json> = z.lazy(() =>
  z.union([ literal, z.array(json), z.record(json) ])
)

const label     = z.string().regex(/^[0-9a-zA-Z_-]{2,64}$/)
const network   = z.enum([ 'main', 'regtest', 'signet', 'testnet', 'mutiny' ])
const payment   = z.tuple([ num, address ])
const paypath   = z.tuple([ label, num, address ])
const regex     = z.string().regex(/[a-zA-Z0-9_|*-]/)

const hash      = hex.refine((e) => e.length === 64)
const pubkey    = hex.refine((e) => e.length === 64 || e.length === 66)
const nonce     = hex.refine((e) => e.length === 128)
const psig      = hex.refine((e) => e.length === 256)
const signature = hex.refine((e) => e.length === 128)

const base64    = z.string().regex(/^[a-zA-Z0-9+/]+={0,2}$/)
const base64url = z.string().regex(/^[a-zA-Z0-9\-_]+={0,2}$/)
const bech32    = z.string().regex(/^[a-z]+1[023456789acdefghjklmnpqrstuvwxyz]+$/)

const proof = z.tuple([
  z.string(), pubkey, hash, signature, stamp
])

const entry   = z.tuple([ z.string(), literal ])
const record  = z.record(literal.array())
const tags    = literal.array()
const prevout = z.object({ value, script })

const note    = z.object({
  content    : str,
  created_at : stamp,
  id         : hash,
  kind       : num,
  pubkey     : hash,
  sig        : nonce,
  tags       : z.array(str.array())
})

export default {
  address,
  base64,
  base64url,
  bech32,
  bool,
  date,
  entry,
  hash,
  hex,
  index,
  json,
  literal,
  label,
  network,
  nonce,
  note,
  num,
  paypath,
  payment,
  prevout,
  proof,
  psig,
  pubkey,
  record,
  regex,
  script,
  signature,
  str,
  tags,
  stamp,
  value
}
