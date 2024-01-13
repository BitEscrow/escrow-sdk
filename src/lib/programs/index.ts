import * as SignProgram from './sign.js'

import { MethodManifest } from '@/types/index.js'

const MANIFEST : MethodManifest = {
  oracle : () => { throw new Error('not implemented') },
  hlock  : () => { throw new Error('not implemented') },
  sign   : SignProgram.exec,
}

export {
  MANIFEST,
  SignProgram
}
