import { Connection, PublicKey } from '@solana/web3.js';
import { parseTransaction } from 'solana-agent-kit/dist/tools/index.js';

// Interface for transaction history options
interface TransactionHistoryOptions {
  limit?: number;
  before?: string;
  until?: string;
  types?: string[];
  minContextSlot?: number;
}

// Interface for transaction data
interface TransactionData {
  signature: string;
  slot: number;
  timestamp: number;
  err: any;
  memo: string | null;
  blockTime: number;
  type: string;
  fee: number;
  status: string;
}

/**
 * Get transaction history for a Solana wallet address or token account using Helius API
 * @param publicKey - The public key to get transaction history for
 * @param connection - Solana connection object (not used with Helius but kept for compatibility)
 * @param options - Optional parameters for filtering transactions
 * @returns Array of transaction data
 */
export async function getTransactionHistory(
  publicKey: PublicKey,
  connection: Connection,
  options: TransactionHistoryOptions = {}
): Promise<TransactionData[]> {
  try {
    const address = publicKey.toString();
    
    // Helius SDK doesn't have a direct method for transaction history
    // We'll use the fetchTransactionHistory helper function to make the API call
    const transactions = await fetchTransactionHistory(connection, address, options);
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}

/**
 * Helper function to fetch transaction history using Helius API directly
 * @param address - The address to get transaction history for
 * @param options - Query parameters
 * @returns Array of transaction data from Helius
 */
async function fetchTransactionHistory(
  connection: Connection,
  address: string,
  options: TransactionHistoryOptions = {}
): Promise<TransactionData[]> {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {};
    
    if (options.limit) {
      queryParams.limit = options.limit.toString();
    }
    
    if (options.before) {
      queryParams.before = options.before;
    }
    
    if (options.until) {
      queryParams.until = options.until;
    }
    
    if (options.types && options.types.length > 0) {
      queryParams.type = options.types.join(',');
    }
    
    // Convert params to URL query string
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    
    const rpcUrl = connection.rpcEndpoint;
    const apiKey = rpcUrl.split('api-key=')[1];   

    if (!apiKey) {
      throw new Error('Missing Helius API key');
    }
    
    // Build the URL
    const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}${queryString ? `&${queryString}` : ''}`;
    
    // Fetch data from Helius API
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Helius API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    // Map the response to our expected format
    return data.map((tx: any) => ({
      signature: tx.signature,
      slot: tx.slot,
      timestamp: tx.timestamp,
      err: tx.err,
      memo: tx.memo || null,
      blockTime: tx.timestamp,
      type: tx.type || 'Unknown',
      fee: tx.fee || 0,      
      status: tx.err ? 'Failed' : 'Success'
    }));
  } catch (error) {
    console.error('Error in fetchTransactionHistory:', error);
    throw error;
  }
}

