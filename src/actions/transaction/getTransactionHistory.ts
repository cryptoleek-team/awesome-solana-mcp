import { Action } from "../../types/action.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { getTransactionHistory } from "../../tools/transaction.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const getTransactionHistoryAction: Action = {
  name: "GET_TRANSACTION_HISTORY",
  similes: [
    "transaction history",
    "account transactions",
    "transaction list",
    "tx history",
    "recent transactions",
  ],
  description:
    "Get transaction history for a Solana wallet address or token account using Helius API",
  examples: [
    [
      {
        input: { 
          address: "8zFZHuSRuDpuAR7J6FzwyF3vKNx4CVW3DFHJerQhc7Zd"
        },
        output: {
          status: "success",
          transactions: [
            {
              signature: "5UJpjrKQ8641Q8kPudtvtqR2SgZMz5rSbdpuNP1qy6BxAw4aY3bRfyZQqGKEK5yQXi3yk4pVMRLqzYjnb3bawRn5",
              slot: 172492080,
              timestamp: 1678901234,
              err: null,
              memo: null,
              blockTime: 1678901234,
              type: "System Transfer",
              fee: 5000,
              status: "Success"
            }
          ],
          message: "Successfully retrieved transaction history"
        },
        explanation: "Get recent transaction history for a specific Solana address",
      },
    ],
    [
      {
        input: { 
          address: "8zFZHuSRuDpuAR7J6FzwyF3vKNx4CVW3DFHJerQhc7Zd",
          limit: 5
        },
        output: {
          status: "success",
          transactions: [
            {
              signature: "5UJpjrKQ8641Q8kPudtvtqR2SgZMz5rSbdpuNP1qy6BxAw4aY3bRfyZQqGKEK5yQXi3yk4pVMRLqzYjnb3bawRn5",
              slot: 172492080,
              timestamp: 1678901234,
              err: null,
              memo: null,
              blockTime: 1678901234,
              type: "System Transfer",
              fee: 5000,
              status: "Success"
            }
          ],
          message: "Successfully retrieved 5 most recent transactions"
        },
        explanation: "Get the 5 most recent transactions for a Solana address",
      },
    ],
    [
      {
        input: { 
          address: "8zFZHuSRuDpuAR7J6FzwyF3vKNx4CVW3DFHJerQhc7Zd",
          before: "5UJpjrKQ8641Q8kPudtvtqR2SgZMz5rSbdpuNP1qy6BxAw4aY3bRfyZQqGKEK5yQXi3yk4pVMRLqzYjnb3bawRn5"
        },
        output: {
          status: "success",
          transactions: [
            {
              signature: "4tSRZ8QVNfUyHuJGZQvJzuUbq3nBpZ9QFNEsrey9mEbY6iN7VDuZtFGBciogSGkAiKwbVL8YgYNJZP1XNqXhRmML",
              slot: 172492070,
              timestamp: 1678901200,
              err: null,
              memo: null,
              blockTime: 1678901200,
              type: "Token Transfer",
              fee: 5000,
              status: "Success"
            }
          ],
          message: "Successfully retrieved transaction history before specified signature"
        },
        explanation: "Get transaction history before a specific transaction signature",
      },
    ],
    [
      {
        input: { 
          address: "8zFZHuSRuDpuAR7J6FzwyF3vKNx4CVW3DFHJerQhc7Zd",
          types: ["NFT_SALE", "NFT_LISTING"]
        },
        output: {
          status: "success",
          transactions: [
            {
              signature: "4tSRZ8QVNfUyHuJGZQvJzuUbq3nBpZ9QFNEsrey9mEbY6iN7VDuZtFGBciogSGkAiKwbVL8YgYNJZP1XNqXhRmML",
              slot: 172492070,
              timestamp: 1678901200,
              err: null,
              memo: null,
              blockTime: 1678901200,
              type: "NFT_SALE",
              fee: 5000,
              status: "Success"
            }
          ],
          message: "Successfully retrieved NFT sales and listings transactions"
        },
        explanation: "Get NFT sales and listings transactions for a Solana address",
      },
    ],
  ],
  // Define schema with optional address and optional parameters
  schema: z.object({
    address: z.string().min(32).max(44).optional(),
    limit: z.number().min(1).max(100).optional(),
    before: z.string().optional(),
    until: z.string().optional(),
    minContextSlot: z.number().optional(),
    types: z.array(z.string()).optional(),
  }),
  handler: async (agent: SolanaAgentKit, params: any) => {
    try {
      // Check if address is provided
      if (!params.address) {
        return {
          status: "input_needed",
          message: "Please provide a Solana wallet address to view transaction history.",
          error: "Missing address parameter"
        };
      }
      
      const connection = agent.connection;
      
      // Extract parameters
      const address = params.address;
      const limit = params.limit || 10;
      const before = params.before;
      const until = params.until;
      const minContextSlot = params.minContextSlot;
      const types = params.types;
      
      // Validate address
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(address);
      } catch (error) {
        return {
          status: "error",
          message: "Invalid Solana address provided",
          error: "Invalid public key format"
        };
      }
      
      // Call the getTransactionHistory function with the provided parameters
      const transactions = await getTransactionHistory(publicKey, connection, {
        limit,
        before,
        until,
        minContextSlot,
        types
      });
      
      // Prepare success message based on the parameters used
      let message = "Successfully retrieved transaction history";
      if (limit) {
        message = `Successfully retrieved ${limit} most recent transactions`;
      }
      if (before) {
        message = "Successfully retrieved transaction history before specified signature";
      }
      if (until) {
        message = "Successfully retrieved transaction history until specified signature";
      }
      if (types && types.length > 0) {
        message = `Successfully retrieved ${types.join(', ')} transactions`;
      }
      
      return {
        status: "success",
        transactions: transactions.map(tx => ({
          signature: tx.signature,
          slot: tx.slot,
          timestamp: tx.timestamp,
          err: tx.err,
          memo: tx.memo,
          blockTime: tx.blockTime,
          type: tx.type,
          fee: tx.fee,
          status: tx.status
        })),
        message,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to retrieve transaction history: ${error.message}`,
        error: error.toString(),
        stack: error.stack
      };
    }
  },
};

export default getTransactionHistoryAction;
