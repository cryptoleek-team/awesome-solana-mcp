#!/usr/bin/env node

/**
 * Simple test script to debug the priority fee estimation tool
 * Tests both account keys and transaction-based methods
 */

import { Connection } from '@solana/web3.js';
import { 
  estimatePriorityFee, 
  estimatePriorityFeeByAccountKeys, 
  estimatePriorityFeeByTransaction, 
  PriorityFeeEstimate
} from '../tools/priorityFee.js'; 

import * as dotenv from "dotenv";

dotenv.config();

// Set up Solana connection (using a public RPC endpoint)
// const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';
// For Helius API, you might want to use your own endpoint with API key
const RPC_ENDPOINT = process.env.RPC_URL;

async function testPriorityFeeEstimate() {
  try {
    console.log('=== Testing Priority Fee Estimation ===');
    console.log('Using RPC endpoint:', RPC_ENDPOINT);
    
    // Create Solana connection
    const connection = new Connection(RPC_ENDPOINT || "");
    
    // Test 1: Default method (account keys with default Jupiter account)
    console.log('\n--- Test 1: Default method ---');
    const defaultEstimate = await estimatePriorityFee(connection);
    printEstimate(defaultEstimate);
    
    // Test 2: Account keys method with custom accounts
    console.log('\n--- Test 2: Account keys method with custom accounts ---');
    const customAccountsEstimate = await estimatePriorityFeeByAccountKeys(
      connection,
      [
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token program
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'  // Associated token program
      ]
    );
    printEstimate(customAccountsEstimate);
    
    // Test 3: Transaction method
    console.log('\n--- Test 3: Transaction method ---');
    const transactionEstimate = await estimatePriorityFeeByTransaction(connection);
    printEstimate(transactionEstimate);
    
    console.log('\n=== All tests completed ===');
  } catch (error: any ) {
    console.error('Failed to run tests:', error);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
  }
}

/**
 * Helper function to print the fee estimate in a readable format
 */
function printEstimate(estimate: PriorityFeeEstimate) {
  console.log('Priority Fee Estimate:');
  console.log('- Low:', estimate.low, 'microLamports');
  console.log('- Medium:', estimate.medium, 'microLamports');
  console.log('- High:', estimate.high, 'microLamports');
  console.log('- Suggested:', estimate.suggested, 'microLamports');
  console.log('- Time Estimates:', estimate.timeEstimates);
  console.log('- High Load Behavior:', estimate.highLoadBehavior);
}

// Run the test
await testPriorityFeeEstimate()
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
