import { Connection, PublicKey } from "@solana/web3.js";

export async function getValidatorInfo(validatorPubkey: PublicKey, connection: Connection) {
  try {
    // Get the current epoch info
    const epochInfo = await connection.getEpochInfo();
    
    // Get vote accounts to find our validator
    const voteAccounts = await connection.getVoteAccounts();
    
    // Find the validator in either current or delinquent vote accounts
    const allAccounts = [...voteAccounts.current, ...voteAccounts.delinquent];
    const validatorAccount = allAccounts.find(
      account => account.votePubkey === validatorPubkey.toString()
    );
    
    if (!validatorAccount) {
      throw new Error("Validator not found");
    }
    
    // Get validator's identity account balance
    const balance = await connection.getBalance(new PublicKey(validatorAccount.nodePubkey));
    
    return {
      identity: validatorAccount.nodePubkey,
      vote: validatorAccount.votePubkey,
      commission: validatorAccount.commission,
      activatedStake: validatorAccount.activatedStake,
      epochVoteAccount: validatorAccount.epochVoteAccount,
      epochCredits: validatorAccount.epochCredits,
      delinquent: voteAccounts.delinquent.some(
        account => account.votePubkey === validatorPubkey.toString()
      ),
      lastVote: validatorAccount.lastVote, 
      balance: balance,
      currentEpoch: epochInfo.epoch,
    };
  } catch (error) {
    throw error;
  }
}
