const { clusterApiUrl, Connection, Keypair, createMint } = require('@solana/web3.js')
const bs58 = require("bs58")
const dotenv = require("dotenv")
const token = require("@solana/spl-token")
dotenv.config()

const main = async () => {

    console.log("CREATE START")

    var secretKey1 = bs58.decode(process.env.PRIVATE_KEY_1)
    const key = Keypair.fromSecretKey(secretKey1)

    console.log("KEY", key.publicKey.toBase58())

    const connection = new Connection(
        clusterApiUrl('devnet'),
        'confirmed'
    )

    const vl = await connection.getBalance(key.publicKey)
    console.log("Balance", vl)

    const payer = key
    const mintAuthority = key
    const freezeAuthority = key

    const mintToken = await token.createMint(
        connection,
        payer,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        9 // We are using 9 to match the CLI decimal default exactly
    )

    console.log("TOKEN:", mintToken.toBase58())
    console.log("SUPPLY:", mintToken.supply)
    console.log("CREATE FINISH")
}

main()
    .then(() => {
        console.log("****************Finished********************")
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })