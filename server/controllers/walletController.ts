import { Request, Response } from 'express';
import { generateUserWallets, getUserWallets } from '../services/walletService';
import { checkAndProcessDeposits } from '../services/blockchainService';
import { Types } from 'mongoose';

/**
 * Generate wallet addresses for a user
 */
export async function generateWalletAddresses(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());
    
    // Generate wallet addresses
    const walletAddresses = await generateUserWallets(userId.toString());
    
    return res.status(200).json({
      success: true,
      walletAddresses
    });
  } catch (error) {
    console.error('Error generating wallet addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating wallet addresses'
    });
  }
}

/**
 * Get wallet addresses for a user
 */
export async function getWalletAddresses(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());
    
    // Get wallet addresses
    const walletAddresses = await getUserWallets(userId.toString());
    
    if (!walletAddresses) {
      return res.status(404).json({
        success: false,
        message: 'No wallet addresses found. Please generate addresses first.'
      });
    }
    
    return res.status(200).json({
      success: true,
      walletAddresses
    });
  } catch (error) {
    console.error('Error getting wallet addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while getting wallet addresses'
    });
  }
}

/**
 * Check wallet balances and process deposits
 */
export async function checkWalletBalances(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());
    
    // Get wallet addresses
    const walletAddresses = await getUserWallets(userId.toString());
    
    if (!walletAddresses) {
      return res.status(404).json({
        success: false,
        message: 'No wallet addresses found. Please generate addresses first.'
      });
    }
    
    // Check and process deposits
    await checkAndProcessDeposits(userId.toString(), walletAddresses);
    
    return res.status(200).json({
      success: true,
      message: 'Wallet balances checked and deposits processed successfully'
    });
  } catch (error) {
    console.error('Error checking wallet balances:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while checking wallet balances'
    });
  }
}