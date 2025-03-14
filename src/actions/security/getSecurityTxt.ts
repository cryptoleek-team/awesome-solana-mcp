import { Action } from "../../types/action.js";
import { SolanaAgentKit } from "solana-agent-kit";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { getSecurityTxtInfo } from "../../tools/security.js";

const getSecurityTxtAction: Action = {
  name: "GET_SECURITY_TXT",
  similes: [
    "security.txt",
    "security contact",
    "program security",
    "security disclosure",
    "vulnerability reporting",
    "security information",
    "contact maintainers",
    "security policy",
  ],
  description:
    "Extract and display the security.txt file information for a given Solana program, making it easier to contact the program's maintainers with security concerns",
  examples: [
    [
      {
        input: {
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
        output: {
          status: "success",
          info: {
            contact: "mailto:security@solana.com",
            expires: "2023-12-31T23:59:59.000Z",
            encryption: "https://solana.com/pgp-key.txt",
            acknowledgments: "https://solana.com/hall-of-fame",
            preferredLanguages: "en",
          },
          message: "Successfully retrieved security.txt information",
        },
        explanation: "Get security contact information for the Solana Token Program",
      },
    ],
  ],
  schema: z.object({
    programId: z
      .string()
      .describe("The program ID (public key) of the Solana program to inspect"),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const programPubkey = new PublicKey(input.programId);
      const connection = agent.connection;
      
      const securityInfo = await getSecurityTxtInfo(programPubkey, connection);

      // If we couldn't find any security information
      if (Object.keys(securityInfo).length === 0) {
        return {
          status: "warning",
          info: null,
          message: "No security.txt information found for this program",
        };
      }

      return {
        status: "success",
        info: securityInfo,
        message: "Successfully retrieved security.txt information",
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get security.txt info: ${error.message}`,
      };
    }
  },
};

export default getSecurityTxtAction;
