import { VALID_ACTIONS } from '@/config.js'

export function check_regex (
  labels : string[],
  regex  : string
) {
  if (regex === '*') return
  const arr = (regex.includes('|'))
    ? regex.split('|') 
    : [ regex ]
  arr.forEach(label => check_label_exists(label, labels))
}

export function check_label_exists (
  label  : string,
  labels : string[]
) {
  if (!labels.includes(label)) {
    throw new Error('label does not exist: ' + label)
  }
}

export function check_expires (
  timestamp : number,
  expires   : number
) {
  if (timestamp >= expires) {
    throw new Error(`time is expired:  ${String(timestamp)} >= ${expires}`)
  }
}

export function check_valid_action (
  action : string
) {
  if (!VALID_ACTIONS.includes(action)) {
    throw new Error('invalid action: ' + action)
  }
}
