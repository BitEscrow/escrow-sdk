import { Buff, Bytes } from '@cmdcode/buff'
import { sha256 }      from '@cmdcode/crypto-tools/hash'

export function get_entry <T = string[]> (
  label   : string,
  entries : [ string, T ][]
) : T {
  const ent = entries.find(e => e[0] === label)
  if (ent === undefined) {
    throw new Error('Entry not found for label: ' + label)
  }
  return ent[1]
}

export function now () {
  return Math.floor(Date.now() / 1000)
}

export async function sleep (ms ?: number) {
  return new Promise(res => setTimeout(res, ms ?? 1000))
}

export function parse_err (err : unknown) : string {
  if (err instanceof Error)    return err.message
  if (typeof err === 'string') return err
  return 'unknown error occured'
}

export function regex (
  input   : string,
  pattern : string
) {
  if (pattern === '*') {
    return true
  } else {
    return new RegExp(pattern).test(input)
  }
}

export function get_access_list (
  expr   : string,
  labels : string[]
) {
  let blist : string[], wlist : string[]
  if (expr === '*') {
    wlist = labels
    blist = []
  } else if (expr.includes('|')) {
    wlist = expr.split('|')
    blist = labels.filter(e => !wlist.includes(e))
  } else {
    wlist = [ expr ]
    blist = labels.filter(e => e !== expr)
  }
  return { wlist, blist }
}

export function sort_bytes (
  bytes : Bytes[]
) : string[] {
  return bytes.map(e => Buff.bytes(e).hex).sort()
}

export function sort_record <T extends Record<string, any>> (
  obj : T
) : T {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, any>>((sorted, key) => {
      sorted[key] = obj[key]
      return sorted
    }, {}) as T
}

export function stringify (content : any) : string {
  switch (typeof content) {
    case 'object':
      return (content !== null)
        ? JSON.stringify(content)
        : 'null'
    case 'string':
      return content
    case 'bigint':
      return String(content)
    case 'number':
      return String(content)
    case 'boolean':
      return String(content)
    case 'undefined':
      return 'undefined'
    default:
      throw new TypeError('Content type not supported: ' + typeof content)
  }
}

export function get_object_id <T extends object> (
  obj : T) : Buff {
  if (Array.isArray(obj) || typeof obj !== 'object') {
    throw new Error('not an object')
  }

  const ent = Object
    .entries(obj)
    .filter(([ _, val ]) => val !== undefined)
    .sort()

  return sha256(Buff.json(ent))
}

export function compare (a : unknown, b : unknown) {
  const a_str = stringify(a)
  const b_str = stringify(b)
  return a_str === b_str
}

export function compare_arr (
  arr1 : unknown[][],
  arr2 : unknown[][]
) {
  const a1 = arr1.map(e => JSON.stringify(e)).sort()
  const a2 = arr2.map(e => JSON.stringify(e)).sort()
  return JSON.stringify(a1) === JSON.stringify(a2)
}

export function get_diff_arr <T> (prev : T, curr : T) {
  if (!Array.isArray(prev) || !Array.isArray(curr)) {
    throw new Error('both values must be an array')
  }
  const a1 = prev.map(e => stringify(e))
  const a2 = curr.map(e => stringify(e))
  return prev.filter((_e, idx) => a1[idx] !== a2[idx]) as T
}
