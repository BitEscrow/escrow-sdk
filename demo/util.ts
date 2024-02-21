import { CoreUtil } from '@scrow/test'

export const sleep = (ms : number) => new Promise(res => setTimeout(res, ms))

export async function fund_regtest_address (
  address : string,
  amount  : number  
)  {
  const daemon = CoreUtil.get_daemon({
    network : 'regtest',
    spawn   : false,
    verbose : false
  })
  console.log('funding address :', address)
  console.log('sending amount  :', amount)
  return daemon.run(async client => {
    await CoreUtil.fund_address(client, 'faucet', address, amount, true)
    await daemon.shutdown()
  })
}

export async function fund_mutiny_address (
  address : string,
  amount  : number
) {
  console.log('funding address :', address)
  console.log('sending amount  :', amount)
  const url = 'https://faucet.mutinynet.com/api/onchain'
  const opt = {
    body    : JSON.stringify({ address,  sats : amount }),
    headers : { 'content-type' : 'application/json' },
    method  : 'POST'
  }
  const res = await fetch(url, opt)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const { txid } = await res.json()
  return txid
}