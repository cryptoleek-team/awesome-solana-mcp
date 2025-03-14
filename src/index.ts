#!/usr/bin/env node

import { ACTIONS as SAK_ACTIONS, SolanaAgentKit, startMcpServer } from "solana-agent-kit";
import { ACTIONS as CUSTOM_ACTIONS } from "./actions/index.js";
import * as dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
function validateEnvironment() {
    const requiredEnvVars = {
        'SOLANA_PRIVATE_KEY': process.env.SOLANA_PRIVATE_KEY,
        'RPC_URL': process.env.RPC_URL
    };

    const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
}

async function main() {
    try {
        // Validate environment before proceeding
        validateEnvironment();

        const RPC_URL = process.env.RPC_URL as string
        const HELIUS_API_KEY = RPC_URL.split('api-key=')[1]

        // Initialize the agent with error handling
        const agent = new SolanaAgentKit(
            process.env.SOLANA_PRIVATE_KEY!,
            process.env.RPC_URL!,
            {
                OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
                PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || "",
                HELIUS_API_KEY: HELIUS_API_KEY || ""
            }
        );

        // Debug: Log our custom actions
        console.log("Registering custom actions:");
        console.log("GET_VALIDATOR_INFO_ACTION schema:", CUSTOM_ACTIONS.GET_VALIDATOR_INFO_ACTION.schema);
        console.log("GET_PRIORITY_FEE_ESTIMATE_ACTION schema:", CUSTOM_ACTIONS.GET_PRIORITY_FEE_ESTIMATE_ACTION.schema);
        console.log("GET_TRANSACTION_HISTORY_ACTION schema:", CUSTOM_ACTIONS.GET_TRANSACTION_HISTORY_ACTION.schema);
        console.log("GET_SECURITY_TXT_ACTION schema:", CUSTOM_ACTIONS.GET_SECURITY_TXT_ACTION.schema);

        const mcp_actions = {
            GET_ASSET: SAK_ACTIONS.GET_ASSET_ACTION,
            DEPLOY_TOKEN: SAK_ACTIONS.DEPLOY_TOKEN_ACTION,
            FETCH_PRICE: SAK_ACTIONS.FETCH_PRICE_ACTION,
            GET_WALLET_ADDRESS: SAK_ACTIONS.WALLET_ADDRESS_ACTION,
            BALANCE: SAK_ACTIONS.BALANCE_ACTION,
            TRANSFER: SAK_ACTIONS.TRANSFER_ACTION,
            MINT_NFT: SAK_ACTIONS.MINT_NFT_ACTION,
            TRADE: SAK_ACTIONS.TRADE_ACTION,
            REQUEST_FUNDS: SAK_ACTIONS.REQUEST_FUNDS_ACTION,
            REGISTER_DOMAIN: SAK_ACTIONS.RESOLVE_DOMAIN_ACTION,
            GET_TPS: SAK_ACTIONS.GET_TPS_ACTION,
            PARSE_TRANSACTION_ACTION: SAK_ACTIONS.PARSE_TRANSACTION_ACTION,
            // Add our custom actions
            GET_VALIDATOR_INFO: CUSTOM_ACTIONS.GET_VALIDATOR_INFO_ACTION,
            GET_PRIORITY_FEE_ESTIMATE: CUSTOM_ACTIONS.GET_PRIORITY_FEE_ESTIMATE_ACTION,
            GET_TRANSACTION_HISTORY: CUSTOM_ACTIONS.GET_TRANSACTION_HISTORY_ACTION,
            GET_SECURITY_TXT: CUSTOM_ACTIONS.GET_SECURITY_TXT_ACTION,
        };

        // Debug: Log all registered actions
        console.log("All registered MCP actions:", Object.keys(mcp_actions));

        // Start the MCP server with error handling
        await startMcpServer(mcp_actions, agent, { 
            name: "solana-agent", 
            version: "0.0.1"
        });

        // Add console logging for debugging
        console.log("MCP server started successfully");        
    } catch (error) {
        console.error('Failed to start MCP server:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

main();