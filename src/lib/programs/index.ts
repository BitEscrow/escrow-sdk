import * as SignProgram from './endorse.js'

import { MethodManifest } from '@/types/index.js'

const MANIFEST : MethodManifest = {
  'oracle'  : () => { throw new Error('not implemented') },
  'hlock'   : () => { throw new Error('not implemented') },
  'endorse' : SignProgram.exec,
}

export {
  MANIFEST,
  SignProgram
}
