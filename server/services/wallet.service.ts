import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { Wallet } from '@ethereumjs/wallet';
import axios from 'axios';
import crypto from 'crypto';

// The seed phrase provided by the user
const MNEMONIC = 'glad enroll fiscal silver theme draw velvet team coconut quarter grid fire';

// Derivation path constants
const DERIVATION_PATHS = {
  BTC: "m/44'/0'/0'/0/", // Bitcoin
  ETH: "m/44'/60'/0'/0/", // Ethereum and ERC20 tokens like USDT
  BNB: "m/44'/714'/0'/0/", // Binance Chain
};

// API keys for GetBlock
const API_KEYS = {
  BTC: process.env.GETBLOCK_BTC_API_KEY || '',
  ETH: process.env.GETBLOCK_ETH_API_KEY || '',
  BNB: process.env.GETBLOCK_BNB_API_KEY || '',
  USDT: process.env.GETBLOCK_USDT_API_KEY || '',
};

// Endpoints for GetBlock APIs
const GETBLOCK_ENDPOINTS = {
  BTC: 'https://go.getblock.io/5e9da01c92674c35b9fb5c8d286273bd',
  ETH: 'https://go.getblock.io/4b0644475d6b4701b1decfde61b18c56',
  BNB: 'https://go.getblock.io/bf19ac9e403e48e89daaefaae7dadc19',
  USDT: 'https://go.getblock.io/d07b3f6821ca46c788db6621fda66835', // ERC-20 token
};

// Encryption key for private keys (should be stored in environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-for-development';

interface WalletDetails {
  address: string;
  privateKey: string;
  hdPath: string;
}

class WalletService {
  // Generate a Bitcoin wallet from seed phrase and derivation path index
  generateBitcoinWallet(index: number): WalletDetails {
    const seed = bip39.mnemonicToSeedSync(MNEMONIC);
    const hdPath = `${DERIVATION_PATHS.BTC}${index}`;
    const network = bitcoin.networks.bitcoin;
    
    // Get key pair from HDNode
    const root = bitcoin.bip32.fromSeed(seed, network);
    const child = root.derivePath(hdPath);
    const keyPair = bitcoin.ECPair.fromPrivateKey(child.privateKey!);
    
    // Generate address
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network,
    });
    
    if (!address) {
      throw new Error('Failed to generate Bitcoin address');
    }
    
    return {
      address,
      privateKey: child.privateKey!.toString('hex'),
      hdPath,
    };
  }
  
  // Generate an Ethereum wallet from seed phrase and derivation path index
  generateEthereumWallet(index: number): WalletDetails {
    const seed = bip39.mnemonicToSeedSync(MNEMONIC);
    const hdPath = `${DERIVATION_PATHS.ETH}${index}`;
    
    // Create HD wallet
    const hdKey = Wallet.fromMasterSeed(Buffer.from(seed));
    const childKey = hdKey.derivePath(hdPath);
    
    const address = childKey.getAddressString();
    const privateKey = childKey.getPrivateKeyString().slice(2); // Remove '0x' prefix
    
    return {
      address,
      privateKey,
      hdPath,
    };
  }
  
  // Generate a Binance Chain wallet from seed phrase and derivation path index
  generateBinanceWallet(index: number): WalletDetails {
    const seed = bip39.mnemonicToSeedSync(MNEMONIC);
    const hdPath = `${DERIVATION_PATHS.BNB}${index}`;
    
    // Binance Chain uses the same derivation mechanism as Ethereum
    const hdKey = Wallet.fromMasterSeed(Buffer.from(seed));
    const childKey = hdKey.derivePath(hdPath);
    
    const address = childKey.getAddressString();
    const privateKey = childKey.getPrivateKeyString().slice(2);
    
    return {
      address,
      privateKey,
      hdPath,
    };
  }
  
  // Encrypt a private key before storing in the database
  encryptPrivateKey(privateKey: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }
  
  // Decrypt a private key from the database
  decryptPrivateKey(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Check Bitcoin address balance using GetBlock API
  async checkBitcoinBalance(address: string): Promise<number> {
    try {
      const response = await axios.post(
        GETBLOCK_ENDPOINTS.BTC,
        {
          jsonrpc: '2.0',
          method: 'getaddressbalance',
          params: [address],
          id: 'getbalance',
        },
        {
          headers: {
            'x-api-key': API_KEYS.BTC,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.error) {
        console.error('GetBlock BTC error:', response.data.error);
        return 0;
      }
      
      // Convert satoshis to BTC
      return response.data.result.balance / 100000000;
    } catch (error) {
      console.error('Error checking Bitcoin balance:', error);
      return 0;
    }
  }
  
  // Check Ethereum or ERC20 token balance using GetBlock API
  async checkEthereumBalance(address: string, isToken = false, tokenAddress?: string): Promise<number> {
    try {
      const method = isToken ? 'eth_call' : 'eth_getBalance';
      const params = isToken
        ? [
            {
              to: tokenAddress,
              data: `0x70a08231000000000000000000000000${address.slice(2)}`,
            },
            'latest',
          ]
        : [address, 'latest'];
      
      const endpoint = isToken ? GETBLOCK_ENDPOINTS.USDT : GETBLOCK_ENDPOINTS.ETH;
      const apiKey = isToken ? API_KEYS.USDT : API_KEYS.ETH;
      
      const response = await axios.post(
        endpoint,
        {
          jsonrpc: '2.0',
          method,
          params,
          id: 'getbalance',
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.error) {
        console.error(`GetBlock ${isToken ? 'Token' : 'ETH'} error:`, response.data.error);
        return 0;
      }
      
      // Convert wei to ETH or token units
      const balance = parseInt(response.data.result, 16);
      return balance / (isToken ? 1000000 : 1000000000000000000); // USDT has 6 decimals, ETH has 18
    } catch (error) {
      console.error(`Error checking ${isToken ? 'Token' : 'ETH'} balance:`, error);
      return 0;
    }
  }
  
  // Check BNB balance using GetBlock API
  async checkBinanceBalance(address: string): Promise<number> {
    try {
      const response = await axios.post(
        GETBLOCK_ENDPOINTS.BNB,
        {
          jsonrpc: '2.0',
          method: 'eth_getBalance', // BNB uses the same JSON-RPC method as Ethereum
          params: [address, 'latest'],
          id: 'getbalance',
        },
        {
          headers: {
            'x-api-key': API_KEYS.BNB,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.error) {
        console.error('GetBlock BNB error:', response.data.error);
        return 0;
      }
      
      // Convert wei to BNB
      const balance = parseInt(response.data.result, 16);
      return balance / 1000000000000000000; // BNB has 18 decimals
    } catch (error) {
      console.error('Error checking BNB balance:', error);
      return 0;
    }
  }
  
  // Check USDT (ERC20) balance
  async checkUSDTBalance(address: string): Promise<number> {
    // USDT contract address on Ethereum mainnet
    const usdtContractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
    return this.checkEthereumBalance(address, true, usdtContractAddress);
  }
}

export const walletService = new WalletService();