import { Request, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { 
  stakeUsd, 
  unstake, 
  getUserStakingPositions, 
  getAllStakingRates 
} from '../services/stakingService';

/**
 * Stake USD into cryptocurrency
 */
export async function stakeUsdToCrypto(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate request body
    const schema = z.object({
      currency: z.enum(['BTC', 'ETH', 'BNB', 'USDT']),
      usdAmount: z.number().positive()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: result.error.format()
      });
    }

    const { currency, usdAmount } = result.data;

    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());

    // Process the staking request
    const stakingResult = await stakeUsd(userId.toString(), currency, usdAmount);

    if (!stakingResult.success) {
      return res.status(400).json(stakingResult);
    }

    return res.status(200).json(stakingResult);
  } catch (error) {
    console.error('Error staking USD:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your staking request'
    });
  }
}

/**
 * Unstake (withdraw) from a staking position
 */
export async function unstakePosition(req: Request, res: Response) {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate request body
    const schema = z.object({
      stakingId: z.string(),
      withdrawRewardsOnly: z.boolean().optional()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: result.error.format()
      });
    }

    const { stakingId, withdrawRewardsOnly = false } = result.data;

    // Convert session userId to ObjectId for MongoDB
    const userId = new Types.ObjectId(req.session.userId.toString());

    // Process the unstaking request
    const unstakeResult = await unstake(userId.toString(), stakingId, withdrawRewardsOnly);

    if (!unstakeResult.success) {
      return res.status(400).json(unstakeResult);
    }

    return res.status(200).json(unstakeResult);
  } catch (error) {
    console.error('Error unstaking position:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your unstaking request'
    });
  }
}

/**
 * Get user's staking positions
 */
export async function getUserStaking(req: Request, res: Response) {
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

    // Get user staking positions
    const stakingPositions = await getUserStakingPositions(userId.toString());

    return res.status(200).json({
      success: true,
      stakingPositions
    });
  } catch (error) {
    console.error('Error getting user staking positions:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your staking positions'
    });
  }
}

/**
 * Get all staking rates
 */
export async function getStakingRates(req: Request, res: Response) {
  try {
    const rates = await getAllStakingRates();
    
    return res.status(200).json({
      success: true,
      rates
    });
  } catch (error) {
    console.error('Error getting staking rates:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching staking rates'
    });
  }
}