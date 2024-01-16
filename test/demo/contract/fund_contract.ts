import { client, members } from "../proposal/configure_clients.js"

// Define the contract and deposit we will be using.
const cid  = 'b312db089587b1b077d8fd82ca07f2668847de5412b8faeb62cb937dca9bfa45'
const dpid = '84c16f87642b67175519c6847001fcdb26cc6065e46e4d6472da94468c60a3e6'

// Unpack a member for testing.
const [ a_mbr ] = members

const ct_res = await client.contract.read(cid)

if (!ct_res.ok) throw new Error(ct_res.error)

const { contract } = ct_res.data

console.log('contract:', contract)

const dp_res = await client.deposit.read(dpid)

if (!dp_res.ok) throw new Error(dp_res.error)

const { deposit } = dp_res.data

console.log('deposit:', deposit)

// Request the member to sign
const covenant = await a_mbr.deposit.create_covenant(contract, deposit)

// Register the covenant with the API.
const cov_res = await client.deposit.commit(dpid, covenant)

// Check the response is valid.
if (!cov_res.ok) throw new Error(cov_res.error)

const { contract : new_ct, deposit : new_dp } = cov_res.data

console.log('new contract:', new_ct)

console.log('new deposit:', new_dp)
