import { stringify } from '@/lib/util.js'

export function merge (
  data   : Record<string, any>,
  commit : Record<string, any>
) {
  // If commit is undefined:
  if (commit === undefined) {
    // return data value.
    return data
  // if commit is null:
  } else if (commit === null) {
    // Return a null value.
    return null
  } else {
    // Copy data to a return object.
    const output = new Map(Object.entries(data))
    // If both items are objects:
    if (is_object(data) && is_object(commit)) {
      // For each key in the commit:
      Object.keys(commit).forEach((key) => {
        // If the commit value is null:
        if (commit[key] === null) {
          // Delete the key in data.
          output.delete(key)
        // Else, if commit value is an object:
        } else if (is_object(commit[key])) {
          // If the key does not exist in data:
          if (!(key in data)) {
            // Set the key in the data object.
            output.set(key, commit[key])
          // Else:
          } else {
            // Evaluate both objects recursively.
            const val = merge(data[key], commit[key])
            // If the return value is null:
            if (val === null) {
              // Then delete the key from the data.
              output.delete(key)
            } else {
              // Else, set the new value in the data.
              output.set(key, val)
            }
          }
        // Else, if the commit value is an array:
        } else if (Array.isArray(commit[key])) {
          // Define the commit value array.
          const arr = commit[key]
          // Define an array of serialized items.
          const dat = (data[key] ?? [])
            .map((e : any) => stringify(e))
          // Convert the filtered array into a set.
          const set = new Set(dat)
          // Use the set to filter an array of appendable items.
          const add = arr.filter((e : any) => {
            return e !== null && !set.has(stringify(e))
          })
          // Filter out any null positions set in the 
          // commit array, then concat appendable items.
          const val = (data[key] || [])
            .filter((_ : any, idx : number) => arr[idx] !== null)
            .concat(add)
          // Set the data value to the new array.
          output.set(key, val)
        // Else if the commit value is not an object.
        } else {
          // Set the data value to the commit value.
          output.set(key, commit[key])
        }
      })
    }
    // Return the output object.
    return Object.fromEntries(output)
  }
}

function is_object (
  item : any
) : item is Record<string, any> {
  return (
    item !== null            && 
    typeof item === 'object' && 
    !Array.isArray(item)
  )
}
