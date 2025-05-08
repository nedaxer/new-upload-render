import { Balance } from '../models/Balance';
import { Staking, IStaking } from '../models/Staking';
import { Transaction, CryptoCurrency } from '../models/Transaction';
import { connectToDatabase } from '../mongodb';
import { getExchangeRates } from './blockchainService';

// Default staking reward rates (weekly percentage)
const DEFAULT_REWARD_RATES: { [key in CryptoCurrency]: number } = {
  BTC: 0.5, // 0.5% weekly, approximately 26% APY
  ETH: 0.7, // 0.7% weekly, approximately 36% APY
  BNB: 0.9, // 0.9% weekly, approximately 47% APY
  USDT: 0.4, // 0.4% weekly, approximately 21% APY
};

// Get staking rate for a particular currency
export async function getStakingRate(currency: CryptoCurrency): Promise<number> {
  // This could be expanded to fetch rates from a database table
  // that can be updated by admins
  return DEFAULT_REWARD_RATES[currency];
}

// Get all staking rates
export async function getAllStakingRates(): Promise<{ [key in CryptoCurrency]: number }> {
  return DEFAULT_REWARD_RATES;
}

/**
 * Stake USD into a cryptocurrency
 */
export async function stakeUsd(
  userId: string,
  currency: CryptoCurrency,
  usdAmount: number
): Promise<{ success: boolean; message: string; staking?: any }> {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get user balance
    const userBalance = await Balance.findOne({ userId });
    
    // Check if user has a balance record
    if (!userBalance) {
      return { 
        success: false, 
        message: 'User balance not found. Please deposit funds first.' 
      };
    }
    
    // Check if user has enough USD balance
    if (userBalance.usdBalance < usdAmount) {
      return { 
        success: false, 
        message: `Insufficient USD balance. Available: $${userBalance.usdBalance.toFixed(2)}, Required: $${usdAmount.toFixed(2)}` 
      };
    }
    
    // Get staking rate for this currency
    const rewardRate = await getStakingRate(currency);
    
    // Create staking record
    const staking = new Staking({
      userId,
      cryptoCurrency: currency,
      amount: usdAmount,
      rewardRate,
      startDate: new Date(),
      lastRewardDate: new Date(),
      totalRewards: 0,
      active: true
    });
    
    await staking.save();
    
    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'stake',
      amount: usdAmount,
      usdAmount,
      cryptoCurrency: currency,
      status: 'completed',
      details: `Staked $${usdAmount.toFixed(2)} in ${currency} at ${rewardRate}% weekly rate`
    });
    
    await transaction.save();
    
    // Update user balance
    userBalance.usdBalance -= usdAmount;
    await userBalance.save();
    
    return {
      success: true,
      message: `Successfully staked $${usdAmount.toFixed(2)} in ${currency}`,
      staking: {
        id: staking._id,
        currency,
        amount: usdAmount,
        rewardRate,
        startDate: staking.startDate,
        estimatedWeeklyReward: (usdAmount * rewardRate / 100).toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error staking USD:', error);
    return {
      success: false,
      message: 'An error occurred while processing your staking request'
    };
  }
}

/**
 * Calculate and apply staking rewards for all active stakings
 * This should be called periodically (e.g., daily) to update rewards
 */
export async function calculateAndApplyStakingRewards(): Promise<void> {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get all active stakings
    const activeStakings = await Staking.find({ active: true });
    
    for (const staking of activeStakings) {
      // Calculate time since last reward
      const now = new Date();
      const lastRewardDate = staking.lastRewardDate;
      const daysSinceLastReward = (now.getTime() - lastRewardDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // We only apply rewards if at least one day has passed
      if (daysSinceLastReward >= 1) {
        // Calculate reward for the period
        // Convert weekly rate to daily rate
        const dailyRate = staking.rewardRate / 7;
        const daysToReward = Math.floor(daysSinceLastReward);
        const rewardAmount = staking.amount * (dailyRate / 100) * daysToReward;
        
        // Update staking record
        staking.totalRewards += rewardAmount;
        staking.lastRewardDate = new Date(
          lastRewardDate.getTime() + (daysToReward * 24 * 60 * 60 * 1000)
        );
        
        await staking.save();
        
        // Create transaction record for the reward
        const transaction = new Transaction({
          userId: staking.userId,
          type: 'staking_reward',
          amount: rewardAmount,
          usdAmount: rewardAmount,
          cryptoCurrency: staking.cryptoCurrency,
          status: 'completed',
          details: `Staking reward for ${staking.cryptoCurrency} position`
        });
        
        await transaction.save();
        
        console.log(`Applied staking reward of $${rewardAmount.toFixed(2)} for user ${staking.userId}'s ${staking.cryptoCurrency} position`);
      }
    }
  } catch (error) {
    console.error('Error calculating staking rewards:', error);
  }
}

