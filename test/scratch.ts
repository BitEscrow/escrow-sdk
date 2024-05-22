import { ChainOracle } from "@/index.js";

const oracle = new ChainOracle('http://localhost:3002')

const txid = 'ac16f65c1ef3a478db861c50134d6ad0f0f19487c1fff4f2652b0e26ea4e0610'

const res = await oracle.get_tx_status(txid)

console.log('res:', res)