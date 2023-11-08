const prop = {
  title     : 'Basic two-party contract with third-party dispute resolution.',
  expires   : 14400,
  details   : 'n/a',
  network   : 'regtest',
  moderator : '',
  paths: [
    [ 'heads', 10000, ''   ],
    [ 'tails', 10000, '' ]
  ],
  payments : [
    [ 5000,  '' ]
  ],
  programs : [
    [ 'close', 'heads', 'proof', 1, '' ],
    [ 'close', 'tails', 'proof', 1, '' ]
  ],
  schedule: [
    [ 7200, 'close', 'heads|tails' ]
  ],
  value   : 15000,
  version : 1
}

console.log(JSON.stringify(prop, null, 2))