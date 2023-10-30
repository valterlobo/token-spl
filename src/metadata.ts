
import { UploadMetadataInput, Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile } from '@metaplex-foundation/js'
import { DataV2, createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata'
import { getMint } from '@solana/spl-token'
import * as web3 from "@solana/web3.js"
import * as bs58 from "bs58"
import dotenv from "dotenv"
import * as fs from "fs"

dotenv.config()


export const main = async () => {

  console.log("METADATA START")


  var secretKey = bs58.decode(process.env.PRIVATE_KEY_1 as string)
  const user = web3.Keypair.fromSecretKey(secretKey)

  console.log("KEY", user.publicKey.toBase58())


  const MY_TOKEN_METADATA: UploadMetadataInput = {
    name: "Happy",
    symbol: "•‿•",
    description: "Happy -distribute happiness",
    image: "TO_UPDATE_LATER" //add public URL to image you'd like to use
  }

  const ON_CHAIN_METADATA = {
    name: MY_TOKEN_METADATA.name,
    symbol: MY_TOKEN_METADATA.symbol,
    uri: 'TO_UPDATE_LATER',
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null
  } as DataV2

  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed')

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(bundlrStorage({
      address: 'https://devnet.bundlr.network',
      providerUrl: web3.clusterApiUrl('devnet'),
      timeout: 60000,
    }))


  //upload image 
  console.log("upload image")
  // file to buffer
  const imageFile = "happy.png"
  const buffer = fs.readFileSync("img/" + imageFile)

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, imageFile)

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file)
  console.log("image uri:", imageUri)

  //upload metadata 
  console.log("upload metadata")
  MY_TOKEN_METADATA.image = imageUri
  const metaURI = await metaplex.nfts().uploadMetadata(MY_TOKEN_METADATA);
  console.log(`Arweave URL: `, metaURI)
  ON_CHAIN_METADATA.uri = metaURI.uri;


  let mitTokenAddr = '9RE5hEQV5SLRwr7PANryxYMZsootEkY5txxJyRNU4FYR'
  const mintAccount = new web3.PublicKey(mitTokenAddr)
  const mintKeypair = await getMint(
    connection,
    mintAccount
  )
  console.log(mintKeypair.address)
  const metadataPDA = await metaplex.nfts().pdas().metadata({ mint: mintKeypair.address })

  console.log(`---Executing Metadata Transaction---`)
  const createNewMetadataTransaction = new web3.Transaction().add(
    createCreateMetadataAccountV3Instruction({
      metadata: metadataPDA,
      mint: mintKeypair.address,
      mintAuthority: user.publicKey,
      payer: user.publicKey,
      updateAuthority: user.publicKey,
    }, {
      createMetadataAccountArgsV3: {
        data: ON_CHAIN_METADATA,
        isMutable: true,
        collectionDetails: null
      }
    })
  )

  let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
  createNewMetadataTransaction.recentBlockhash = blockhash;
  createNewMetadataTransaction.lastValidBlockHeight = lastValidBlockHeight;
  createNewMetadataTransaction.feePayer = user.publicKey;


  const transactionId = await web3.sendAndConfirmTransaction(connection, createNewMetadataTransaction, [user]);
  console.log(`Transaction ID: `, transactionId);
  console.log(`Succesfully metada ${ON_CHAIN_METADATA.symbol} to ${user.publicKey.toString()}.`);
  console.log(`View Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
  console.log(`View Token Mint: https://explorer.solana.com/address/${mintKeypair.address.toString()}?cluster=devnet`)

  console.log("METADATA FINISH")
}

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })