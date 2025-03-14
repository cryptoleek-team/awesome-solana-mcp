import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { getTransactionHistory } from '../tools/transaction.js';

dotenv.config();

async function main() {
  try {
    // Validate environment variables
    if (!process.env.RPC_URL) {
      throw new Error('RPC_URL environment variable is required');
    }

    // Create a connection to the Solana cluster
    const connection = new Connection(process.env.RPC_URL);
    
    // Print connection info for debugging
    console.log(`Using RPC URL: ${process.env.RPC_URL.substring(0, 30)}...`);
    
    try {
      const version = await connection.getVersion();
      console.log(`Connected to Solana ${version["solana-core"]}`);
    } catch (err) {
      console.log(`Failed to get version: ${err}`);
    }
    
    // Test address - using the provided address
    const testAddress = new PublicKey('DWdBJfMzVXJCB3TMdFzxhTeap6pMQCajamApbqXHbkQ4');
    
    console.log(`Fetching transaction history for address: ${testAddress.toString()}`);
    
    // Test with default options
    console.log('\n--- Test 1: Retrieve all txns ---');
    const defaultResults = await getTransactionHistory(testAddress, connection);
    console.log(`Retrieved ${defaultResults.length} transactions`);
    // Test with options
    console.log('\n--- Test 2: Options (limit: 10, type: TRANSFER) ---');
    const options = {
      limit: 10,
      types: ['TRANSFER']
    };
    const optionResults = await getTransactionHistory(testAddress, connection, options);
    console.log(`Retrieved ${optionResults.length} transactions`);

    console.log('--- Printing the first 10 transactions ---');
    for (const txn of optionResults.slice(0, 10)) {
      console.log(txn);
    }
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

main();
