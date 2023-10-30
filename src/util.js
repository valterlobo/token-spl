const { clusterApiUrl, Connection } = require('@solana/web3.js')

function getConnection() {

    const connection = new Connection(
        clusterApiUrl('devnet'),
        'confirmed'
    )
    return connection
}

export { getConnection }