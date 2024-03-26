import * as SignProgram from './endorse.js'

import { MethodManifest } from '../types.js'

const MANIFEST : MethodManifest = {
  endorse : {
    exec   : SignProgram.exec,
    verify : SignProgram.verify
  }
}

export {
  MANIFEST,
  SignProgram
}
