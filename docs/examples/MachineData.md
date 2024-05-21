# Contract VM

```ts
{
  active_at: 1716232800,
  commit_at: 1716232800,
  engine: 'cvm',
  error: null,
  expires_at: 1716247200,
  head: '13318f6d2c822ad10a8e78608745ae596e2c0cb4dea3cbe0d21710e0e5a54ef0',
  output: 'payout',
  pathnames: [ 'payout', 'refund' ],
  programs: [
    {
      prog_id: 'd25041a81106f0a287c7537d9c84dd2e64c3f8fe7d7e145535f3e6dd331efbd5',
      method: 'endorse',
      actions: 'close|resolve',
      params: [
        2,
        '6dd326ab4c6cecd85165f82a8e622dd030b233fdc7751ac2c9e9b1073ab66e3f',
        '6431a11f5ab8e0151b3fa2987dde50d90a439a9fd39e327aafbed15b1e2d7f34'
      ],
      paths: '*'
    },
    {
      prog_id: '2ab8c8874ff189ad16cd23e72b2d0f98fc8cdd5bfcb0e70212c98bdac38fb944',
      method: 'endorse',
      actions: 'dispute',
      params: [
        1,
        '6dd326ab4c6cecd85165f82a8e622dd030b233fdc7751ac2c9e9b1073ab66e3f'
      ],
      paths: 'payout'
    },
    {
      prog_id: '9a197e6723e47c4333505dee073a36d288a4adfa1138864bfe6eb817674290a4',
      method: 'endorse',
      actions: 'dispute',
      params: [
        1,
        '6431a11f5ab8e0151b3fa2987dde50d90a439a9fd39e327aafbed15b1e2d7f34'
      ],
      paths: 'refund'
    },
    {
      prog_id: '28964dd01da8b00c1504c31dba34a7288aee7e8a1473d5696a82841ad838c8f4',
      method: 'endorse',
      actions: 'resolve',
      params: [
        1,
        'bddc6ba6819d108bb4079e66d937368f00b73816e6ee63e1703686742d8d9cf2'
      ],
      paths: '*'
    }
  ],
  state: '{"paths":[["payout",3],["refund",0]],"store":[["d25041a81106f0a287c7537d9c84dd2e64c3f8fe7d7e145535f3e6dd331efbd5","[[\\"payout/close\\",[\\"6dd326ab4c6cecd85165f82a8e622dd030b233fdc7751ac2c9e9b1073ab66e3f\\",\\"6431a11f5ab8e0151b3fa2987dde50d90a439a9fd39e327aafbed15b1e2d7f34\\"]]]"],["2ab8c8874ff189ad16cd23e72b2d0f98fc8cdd5bfcb0e70212c98bdac38fb944","[]"],["9a197e6723e47c4333505dee073a36d288a4adfa1138864bfe6eb817674290a4","[]"],["28964dd01da8b00c1504c31dba34a7288aee7e8a1473d5696a82841ad838c8f4","[]"]],"status":"closed"}',
  step: 1,
  tasks: [ [ 7200, 'close|resolve', 'payout|refund' ] ],
  updated_at: 1716232800,
  vmid: '3c9fe23c9cd7ea03c4b007439872d0ca6a8bcf503a23b0394b67d11b4a53ce9e',
  closed: true,
  closed_at: 1716232800
}
```