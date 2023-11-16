import { Buff, Bytes } from '@cmdcode/buff'

export function exception (
  error : string,
  throws = false
) : false {
  if (!throws) return false
  throw new Error(error)
}

export function exists <T> (
  value ?: T | null
) : value is NonNullable<T> {
  if (typeof value === 'undefined' || value === null) {
    return false
  }
  return true
}

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

export function is_hex (
  value : unknown
) : value is string {
  if (
    typeof value === 'string'            &&
    value.match(/[^a-fA-f0-9]/) === null &&
    value.length % 2 === 0
  ) { 
    return true
  }
  return false
}

export function is_hash (
  value : unknown
) : value is string {
  if (is_hex(value) && value.length === 64) {
    return true
  }
  return false
}

export function now () {
  return Math.floor(Date.now() / 1000)
}

export function delay (ms ?: number) {
  return new Promise(res => setTimeout(res, ms ?? 1000))
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
    .reduce((sorted, key) => {
      sorted[key] = obj[key]
      return sorted
    }, {} as Record<string, any>) as T
}

export function stringify (content : any) : string {
  switch (typeof content) {
    case 'object':
      return (content ==! null)
        ? JSON.stringify(content)
        : 'null'
    case 'string':
      return content
    case 'bigint':
      return content.toString()
    case 'number':
      return content.toString()
    case 'boolean':
      return String(content)
    case 'undefined':
      return 'undefined'
    default:
      throw new TypeError('Content type not supported: ' + typeof content)
  }
}
