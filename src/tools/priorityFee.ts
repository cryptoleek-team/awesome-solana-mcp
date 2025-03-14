import { Connection, ComputeBudgetProgram, Transaction, PublicKey, Keypair } from "@solana/web3.js";

export interface PriorityFeeEstimate {
  low: number;
  medium: number;
  high: number;
  veryHigh?: number;
  min?: number;
  unsafeMax?: number;
  suggested: number;
  timeEstimates: {
    low: string;
    medium: string;
    high: string;
  };
  highLoadBehavior?: {
    low: string;
    medium: string;
    high: string;
  };
  // Raw Helius API response
  priorityFeeEstimate?: number;
  priorityFeeLevels?: {
    min?: number;
    low: number;
    medium: number;
    high: number;
    veryHigh?: number;
    unsafeMax?: number;
  };
}

/**
 * Estimates priority fees using Helius API via account keys method
 * @param connection Solana connection object
 * @param accountKeys Optional array of account keys to use for estimation (defaults to Jupiter account)
 * @param options Optional configuration for fee estimation
 * @returns Priority fee estimate with different fee levels
 */
export async function estimatePriorityFeeByAccountKeys(
  connection: Connection,
  accountKeys: string[] = ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],
  options?: {
    lookbackSlots?: number;
    includeVote?: boolean;
  }
): Promise<PriorityFeeEstimate> {
  try {
    // Get RPC URL from connection
    const rpcUrl = connection.rpcEndpoint;
    
    // Make request to Helius API for priority fee estimate using account keys
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getPriorityFeeEstimate",
        params: [{
          "accountKeys": accountKeys,
          "options": {
            "includeAllPriorityFeeLevels": true,
            "lookbackSlots": options?.lookbackSlots || 150,
            "includeVote": options?.includeVote !== undefined ? options.includeVote : true
          }
        }]
      }),
    });
    
    const data = await response.json();

    console.log(data)
    
    if (data.error) {
      throw new Error(`Helius API error: ${data.error.message}`);
    }
    
    // Extract fee levels from the response
    const result = data.result;
    
    // If using Helius API, the response will have priorityFeeLevels
    if (result) {
      const priorityFeeEstimate = result.priorityFeeEstimate || result.priorityFee;
      const priorityFeeLevels = result.priorityFeeLevels;
      
      if (priorityFeeLevels) {
        const { min, low, medium, high, veryHigh, unsafeMax } = priorityFeeLevels;
        // Use the recommended fee or calculate a suggested value based on medium
        const suggested = priorityFeeEstimate || Math.ceil(medium * 1.2);
        
        return {
          low: low || 0,
          medium: medium || 0,
          high: high || 0,
          veryHigh: veryHigh,
          min: min,
          unsafeMax: unsafeMax,
          suggested,
          timeEstimates: {
            low: "1-2 blocks (~0.8s)",
            medium: "1 block (~0.4s)",
            high: "Usually immediate"
          },
          highLoadBehavior: {
            low: "May be delayed or dropped",
            medium: "More consistent inclusion",
            high: "Very likely first-in"
          },
          // Include the raw Helius API response
          priorityFeeEstimate,
          priorityFeeLevels
        };
      }
    }
    
    // Fallback to default values if the API doesn't return expected format
    return getDefaultPriorityFees();
  } catch (error) {
    console.error("Error fetching priority fee estimate by account keys:", error);
    return getDefaultPriorityFees();
  }
}

/**
 * Estimates priority fees using Helius API via serialized transaction method
 * @param connection Solana connection object
 * @param serializedTransaction Base58 encoded serialized transaction (optional)
 * @param options Optional configuration for fee estimation
 * @returns Priority fee estimate with different fee levels
 */
