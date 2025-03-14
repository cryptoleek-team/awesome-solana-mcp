import { Action } from "../../types/action.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { getValidatorInfo } from "../../tools/validator.js";

const getValidatorInfoAction: Action = {
  name: "GET_VALIDATOR_INFO",
  similes: [
    "validator status",
    "check validator",
    "validator info",
    "validator details",
    "node information",
  ],
  description:
    "Get detailed information about a Solana validator including stake, commission, and performance",
  examples: [
    [
      {
        input: {
          validatorAddress: "he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk",
        },
        output: {
          status: "success",
          info: {
            identity: "HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU",
            vote: "he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk",
            commission: 10,
            activatedStake: 1520000000,
            delinquent: false,
            skipRate: 0.0234,
          },
          message: "Successfully retrieved validator information",
        },
        explanation: "Get information about a specific Solana validator",
      },
    ],
  ],
  schema: z.object({
    validatorAddress: z
      .string()
      .describe("The public key of the validator to get information about"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const validatorPubkey = new PublicKey(input.validatorAddress);
      const connection = agent.connection;
      
      const validatorInfo = await getValidatorInfo(validatorPubkey, connection);

      return {
        status: "success",
        info: validatorInfo,
        message: "Successfully retrieved validator information",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get validator info: ${error.message}`,
      };
    }
  },
};

export default getValidatorInfoAction;
