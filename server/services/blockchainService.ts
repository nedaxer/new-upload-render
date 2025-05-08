import axios from 'axios';
import { CryptoCurrency } from '../models/Transaction';
import { Balance } from '../models/Balance';
import { Transaction } from '../models/Transaction';
import { connectToDatabase } from '../mongodb';

// GetBlock API endpoints
const API_ENDPOINTS = {
  BTC: 'https://go.getblock.io/5e9da01c92674c35b9fb5c8d286273bd',
  ETH: 'https://go.getblock.io/4b0644475d6b4701b1decfde61b18c56',
  BNB: 'https://go.getblock.io/bf19ac9e403e48e89daaefaae7dadc19',
  USDT: 'https://go.getblock.io/d07b3f6821ca46c788db6621fda66835'
};

// Function to get balance from GetBlock API
async function getBlockchainBalance(address: string, currency: CryptoCurrency): Promise<number> {
  try {
    // Different APIs require different methods and parameters
    let method = '';
    let params = [];
    
    switch (currency) {
      case 'BTC':
        method = 'blockchain.address.get_balance';
        params = [address];
        break;
      case 'ETH':
        method = 'eth_getBalance';
        params = [address, 'latest'];
        break;
      case 'BNB':
        method = 'eth_getBalance'; // BNB chain uses Ethereum RPC
        params = [address, 'latest'];
        break;
      case 'USDT':
        // For USDT on ERC-20, we need to use an ERC-20 contract call
        method = 'eth_call';
        params = [{
          to: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT contract address
          data: `0x70a08231000000000000000000000000${address.slice(2)}` // balanceOf function
        }, 'latest'];
        break;
    }
    
    const response = await axios.post(
      API_ENDPOINTS[currency],
      {
        jsonrpc: '2.0',
        method,
        params,
        id: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.GETBLOCK_API_KEY || ''
        }
      }
    );
    
    if (response.data && response.data.result) {
      let balance = 0;
      
      // Different APIs return balances in different formats
      switch (currency) {
        case 'BTC':
          // BTC balance is in satoshis
          balance = parseInt(response.data.result) / 100000000;
          break;
        case 'ETH':
        case 'BNB':
          // ETH and BNB balance is in wei (10^18)
          balance = parseInt(response.data.result, 16) / 1e18;
          break;
        case 'USDT':
          // USDT has 6 decimals
          balance = parseInt(response.data.result, 16) / 1e6;
          break;
      }
      
      return balance;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error getting ${currency} balance for ${address}:`, error);
    return 0;
  }
}

// Function to get current exchange rates
export async function getExchangeRates(): Promise<{
  [key in CryptoCurrency]: number;
}> {
  try {
    // Use CoinGecko API to get current crypto prices
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,tether&vs_currencies=usd'
    );
    
    return {
      BTC: response.data.bitcoin.usd,
      ETH: response.data.ethereum.usd,
      BNB: response.data.binancecoin.usd,
      USDT: response.data.tether.usd
    };
  } catch (error) {
    console.error('Error getting exchange rates:', error);
    
    // Return some fallback values in case of API error
    return {
      BTC: 60000,
      ETH: 3000,
      BNB: 500,
      USDT: 1
    };
  }
}

// Function to check for new deposits and update user balances
export async function checkAndProcessDeposits(userId: string, walletAddresses: {
  btcAddress: string;
  ethAddress: string;
  bnbAddress: string;
  usdtAddress: string;
}): Promise<void> {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get exchange rates
    const rates = await getExchangeRates();
    
    // Check each wallet for new deposits
    const currencies: CryptoCurrency[] = ['BTC', 'ETH', 'BNB', 'USDT'];
    
    for (const currency of currencies) {
      // Get the correct address for this currency
      let address = '';
      switch (currency) {
        case 'BTC':
          address = walletAddresses.btcAddress;
          break;
        case 'ETH':
          address = walletAddresses.ethAddress;
          break;
        case 'BNB':
          address = walletAddresses.bnbAddress;
          break;
        case 'USDT':
          address = walletAddresses.usdtAddress;
          break;
      }
      
      // Get the on-chain balance
      const onChainBalance = await getBlockchainBalance(address, currency);
      
      // Get user's balance record
      let userBalance = await Balance.findOne({ userId });
      
      // If user doesn't have a balance record, create one
      if (!userBalance) {
        userBalance = new Balance({
          userId,
          usdBalance: 0,
          btcBalance: 0,
          ethBalance: 0,
          bnbBalance: 0,
          usdtBalance: 0
        });
      }
      
      // Get the current balance for this currency
      let currentBalance = 0;
      switch (currency) {
        case 'BTC':
          currentBalance = userBalance.btcBalance;
          break;
        case 'ETH':
          currentBalance = userBalance.ethBalance;
          break;
        case 'BNB':
          currentBalance = userBalance.bnbBalance;
          break;
        case 'USDT':
          currentBalance = userBalance.usdtBalance;
          break;
      }
      
      // Check if there's a new deposit
      if (onChainBalance > currentBalance) {
        // Calculate the deposit amount
        const depositAmount = onChainBalance - currentBalance;
        
        // Convert to USD
        const usdAmount = depositAmount * rates[currency];
        
        // Create a transaction record
        const transaction = new Transaction({
          userId,
          type: 'deposit',
          amount: depositAmount,
          usdAmount,
          cryptoCurrency: currency,
          exchangeRate: rates[currency],
          status: 'completed',
          details: `Deposit of ${depositAmount} ${currency}`
        });
        
        await transaction.save();
        
        // Update the user's balance
        // Update cryptocurrency balance
        switch (currency) {
          case 'BTC':
            userBalance.btcBalance = onChainBalance;
            break;
          case 'ETH':
            userBalance.ethBalance = onChainBalance;
            break;
          case 'BNB':
            userBalance.bnbBalance = onChainBalance;
            break;
          case 'USDT':
            userBalance.usdtBalance = onChainBalance;
            break;
        }
        
        // Add to USD balance
        userBalance.usdBalance += usdAmount;
        
        await userBalance.save();
        
        console.log(`Processed deposit of ${depositAmount} ${currency} (${usdAmount} USD) for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error checking and processing deposits:', error);
  }
}