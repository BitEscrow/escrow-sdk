import { CoreSchema } from "@/index.js"

const data = {
  account_hash: '5e948b597a4d78cd3cf289bfde7bf8a7e51a36746e0d81c7dbd4267a4edd82c2',
  agent_pk: 'aef7130f73086fd86b1f14e87315c58b50f09c772566ed436142fe693f5908c1',
  agent_tkn: '664e68b7d68340b6cd0632fe1c158bebf73768e7d58cd92b3dfc576ac708ee187500b26c6e8b58f30e0b144e7b924523c9cd35c18369b365f690cc85d79d615dd0367cbb942f0d76b080cd7e00525321cc091fd86680218ec1b074c07cb721c38484f6308a2cd2119bf1a1cdb81154b62e8edffd315838e60e33d978e75ecb8e8fce8523',
  closed: false,
  closed_at: null,
  closed_sig: null,
  conf_block: '6b09346ec91820b6123c29f4fe0ca81e6a4ed68147ebc1d89646c69edbfc23f1',
  conf_height: 1467,
  confirmed: true,
  confirmed_at: 1716414647,
  covenant: null,
  created_at: 1716414647,
  created_sig: '0f802db86167198063e7efdf67263300433d9c30f3c7a2b04b7e4bf08f7c1094dea48e1323ff88325a246f53e2d7fd9dd5220febba32cb72b6d30c053302977375377f57c0e1cff86cb6601ea3d833e1ba87b3b438bed84574c6ded8836a379d',
  deposit_addr: 'bcrt1pxktxsk7evx86ajuf8vczacujkf4qrt9s474e95n7vk4pg3nt4s4s6slu9v',
  deposit_pk: '9997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be',
  dpid: 'ee35d0bd0003bea982ed69cc7c0833ff1cec40f0ab12a91ca4a2aeab3f384f7d',
  expires_at: 1716587447,
  locked: false,
  locked_at: null,
  locked_sig: null,
  locktime: 172800,
  network: 'regtest',
  return_addr: 'bcrt1pnxt6f97evn7p5c5gtvz62ytx5edfphcqfykg6l8kr44vea2gqwlqsghvex',
  return_psig: 'fcb082a7b7bd7929b93b0b734870bf12bd3eb91bddf334faba6e23e2e64733f06e5e14c190d62ae634f397a577b49fb6c6ad57f3e8c9174987ea895d4c3e99368e372888ece28b477f6e264bfac6c9810e35d605111394a2dcdadc1fcaa16fe19997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be266c66943049e15aad11baa5a902d12928b2b8eed03a186df6f827b50d6e19e2f780ac10d25d630666d4472c1413d48ec67b4054911e8fceeab67d6f75c1ee72',
  return_rate: 2,
  return_txhex: null,
  return_txid: null,
  satpoint: '78cd56075af0c10f5c0d80c2df079f8f67f35a8a3340cb83e0bec255b8cbbd4c:0',
  settled: false,
  settled_at: null,
  settled_sig: null,
  spent: true,
  spent_at: 1716414648,
  spent_block: null,
  spent_height: null,
  spent_sig: 'fe0d8393be343180defa74bf2d3017ab97165b9eac94ae7e7d2ba0cd3ccf7e2a050999cdb47601f54830907042be64e2c426345df3d8eac7cbe46c52bc2793df8bedbfca1221b7f7d64761c8318195cd22715ec38c346f0725eb091c7411dba4',
  spent_txhex: '020000000001014cbdcbb855c2bee083cb40338a5af3678f9f07dfc2800d5c0fc1f05a0756cd780000000000fdffffff01c0850100000000002251209997a497d964fc1a62885b05a51166a65a90df00492c8d7cf61d6accf54803be0141de9cdacd520b805901ac0b85ec83a31533ee0d55d9becbc6236b36812ffbf0667b4c2b2c57b3eac668bf57d35bff2e4f639b6dd9f12063b5f5c2ced0744acf928100000000',
  spent_txid: '826a2f7b4f2e8379ba724edb45a978e53dd49f6789368df4eab357823b351ddf',
  status: 'spent',
  updated_at: 1716414648,
  utxo: {
    txid: '78cd56075af0c10f5c0d80c2df079f8f67f35a8a3340cb83e0bec255b8cbbd4c',
    vout: 0,
    value: 100000,
    scriptkey: '51203596685bd9618faecb893b302ee392b26a01acb0afab92d27e65aa14466bac2b'
  }
}

const parsed = CoreSchema.deposit.fund.parse(data)

console.log(JSON.stringify([ parsed ], null, 2))
