import { EscrowClient } from "@/index.js";
import { Buff } from "@cmdcode/buff";

const client = new EscrowClient({
  network  : 'mutiny',
  hostname : 'https://bitescrow-mutiny.vercel.app',
  oracle   : 'https://mutinynet.com'
})

const est = await client.oracle.fee_estimates()

console.log(est)