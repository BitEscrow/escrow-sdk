import { exec as sign_exec } from './sign/index.js'

import { MethodManifest } from '@/types/index.js'

import * as sign from './sign/index.js'

const MANIFEST : MethodManifest = {
  oracle : () => { throw new Error('not implemented') },
  reveal : () => { throw new Error('not implemented') },
  sign   : sign_exec,
}

export { MANIFEST, sign }
