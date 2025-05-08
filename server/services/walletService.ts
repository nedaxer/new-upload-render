import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import Wallet from 'ethereumjs-wallet';
import elliptic from 'elliptic';
import { createHash } from 'crypto';
import { Wallet as WalletModel } from '../models/Wallet';
import { connectToDatabase } from '../mongodb';

// Initialize elliptic curve
const EC = elliptic.ec;

// The BNB derivation path uses secp256k1
const ec = new EC('secp256k1');

// Seed phrase from the configuration
const seedPhrase = 'glad enroll fiscal silver theme draw velvet team coconut quarter grid fire';

// Derivation paths
const ETH_PATH_PREFIX = "m/44'/60'/0'/0/"; // For ETH and USDT (ERC-20)
const BTC_PATH_PREFIX = "m/44'/0'/0'/0/";
const BNB_PATH_PREFIX = "m/44'/714'/0'/0/";

/**
 * Convert a mnemonic seed phrase to a seed buffer
 */
function mnemonicToSeed(mnemonic: string): Buffer {
  return bip39.mnemonicToSeedSync(mnemonic);
}

/**
 * Generate an Ethereum wallet from a seed and derivation index
 */
function generateEthWallet(seed: Buffer, index: number): { address: string, privateKey: string } {
  const hdkey = HDKey.fromMasterSeed(seed);
  const childKey = hdkey.derive(ETH_PATH_PREFIX + index);
  const wallet = Wallet.fromPrivateKey(Buffer.from(childKey.privateKey));
  
  return {
    address: wallet.getAddressString(),
    privateKey: wallet.getPrivateKeyString()
  };
}

/**
 * Generate a Bitcoin wallet from a seed and derivation index
 * Note: This implementation is simplified - in production, use a complete BTC library
 */
function generateBtcWallet(seed: Buffer, index: number): { address: string, privateKey: string } {
  const hdkey = HDKey.fromMasterSeed(seed);
  const childKey = hdkey.derive(BTC_PATH_PREFIX + index);
  
  // Convert public key to Bitcoin address (simplified)
  // This is a simplified implementation - in production, use a proper BTC library
  const sha256 = createHash('sha256').update(Buffer.from(childKey.publicKey)).digest();
  const ripemd160 = createHash('ripemd160').update(sha256).digest();
  
  // Add version byte (0x00 for mainnet)
  const versionedPayload = Buffer.concat([Buffer.from([0x00]), ripemd160]);
  
  // Checksum (first 4 bytes of double-SHA256)
  const checksum = createHash('sha256')
    .update(
      createHash('sha256').update(versionedPayload).digest()
    )
    .digest()
    .slice(0, 4);
  
  // Combine versioned payload and checksum
  const binaryAddress = Buffer.concat([versionedPayload, checksum]);
  
  // Convert to base58
  // Note: In production, use a proper base58 encoding library
  const address = "bc1" + binaryAddress.toString('hex');
  
  return {
    address,
    privateKey: childKey.privateKey.toString('hex')
  };
}

/**
 * Generate a Binance (BNB) wallet from a seed and derivation index
 */
function generateBnbWallet(seed: Buffer, index: number): { address: string, privateKey: string } {
  const hdkey = HDKey.fromMasterSeed(seed);
  const childKey = hdkey.derive(BNB_PATH_PREFIX + index);
  
  // Generate key pair from private key
  const keyPair = ec.keyFromPrivate(childKey.privateKey);
  const publicKey = keyPair.getPublic();
  
  // Convert public key to BNB address (simplified)
  // This is a simplified implementation - in production, use a proper BNB library
  const publicKeyHash = createHash('sha256')
    .update(Buffer.from(publicKey.encode('hex', false).slice(2), 'hex'))
    .digest();
  
  const ripemd160 = createHash('ripemd160')
    .update(publicKeyHash)
    .digest();
  
  // BNB address format (simplified)
  const address = "bnb1" + ripemd160.toString('hex').slice(0, 40);
  
  return {
    address,
    privateKey: childKey.privateKey.toString('hex')
  };
}

/**
 * Generate user wallets for all supported cryptocurrencies
 */
export async function generateUserWallets(userId: string): Promise<{
  btcAddress: string;
  ethAddress: string;
  bnbAddress: string;
  usdtAddress: string;
}> {
  // Connect to database
  await connectToDatabase();
  
  // Check if user already has wallets
  const existingWallet = await WalletModel.findOne({ userId });
  if (existingWallet) {
    return {
      btcAddress: existingWallet.btcAddress,
      ethAddress: existingWallet.ethAddress,
      bnbAddress: existingWallet.bnbAddress,
      usdtAddress: existingWallet.ethAddress, // USDT (ERC-20) uses ETH address
    };
  }
  
  // Find the maximum index used so far to avoid address reuse
  const maxWallet = await WalletModel.findOne()
    .sort({ 
      btcDerivationIndex: -1, 
      ethDerivationIndex: -1, 
      bnbDerivationIndex: -1,
      usdDerivationIndex: -1
    })
    .limit(1);
  
  const btcIndex = maxWallet ? maxWallet.btcDerivationIndex + 1 : 0;
  const ethIndex = maxWallet ? maxWallet.ethDerivationIndex + 1 : 0;
  const bnbIndex = maxWallet ? maxWallet.bnbDerivationIndex + 1 : 0;
  const usdtIndex = ethIndex; // USDT (ERC-20) shares index with ETH
  
  // Generate seed from mnemonic
  const seed = mnemonicToSeed(seedPhrase);
  
  // Generate wallets for each cryptocurrency
  const btcWallet = generateBtcWallet(seed, btcIndex);
  const ethWallet = generateEthWallet(seed, ethIndex);
  const bnbWallet = generateBnbWallet(seed, bnbIndex);
  
  // USDT (ERC-20) uses the same address as ETH
  const usdtAddress = ethWallet.address;
  
  // Create wallet record
  const walletDoc = new WalletModel({
    userId,
    btcAddress: btcWallet.address,
    ethAddress: ethWallet.address,
    bnbAddress: bnbWallet.address,
    usdtAddress,
    btcDerivationIndex: btcIndex,
    ethDerivationIndex: ethIndex,
    bnbDerivationIndex: bnbIndex,
    usdDerivationIndex: usdtIndex
  });
  
  await walletDoc.save();
  
  // Return only the addresses (not the private keys)
  return {
    btcAddress: btcWallet.address,
    ethAddress: ethWallet.address,
    bnbAddress: bnbWallet.address,
    usdtAddress
  };
}

/**
 * Get user wallet information
 */
export async function getUserWallets(userId: string) {
  await connectToDatabase();
  const wallet = await WalletModel.findOne({ userId });
  
  if (!wallet) {
    return null;
  }
  
  return {
    btcAddress: wallet.btcAddress,
    ethAddress: wallet.ethAddress,
    bnbAddress: wallet.bnbAddress,
    usdtAddress: wallet.usdtAddress
  };
}