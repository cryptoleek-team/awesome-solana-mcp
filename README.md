# Solana Agent Kit MCP Server

[![npm version](https://badge.fury.io/js/solana-mpc.svg)](https://www.npmjs.com/package/solana-mpc)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A Model Context Protocol (MCP) server that provides onchain tools for Claude AI, allowing it to interact with the Solana blockchain through a standardized interface. This implementation is based on the Solana Agent Kit and enables AI agents to perform blockchain operations seamlessly.

# DEMO VIDEO
https://www.youtube.com/watch?v=VbfSzFuIzn8

# Actions
### GET_VALIDATOR_INFO
Retrieves detailed information about Solana validators
Shows stake amounts, commission rates, and performance metrics

### GET_PRIORITY_FEE_ESTIMATE
Estimates optimal transaction fees based on current network conditions
Provides different fee tiers (low, medium, high) with expected confirmation times

### GET_TRANSACTION_HISTORY
Fetches transaction history for any Solana wallet or token account
Supports filtering by transaction types and pagination

### GET_SECURITY_TXT
Extracts security contact information from Solana programs
Helps users find proper channels for reporting vulnerabilities
Integrated Functions
Your MCP server also includes core Solana functionality for:

Asset management (GET_ASSET, MINT_NFT)
Token operations (DEPLOY_TOKEN, TRANSFER, TRADE)
Network information (GET_TPS, BALANCE)
Utility functions (REQUEST_FUNDS, REGISTER_DOMAIN)
These functions together provide a comprehensive interface for interacting with the Solana blockchain through a unified MCP server.

