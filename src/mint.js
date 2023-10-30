const web3 = require('@solana/web3.js')
const bs58 = require("bs58")
const dotenv = require("dotenv")
const token = require("@solana/spl-token")
dotenv.config()

const main = async () => {

    console.log("MINT START")

    var secretKey1 = bs58.decode(process.env.PRIVATE_KEY_1)
    const key = web3.Keypair.fromSecretKey(secretKey1)
    console.log("KEY", key.publicKey.toBase58())

    const connection = new web3.Connection(
        web3.clusterApiUrl('devnet'),
        'confirmed'
    )
    const vl = await connection.getBalance(key.publicKey)
    console.log("Balance", vl)

    const user = key
    const to = key.publicKey

    let tokenAddr = '9RE5hEQV5SLRwr7PANryxYMZsootEkY5txxJyRNU4FYR'
    const tokenAccount = new web3.PublicKey(tokenAddr)

    const mintInfo = await token.getMint(
        connection,
        tokenAccount
    )

    const tokenMint = await token.getOrCreateAssociatedTokenAccount(
        connection,
        user,
        mintInfo.address,
        key.publicKey
    )

    const mintAuthority = user

    //let keyTmp = web3.Keypair.generate()
    //const mintAuthority = keyTmp

    await token.mintTo(
        connection,
        user,
        mintInfo.address,
        tokenMint.address,
        mintAuthority,
        100000000000 // because decimals for the mint are set to 9 
    )

    console.log("Token account     ", tokenAccount.toBase58())
    console.log("Token account mint", tokenMint.address.toBase58())
    console.log("SUPPLY            ", mintInfo.supply)
    console.log("MINT FINISH")
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