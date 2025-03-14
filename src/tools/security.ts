import { Connection, PublicKey } from "@solana/web3.js";
import * as bs58 from "bs58";

// Interface for security.txt content
export interface SecurityTxtInfo {
  contact?: string;
  expires?: string;
  encryption?: string;
  acknowledgments?: string;
  preferredLanguages?: string;
  canonical?: string;
  policy?: string;
  hiring?: string;
  // Any additional fields that might be in the security.txt
  [key: string]: string | undefined;
}

/**
 * Extracts and parses security.txt information from a Solana program
 * 
 * @param programId - The PublicKey of the Solana program to inspect
 * @param connection - The Solana connection object
 * @returns The parsed security.txt information
 */
export async function getSecurityTxtInfo(programId: PublicKey, connection: Connection): Promise<SecurityTxtInfo> {
  try {
    // Get the program account data
    const programAccount = await connection.getAccountInfo(programId);
    
    if (!programAccount) {
      throw new Error("Program account not found");
    }
    
    // Check if this is an upgradeable program
    const BPF_UPGRADEABLE_LOADER_ID = new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");
    
    let programData: Buffer;
    
    if (programAccount.owner.equals(BPF_UPGRADEABLE_LOADER_ID)) {
      // This is an upgradeable program, we need to find the program data account
      // The first 4 bytes indicate the account type
      const accountType = programAccount.data.slice(0, 4);
      
      // Check if this is a Program account (type 2)
      if (accountType[0] === 2) {
        // Extract the program data address (next 32 bytes)
        const programDataAddress = new PublicKey(programAccount.data.slice(4, 36));
        
        // Get the program data account
        const programDataAccount = await connection.getAccountInfo(programDataAddress);
        
        if (!programDataAccount) {
          throw new Error("Program data account not found");
        }
        
        // The program data starts after the header (first 8 bytes)
        // First byte is account type, next 7 bytes are the slot
        programData = programDataAccount.data.slice(8);
      } else {
        throw new Error("Not a valid upgradeable program account");
      }
    } else {
      // For non-upgradeable programs, use the account data directly
      programData = programAccount.data;
    }
    
    // Now search for security.txt in the program data
    return findAndParseSecurityTxt(programData);
  } catch (error) {
    throw error;
  }
}

/**
 * Finds and parses security.txt content in program data
 * 
 * @param programData - The program binary data
 * @returns Parsed security.txt information
 */
function findAndParseSecurityTxt(programData: Buffer): SecurityTxtInfo {
  try {
    // Convert the binary data to a string
    // Note: This is a simplification, as the security.txt might be encoded in various ways
    const dataString = new TextDecoder().decode(programData);
    
    // Look for security.txt pattern
    // Pattern 1: Standard security.txt format
    const securityTxtMatch = dataString.match(/(?:^|\n)# ?security\.txt(?:\n|$)([\s\S]*?)(?:\n\n|\n#|$)/i);
    
    if (securityTxtMatch && securityTxtMatch[1]) {
      return parseSecurityTxt(securityTxtMatch[1]);
    }
    
    // Pattern 2: Look for BEGIN/END SECURITY.TXT markers
    const securityTxtBlockMatch = dataString.match(/-----BEGIN SECURITY\.TXT-----([\s\S]*?)-----END SECURITY\.TXT-----/i);
    
    if (securityTxtBlockMatch && securityTxtBlockMatch[1]) {
      return parseSecurityTxt(securityTxtBlockMatch[1]);
    }
    
    // Pattern 3: Look for common security.txt fields
    const fieldMatch = dataString.match(/Contact: ([^\n]+)/i) || 
                       dataString.match(/Security-Contact: ([^\n]+)/i) ||
                       dataString.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    
    if (fieldMatch) {
      const result: SecurityTxtInfo = {};
      result.contact = fieldMatch[1].trim();
      return result;
    }
    
    // If we couldn't find any specific security.txt format, try to extract any security-related info
    return extractSecurityInfoFromText(dataString);
  } catch (error) {
    // If we encounter any error during parsing, return an empty object
    console.error("Error parsing security.txt:", error);
    return {};
  }
}

/**
 * Parses security.txt content into a structured object
 * 
 * @param content - The raw security.txt content
 * @returns Structured security.txt information
 */
function parseSecurityTxt(content: string): SecurityTxtInfo {
  const result: SecurityTxtInfo = {};
  
  // Split by lines and process each line
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }
    
    // Extract field and value
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const [_, field, value] = match;
      const fieldName = field.trim().toLowerCase();
      
      // Convert kebab-case to camelCase
      const camelCaseField = fieldName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      
      result[camelCaseField] = value.trim();
    }
  }
  
  return result;
}

/**
 * Attempts to extract security information from program text when no explicit security.txt is found
 * 
 * @param text - The program text to analyze
 * @returns Any security information found
 */
function extractSecurityInfoFromText(text: string): SecurityTxtInfo {
  const result: SecurityTxtInfo = {};
  
  // Look for common patterns that might indicate security contact info
  const contactMatches = [
    // Email patterns
    ...text.match(/security@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
    ...text.match(/mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
    // URL patterns
    ...text.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/security/g) || [],
    ...text.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/responsible-disclosure/g) || [],
    ...text.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/vulnerability/g) || [],
  ];
  
  if (contactMatches.length > 0) {
    result.contact = contactMatches[0];
  }
  
  // Look for PGP key patterns
  const pgpMatches = text.match(/-----BEGIN PGP PUBLIC KEY BLOCK-----([\s\S]*?)-----END PGP PUBLIC KEY BLOCK-----/g);
  if (pgpMatches) {
    result.encryption = "PGP key found in program data";
  }
  
  return result;
}
