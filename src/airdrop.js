const { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js')
const bs58 = require("bs58")
const dotenv = require("dotenv")
dotenv.config()

const main = async () => {

    console.log("AIRDROP START")

    var secretKey1 = bs58.decode(process.env.PRIVATE_KEY_1)
    const key = Keypair.fromSecretKey(secretKey1)

    console.log("KEY", key.publicKey.toBase58())

    const connection = new Connection(
        clusterApiUrl('devnet'),
        'confirmed'
    )


    const airdropSignature = await connection.requestAirdrop(
        key.publicKey,
        LAMPORTS_PER_SOL,
    )

    const latestBlockHash = await prog.provider.connection.getLatestBlockhash()

    await prog.provider.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
    })
    console.log("AIRDROP FINISH")
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