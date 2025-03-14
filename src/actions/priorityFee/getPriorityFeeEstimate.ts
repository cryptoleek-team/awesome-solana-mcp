import { Action } from "../../types/action.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { estimatePriorityFee } from "../../tools/priorityFee.js";

const getPriorityFeeEstimateAction: Action = {
  name: "GET_PRIORITY_FEE_ESTIMATE",
  similes: [
    "estimate priority fee",
    "transaction fee estimate",
    "optimal priority fee",
    "solana fee estimate",
    "transaction cost estimate",
  ],
  description:
    "Estimates optimal priority fees for Solana transactions based on recent network activity",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          estimate: {
            low: 1000,
            medium: 10000,
            high: 100000,
            suggested: 12000,
            timeEstimates: {
              low: "3-5 seconds",
              medium: "2-3 seconds",
              high: "1-2 seconds"
            }
          },
          message: "Successfully estimated priority fees",
        },
        explanation: "Get current priority fee estimates for Solana transactions",
      },
    ],
    [
      {
        input: { method: "transaction" },
        output: {
          status: "success",
          estimate: {
            low: 1000,
            medium: 10000,
            high: 100000,
            suggested: 12000,
            timeEstimates: {
              low: "3-5 seconds",
              medium: "2-3 seconds",
              high: "1-2 seconds"
            }
          },
          message: "Successfully estimated priority fees using transaction method",
        },
        explanation: "Get priority fee estimates using the transaction-based method",
      },
    ],
    [
      {
        input: { 
          method: "accountKeys",
          accountKeys: ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"]
        },
        output: {
          status: "success",
          estimate: {
            low: 1000,
            medium: 10000,
            high: 100000,
            suggested: 12000,
            timeEstimates: {
              low: "3-5 seconds",
              medium: "2-3 seconds",
              high: "1-2 seconds"
            }
          },
          message: "Successfully estimated priority fees for specific account keys",
        },
        explanation: "Get priority fee estimates for specific account keys",
      },
    ],
  ],
  // Define schema with optional parameters
  schema: z.object({
    method: z.enum(["accountKeys", "transaction"]).optional(),
    accountKeys: z.array(z.string()).optional(),
    serializedTransaction: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, params: any) => {
    try {
      const connection = agent.connection;
      
      // Extract parameters
      const method = params.method;
      const accountKeys = params.accountKeys;
      const serializedTransaction = params.serializedTransaction;
      
      // Call the estimatePriorityFee function with the provided parameters
      const feeEstimate = await estimatePriorityFee(connection, {
        method,
        accountKeys,
        serializedTransaction
      });

      // Prepare success message based on the method used
      let message = "Successfully estimated priority fees";
      if (method === "transaction") {
        message = "Successfully estimated priority fees using transaction method";
      } else if (method === "accountKeys" && accountKeys) {
        message = "Successfully estimated priority fees for specific account keys";
      }

      return {
        status: "success",
        estimate: feeEstimate,
        message,
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to estimate priority fees: ${error.message}`,
        error: error.toString(),
        stack: error.stack
      };
    }
  },
};

export default getPriorityFeeEstimateAction;
