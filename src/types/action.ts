import { z } from "zod";
import { SolanaAgentKit } from "solana-agent-kit";

export interface Action {
  name: string;
  similes: string[];
  description: string;
  examples: any[];
  schema: z.ZodObject<any>;
  handler: (agent: SolanaAgentKit, input: Record<string, any>) => Promise<any>;
}
