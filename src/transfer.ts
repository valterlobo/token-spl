

import * as token from '@solana/spl-token'
import * as web3 from "@solana/web3.js"
import * as bs58 from "bs58"
import dotenv from "dotenv"
import { FindNftByMintInput, Metaplex, bundlrStorage, keypairIdentity } from '@metaplex-foundation/js'
dotenv.config()

const main = async () => {

    console.log("TRANSFER START")

    //Connection
    const solConnection = new web3.Connection(
        web3.clusterApiUrl('devnet'),
        'confirmed'
    )

    //FROM 
    let secretKey1 = bs58.decode(process.env.PRIVATE_KEY_1 as string)
    let from = web3.Keypair.fromSecretKey(secretKey1)

    //TO 
    let to = 'FaqZx3W3cTQ3stKuPbxXhDgWrKRSkW24zbQcWsU8DyYe'
    const toPublicKey = new web3.PublicKey(to)

    //TOKEN 
    const mint = new web3.PublicKey('9RE5hEQV5SLRwr7PANryxYMZsootEkY5txxJyRNU4FYR')
    const mintInfo = await token.getMint(
        solConnection,
        mint
    )

    //metadata 
    const metaplex = Metaplex.make(solConnection)
        .use(keypairIdentity(from))
        .use(bundlrStorage({
            address: 'https://devnet.bundlr.network',
            providerUrl: web3.clusterApiUrl('devnet'),
            timeout: 60000,
        }))


    let metaAsset = {
        mintAddress: mintInfo.address,
        loadJsonMetadata: true
    } as FindNftByMintInput

    let metaInfo = await metaplex.nfts().findByMint(metaAsset)
    console.log(metaInfo.name)


    //AMOUNT
    let amount = 50 * 10 ** mintInfo.decimals


    //From token account 
    const fromTokenAccount = await token.getOrCreateAssociatedTokenAccount(
        solConnection,
        from,
        mint,
        from.publicKey
    )

    //To token account 
    const toTokenAccount = await token.getOrCreateAssociatedTokenAccount(
        solConnection,
        from,
        mint,
        toPublicKey)

    const mintAccount = await token.getOrCreateAssociatedTokenAccount(
        solConnection,
        from,
        mint,
        from.publicKey
    )

    //TRANSFER

    // Transfer the token to the "toTokenAccount" 
    let signature = await token.transfer(
        solConnection,
        from,
        fromTokenAccount.address,
        toTokenAccount.address,
        from.publicKey,
        amount
    )

    console.log(`Transaction ID: `, signature)
    console.log(`Transfer: ${metaInfo.name} from  ${from.publicKey.toBase58()} to ${to} amount: ${amount}`)
    console.log("TRANSFER FINISH")


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