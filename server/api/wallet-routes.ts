import { Request, Response, Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { currencies } from "@shared/schema";
import { eq } from "drizzle-orm";
import { depositService } from "../services/deposit.service";
import { tradingService } from "../services/trading.service";
import { getLatestPrice } from "../services/price.service";
import QRCode from "qrcode";

const walletRouter = Router();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  next();
};

// Get all wallet addresses for user
walletRouter.get("/addresses", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Generate wallets if they don't exist
    const wallets = await depositService.generateUserWallets(userId);
    
    // Prepare wallet data with QR codes
    const walletsWithQR = await Promise.all(
      wallets.map(async (wallet) => {
        try {
          const qrCode = await QRCode.toDataURL(wallet.address);
          
          // Get currency info
          const currency = await db
            .select()
            .from(currencies)
            .where(eq(currencies.id, wallet.currencyId))
            .limit(1);
          
          return {
            ...wallet,
            qrCode,
            currency: currency[0],
          };
        } catch (error) {
          console.error('Error generating QR code:', error);
          return {
            ...wallet,
            qrCode: null,
          };
        }
      })
    );
    
    return res.status(200).json({
      success: true,
      data: walletsWithQR,
    });
  } catch (error) {
    console.error("Error fetching wallet addresses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load wallet addresses",
    });
  }
});

// Check for new deposits
walletRouter.post("/check-deposits", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const result = await depositService.checkForNewDeposits(userId);
    
    if (result.success) {
      if (result.depositsFound > 0) {
        // Get updated balances
        const balances = await tradingService.getAllUserBalances(userId);
        
        return res.status(200).json({
          success: true,
          message: `${result.depositsFound} new deposits found and credited to your account`,
          data: {
            depositsFound: result.depositsFound,
            balances,
          },
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "No new deposits found",
          data: {
            depositsFound: 0,
          },
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        message: "Error checking for deposits",
      });
    }
  } catch (error) {
    console.error("Error checking for deposits:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check for deposits",
    });
  }
});

export default walletRouter;