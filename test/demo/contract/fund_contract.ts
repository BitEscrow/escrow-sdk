import { client, members } from "../proposal/configure_clients.js"

// Define the contract and deposit we will be using.
const cid  = 'e60f610a4c53cc854efe0da891fed4d7cc61261ffe37ec8275de129ba20613fc'
const dpid = '3e54082afe4971899f19f05621c14b50ea76b9fae7c79536b234a6485c2720c4'

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
