import { decode_tx, encode_tx, parse_txsize } from "@scrow/tapscript/tx";

const txhex  = '0200000000010110b9db869dd8b5056bc970901166f0aa2c40a1b344c3d758738bc59a01bf2fd90000000000fdffffff0310270000000000001600141ff391cd432d776557c0ba4908fe2a420691c9dee803000000000000225120d37a317fdd86a398d990b382c8672c190e9e0b70ce00571794962adbec08a19688130000000000001600145d3cbd81501cd9023b76917c4fd120435f9236800141343ac70515a27b648e0808b955a35022fdecab9405125027ae2674116c88af3fda756bf8ade73cb1b1a9fe71a9ffb442193f93d0d95243ab3bce06b8571157e28100000000'
const txdata = decode_tx(txhex, true)
const tx2    = encode_tx(txdata, false)
const tx3    = encode_tx(txdata, true)

const tx3d = decode_tx(tx3)

tx3d.vin = []

const size1 = parse_txsize(tx2)
const size2 = parse_txsize(tx3d)

console.log(decode_tx(tx2))
console.log(tx3d)

console.log(size1)
console.log(size2)