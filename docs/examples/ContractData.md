# ContractData

```ts
{
  agent_pk: '33f9d5a021afdffb864153eefa5d353d53e2d22053dadf8577c0e2b524bac794',
  cid: '08c039fe284f77e4dda7c3fac79dc6dff580c8c1a9b91831804a9c11696cbafa',
  created_at: 1716232786,
  created_sig: '8a069db24490e18af1323cd4524c28f44842e990da3383aef4f025d5d775bf1723c6767e14ee8c8a27778bac4ee3dd7bd682ce023f61cfae7e122cfff1e054ac42ec3c99dc55625ae87dd31924cd0e8069e80b6fe9f495be83274f4cc6057823',
  deadline_at: 1716239986,
  endorsements: [
    '6dd326ab4c6cecd85165f82a8e622dd030b233fdc7751ac2c9e9b1073ab66e3f7d63cb2844fa6158bcc8e8cfb0ab3f434b48037c2f4657274ebfbc79d3569aec52a40506464d269ba9fdd1f50588fd08abf4f850987c5fd33808aeb78d6b844c',
    '6431a11f5ab8e0151b3fa2987dde50d90a439a9fd39e327aafbed15b1e2d7f3485da358eca7bde03ff0071729e79946ff8d905ced37bb9ae7a849617c1d1c36673461b9d341a4eced59d10198674e68bcc9880ac79b7b4fc31241f2686a440cb',
    'bddc6ba6819d108bb4079e66d937368f00b73816e6ee63e1703686742d8d9cf279fa1f1c0efe3021f0ff45248915d13191476c30934d933bdbec6a68f06cbf930a6100eb18e4ea9f5bd71ad877a11abb4541d897892c294a0b6c76183ef58146'
  ],
  feerate: 1,
  fees: [],
  funds_pend: 0,
  funds_conf: 10100,
  outputs: [
    [
      'payout',
      '02000000000110270000000000001600143e46c2dff24517e7e923bd146cb3f61944f3cfbd00000000'
    ],
    [
      'refund',
      '0200000000011027000000000000160014b626de292ae5c58081042ccab66de7263cc4bccd00000000'
    ]
  ],
  moderator: 'bddc6ba6819d108bb4079e66d937368f00b73816e6ee63e1703686742d8d9cf2',
  prop_id: 'b89420fd4d369f0a59a733dddc33ff8a7c56b803d876031b6c87387027a847e9',
  status: 'spent',
  subtotal: 10000,
  terms: {
    created_at: 1716232784,
    deadline: 7200,
    duration: 14400,
    engine: 'cvm',
    feerate: 1,
    moderator: 'bddc6ba6819d108bb4079e66d937368f00b73816e6ee63e1703686742d8d9cf2',
    network: 'regtest',
    paths: [
      [
        'refund',
        10000,
        'bcrt1qkcndu2f2uhzcpqgy9n9tvm08yc7vf0xdgwqm9y'
      ],
      [
        'payout',
        10000,
        'bcrt1q8erv9hljg5t706frh52xevlkr9z08naadzztgw'
      ]
    ],
    payments: [],
    programs: [
      [
        'endorse',
        'close|resolve',
        '*',
        2,
        '6dd326ab4c6cecd85165f82a8e622dd030b233fdc7751ac2c9e9b1073ab66e3f',
        '6431a11f5ab8e0151b3fa2987dde50d90a439a9fd39e327aafbed15b1e2d7f34'
      ],
      [
        'endorse',
        'dispute',
        'payout',
        1,
        '6dd326ab4c6cecd85165f82a8e622dd030b233fdc7751ac2c9e9b1073ab66e3f'
      ],
      [
        'endorse',
        'dispute',
        'refund',
        1,
        '6431a11f5ab8e0151b3fa2987dde50d90a439a9fd39e327aafbed15b1e2d7f34'
      ],
      [
        'endorse',
        'resolve',
        '*',
        1,
        'bddc6ba6819d108bb4079e66d937368f00b73816e6ee63e1703686742d8d9cf2'
      ]
    ],
    schedule: [ [ 7200, 'close|resolve', 'payout|refund' ] ],
    title: 'Basic two-party contract with third-party arbitration.',
    txtimeout: 7200,
    value: 10000,
    version: 1
  },
  tx_bsize: 41,
  tx_fees: 100,
  tx_total: 10100,
  tx_vsize: 100,
  updated_at: 1716232801,
  vin_count: 1,
  vin_txfee: 59,
  canceled: false,
  canceled_at: null,
  canceled_sig: null,
  secured: true,
  secured_sig: '01469d04297f138e061a3eb507da83a8c0df86439c550649265aeb4629a3879752f60140f87f8d2fe72bbcf003e0196176ac5a2756b19f50682d151f8b3e43adf58b535a07260406f004317138188c6e077fb36e3106a5de1286e1067197759b',
  effective_at: 1716232800,
  activated: true,
  active_at: 1716232800,
  active_sig: '27c88d1075d0575f393ce62cec6dfb9faca6db97416d1324f737fcdb0abf08c77e7d8cd697daa4b0fb8d919602d699d8a1f649c58b436a88cf923741e1c95345b30e921f1f6095fbc2543b4af0539225bfb51d684317ba2666b2ae6bf41e69e6',
  machine_head: '13318f6d2c822ad10a8e78608745ae596e2c0cb4dea3cbe0d21710e0e5a54ef0',
  machine_vmid: '3c9fe23c9cd7ea03c4b007439872d0ca6a8bcf503a23b0394b67d11b4a53ce9e',
  expires_at: 1716247200,
  closed: true,
  closed_at: 1716232800,
  closed_sig: '11bfe70ba7115d857017cd2e16b86b2b10710add8a1877d4fb34d3e6095e77f232a33349c308914544fece777713c9b1e1e39cc62026e6321e70dad869a04270b2edcf199afc14cf4b5062b3171c95b971b784be43f2863372fe9809a682d150',
  machine_vout: 'payout',
  spent: true,
  spent_at: 1716232801,
  spent_sig: '2e7f57a0f56b39efe07934e90f9d9476d2cf0742a9657047d80539a8edc959deb018b0674661c13c676b2f122bb7b712152f9fd0fa14e0ee221c28c7a590e45b001cd9c88e1baebcc640dafa2a7f72140e1261c499de57f789e4d20e820106b3',
  spent_txhex: '020000000001015915561637a71555ef8c5def20996e66ee96ede7582c9ae520110840a0f5922e0000000000fdffffff0110270000000000001600143e46c2dff24517e7e923bd146cb3f61944f3cfbd0141d5ef1261f85f3dfe8e35a24d55599d37a6e231621cdb69fb2287a5204ef7808b859c733ec3832148c42e51b61d666a4eae0f8f92d7ef6376339595b7d23a76498100000000',
  spent_txid: '86a1c6aeec26bf619d98f25e01725895d20ea9343421b27c9cf9f49f1d1e37f3',
  settled: false,
  settled_at: null,
  settled_sig: null
}
```
