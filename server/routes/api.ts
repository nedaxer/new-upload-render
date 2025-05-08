import { Router } from 'express';
import { 
  generateWalletAddresses, 
  getWalletAddresses, 
  checkWalletBalances 
} from '../controllers/walletController';
import { 
  buyCryptocurrency, 
  sellCryptocurrency, 
  getCurrentRates, 
  getPortfolio, 
  getTransactionHistory, 
  getBalance 
} from '../controllers/tradingController';
import { 
  stakeUsdToCrypto, 
  unstakePosition, 
  getUserStaking, 
  getStakingRates 
} from '../controllers/stakingController';
import {
  adminLogin,
  requireAdmin,
  searchUsers,
  creditUserBalance,
  getUserActivity,
  updateStakingRates
} from '../controllers/adminController';

const router = Router();

// Wallet routes
router.post('/wallet/generate', generateWalletAddresses);
router.get('/wallet/addresses', getWalletAddresses);
router.get('/wallet/check', checkWalletBalances);

// Trading routes
router.post('/buy', buyCryptocurrency);
router.post('/sell', sellCryptocurrency);
router.get('/rates', getCurrentRates);
router.get('/portfolio', getPortfolio);
router.get('/history', getTransactionHistory);
router.get('/balance', getBalance);

// Staking routes
router.post('/stake', stakeUsdToCrypto);
router.post('/unstake', unstakePosition);
router.get('/staking', getUserStaking);
router.get('/staking/rates', getStakingRates);

// Admin routes
router.post('/admin/login', adminLogin);
router.get('/admin/users', requireAdmin, searchUsers);
router.post('/admin/credit', requireAdmin, creditUserBalance);
router.get('/admin/user/:userId', requireAdmin, getUserActivity);
router.post('/admin/staking/rates', requireAdmin, updateStakingRates);

export default router;