export async function estimatePriorityFeeByTransaction(
  connection: Connection,
  serializedTransaction?: string,
  options?: {
    lookbackSlots?: number;
    includeVote?: boolean;
  }
): Promise<PriorityFeeEstimate> {
  try {
    // Get RPC URL from connection
    const rpcUrl = connection.rpcEndpoint;
    
    // If no serialized transaction is provided, create a dummy transaction
    let encodedTransaction = serializedTransaction;
    if (!encodedTransaction) {
      try {
        // Since the transaction-based method is having issues with encoding,
        // let's fall back to the account keys method which is more reliable
        console.log("Using account keys method as fallback for transaction method");
        return await estimatePriorityFeeByAccountKeys(connection);
      } catch (txError) {
        console.error("Error creating dummy transaction:", txError);
        // If we can't create a transaction, fall back to account keys method
        return estimatePriorityFeeByAccountKeys(connection);
      }
    }
    
    // If we have a serialized transaction (provided externally), use it
    if (encodedTransaction) {
      // Make request to Helius API for priority fee estimate using serialized transaction
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getPriorityFeeEstimate",
          params: [{
            "transaction": encodedTransaction,
            "options": {
              "includeAllPriorityFeeLevels": true,
              "lookbackSlots": options?.lookbackSlots || 150,
              "includeVote": options?.includeVote !== undefined ? options.includeVote : true
            }
          }]
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Helius API error: ${data.error.message}`);
      }
      
      // Extract fee levels from the response
      const result = data.result;
      
      // If using Helius API, the response will have priorityFeeLevels
      if (result) {
        const priorityFeeEstimate = result.priorityFeeEstimate || result.priorityFee;
        const priorityFeeLevels = result.priorityFeeLevels;
        
        if (priorityFeeLevels) {
          const { min, low, medium, high, veryHigh, unsafeMax } = priorityFeeLevels;
          // Use the recommended fee or calculate a suggested value based on medium
          const suggested = priorityFeeEstimate || Math.ceil(medium * 1.2);
          
          return {
            low: low || 0,
            medium: medium || 0,
            high: high || 0,
            veryHigh: veryHigh,
            min: min,
            unsafeMax: unsafeMax,
            suggested,
            timeEstimates: {
              low: "3-5 seconds",
              medium: "2-3 seconds",
              high: "1-2 seconds"
            },
            highLoadBehavior: {
              low: "May be delayed or dropped",
              medium: "More consistent inclusion",
              high: "Very likely first-in"
            },
            // Include the raw Helius API response
            priorityFeeEstimate,
            priorityFeeLevels
          };
        }
      }
    }
    
    // Fallback to default values if the API doesn't return expected format
    return getDefaultPriorityFees();
  } catch (error) {
    console.error("Error fetching priority fee estimate by transaction:", error);
    return getDefaultPriorityFees();
  }
}

/**
 * Main function to estimate priority fees using the preferred method
 * @param connection Solana connection object
 * @param options Optional configuration for fee estimation
 * @returns Priority fee estimate with different fee levels
 */
export async function estimatePriorityFee(
  connection: Connection,
  options?: {
    method?: 'accountKeys' | 'transaction';
    accountKeys?: string[];
    serializedTransaction?: string;
    lookbackSlots?: number;
    includeVote?: boolean;
  }
): Promise<PriorityFeeEstimate> {
  try {
    const method = options?.method || 'accountKeys';
    
    if (method === 'transaction') {
      // If a serialized transaction is provided, use the transaction method
      if (options?.serializedTransaction) {
        return await estimatePriorityFeeByTransaction(connection, options.serializedTransaction, {
          lookbackSlots: options?.lookbackSlots,
          includeVote: options?.includeVote
        });
      } else {
        // Otherwise, fall back to account keys method for reliability
        console.log("No serialized transaction provided, using account keys method");
        return await estimatePriorityFeeByAccountKeys(connection, options?.accountKeys, {
          lookbackSlots: options?.lookbackSlots,
          includeVote: options?.includeVote
        });
      }
    } else {
      return await estimatePriorityFeeByAccountKeys(connection, options?.accountKeys, {
        lookbackSlots: options?.lookbackSlots,
        includeVote: options?.includeVote
      });
    }
  } catch (error) {
    console.error("Error estimating priority fee:", error);
    return getDefaultPriorityFees();
  }
}

/**
 * Returns default priority fee values when API calls fail
 */
function getDefaultPriorityFees(): PriorityFeeEstimate {
  return {
    low: 1000,
    medium: 10000,
    high: 100000,
    veryHigh: 150000,
    min: 0,
    unsafeMax: 200000,
    suggested: 10000,
    timeEstimates: {
      low: "1-2 blocks (~0.8s)",
      medium: "1 block (~0.4s)",
      high: "Usually immediate"
    },
    highLoadBehavior: {
      low: "May be delayed or dropped",
      medium: "More consistent inclusion",
      high: "Very likely first-in"
    },
    priorityFeeEstimate: 10000,
    priorityFeeLevels: {
      min: 0,
      low: 1000,
      medium: 10000,
      high: 100000,
      veryHigh: 150000,
      unsafeMax: 200000
    }
  };
}

// Helper function to create a ComputeBudgetInstruction with the priority fee
export function createPriorityFeeInstruction(microLamports: number) {
  return ComputeBudgetProgram.setComputeUnitPrice({
    microLamports
  });
}
