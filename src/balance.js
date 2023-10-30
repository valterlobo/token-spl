const web3 = require('@solana/web3.js')
const bs58 = require("bs58")
const dotenv = require("dotenv")
const token = require("@solana/spl-token")
dotenv.config()

const main = async () => {

    console.log("BALANCE START")

    var secretKey1 = bs58.decode(process.env.PRIVATE_KEY_1)
    const key = web3.Keypair.fromSecretKey(secretKey1)
    console.log("KEY", key.publicKey.toBase58())

    const connection = new web3.Connection(
        web3.clusterApiUrl('devnet'),
        'confirmed'
    )

    //
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        key.publicKey,
        {
            programId: token.TOKEN_PROGRAM_ID,
        }
    )

    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach((tokenAccount) => {
        const accountData = token.AccountLayout.decode(tokenAccount.account.data);
        console.log(`${new web3.PublicKey(accountData.mint)}   ${accountData.amount}`);
    })
    //
    console.log("BALANCE FINISH")
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