/**
 * Unstake (withdraw) from a staking position
 */
export async function unstake(
  userId: string,
  stakingId: string,
  withdrawRewardsOnly: boolean = false
): Promise<{ success: boolean; message: string; transaction?: any }> {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get staking position
    const staking = await Staking.findOne({ _id: stakingId, userId });
    
    if (!staking) {
      return {
        success: false,
        message: 'Staking position not found'
      };
    }
    
    if (!staking.active) {
      return {
        success: false,
        message: 'This staking position is already closed'
      };
    }
    
    // Calculate any pending rewards up to now
    const now = new Date();
    const lastRewardDate = staking.lastRewardDate;
    const daysSinceLastReward = (now.getTime() - lastRewardDate.getTime()) / (1000 * 60 * 60 * 24);
    
    let pendingReward = 0;
    
    if (daysSinceLastReward > 0) {
      // Convert weekly rate to daily rate
      const dailyRate = staking.rewardRate / 7;
      pendingReward = staking.amount * (dailyRate / 100) * daysSinceLastReward;
    }
    
    // Total rewards = accumulated + pending
    const totalRewards = staking.totalRewards + pendingReward;
    
    // Get user balance
    let userBalance = await Balance.findOne({ userId });
    
    // Create user balance if it doesn't exist
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
    
    let withdrawalAmount = 0;
    let details = '';
    
    if (withdrawRewardsOnly) {
      // Only withdraw rewards
      withdrawalAmount = totalRewards;
      details = `Withdrew $${withdrawalAmount.toFixed(2)} rewards from ${staking.cryptoCurrency} staking`;
      
      // Update staking record
      staking.totalRewards = 0;
      staking.lastRewardDate = now;
      
      await staking.save();
    } else {
      // Withdraw principal + rewards
      withdrawalAmount = staking.amount + totalRewards;
      details = `Closed staking position and withdrew $${withdrawalAmount.toFixed(2)} (principal + rewards) from ${staking.cryptoCurrency} staking`;
      
      // Close staking position
      staking.active = false;
      staking.endDate = now;
      
      await staking.save();
    }
    
    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'unstake',
      amount: withdrawalAmount,
      usdAmount: withdrawalAmount,
      cryptoCurrency: staking.cryptoCurrency,
      status: 'completed',
      details
    });
    
    await transaction.save();
    
    // Update user balance
    userBalance.usdBalance += withdrawalAmount;
    await userBalance.save();
    
    return {
      success: true,
      message: `Successfully withdrew $${withdrawalAmount.toFixed(2)} from staking`,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: withdrawalAmount,
        details,
        date: transaction.createdAt
      }
    };
  } catch (error) {
    console.error('Error unstaking:', error);
    return {
      success: false,
      message: 'An error occurred while processing your unstaking request'
    };
  }
}

/**
 * Get user's active staking positions
 */
export async function getUserStakingPositions(userId: string): Promise<{
  activePositions: any[];
  totalStaked: number;
  totalRewards: number;
  estimatedWeeklyRewards: number;
}> {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get all active stakings for this user
    const stakings = await Staking.find({ userId, active: true });
    
    let totalStaked = 0;
    let totalRewards = 0;
    let estimatedWeeklyRewards = 0;
    
    const activePositions = stakings.map(staking => {
      // Calculate pending rewards
      const now = new Date();
      const lastRewardDate = staking.lastRewardDate;
      const daysSinceLastReward = (now.getTime() - lastRewardDate.getTime()) / (1000 * 60 * 60 * 24);
      
      let pendingReward = 0;
      
      if (daysSinceLastReward > 0) {
        // Convert weekly rate to daily rate
        const dailyRate = staking.rewardRate / 7;
        pendingReward = staking.amount * (dailyRate / 100) * daysSinceLastReward;
      }
      
      // Calculate weekly reward
      const weeklyReward = staking.amount * (staking.rewardRate / 100);
      
      // Add to totals
      totalStaked += staking.amount;
      totalRewards += staking.totalRewards + pendingReward;
      estimatedWeeklyRewards += weeklyReward;
      
      return {
        id: staking._id,
        currency: staking.cryptoCurrency,
        amount: staking.amount,
        rewardRate: staking.rewardRate,
        startDate: staking.startDate,
        accumulatedRewards: staking.totalRewards,
        pendingRewards: pendingReward,
        totalRewards: staking.totalRewards + pendingReward,
        weeklyReward
      };
    });
    
    return {
      activePositions,
      totalStaked,
      totalRewards,
      estimatedWeeklyRewards
    };
  } catch (error) {
    console.error('Error getting user staking positions:', error);
    throw error;
  }
}