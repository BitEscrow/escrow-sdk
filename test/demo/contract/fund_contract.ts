import { client, members } from "../proposal/configure_clients.js"

// Define the contract and deposit we will be using.
const cid  = '289a63cd3afdde7d145f39ff5b3ea7caa7ece361a92c422fd8b4c8b07653b278'
const dpid = 'ca2419d6c033223b58313368accec2266779b52da6a7404e8cdb0a7afbbc7ab8'

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
const covenant = await a_mbr.deposit.commit_deposit(contract, deposit)

// Register the covenant with the API.
const cov_res = await client.deposit.commit(dpid, covenant)

// Check the response is valid.
if (!cov_res.ok) throw new Error(cov_res.error)

const { contract : new_ct, deposit : new_dp } = cov_res.data

console.log('new contract:', new_ct)

console.log('new deposit:', new_dp)
