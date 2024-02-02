import { CoreUtil } from '@scrow/test'

export const sleep = (ms : number) => new Promise(res => setTimeout(res, ms))

export async function fund_address (
  address : string,
  amount  : number  
)  {
  const daemon = CoreUtil.get_daemon({
    network : 'regtest',
    spawn   : false,
    verbose : false
  })
  return daemon.run(async client => {
    console.log('funding address :', address)
    console.log('sending amount  :', amount)
    await CoreUtil.fund_address(client, 'faucet', address, amount, true)
    await daemon.shutdown()
  })
}
