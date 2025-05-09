import { Request, Response, Router } from "express";
import { z } from "zod";
import { tradingService } from "../services/trading.service";
import { getLatestPrice } from "../services/price.service";
import { db } from "../db";
import { currencies } from "@shared/schema";
import { eq } from "drizzle-orm";

const tradingRouter = Router();

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

// Get all available currencies
tradingRouter.get("/currencies", async (req, res) => {
  try {
    const allCurrencies = await db
      .select()
      .from(currencies)
      .where(eq(currencies.isActive, true));
    
    return res.status(200).json({
      success: true,
      data: allCurrencies
    });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load currencies"
    });
  }
});

// Get current market prices
tradingRouter.get("/prices", async (req, res) => {
  try {
    const allCurrencies = await db
      .select()
      .from(currencies)
      .where(eq(currencies.isActive, true));
    
    const prices = [];
    
    for (const currency of allCurrencies) {
      if (currency.symbol === 'USD') {
        prices.push({
          currency: currency,
          price: 1,
          timestamp: new Date()
        });
        continue;
      }
      
      try {
        const price = await getLatestPrice(currency.symbol);
        prices.push({
          currency: currency,
          price,
          timestamp: new Date()
        });
      } catch (error) {
        console.error(`Error getting price for ${currency.symbol}:`, error);
      }
    }
    
    return res.status(200).json({
      success: true,
      data: prices
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load prices"
    });
  }
});

// Buy crypto with USD
tradingRouter.post("/buy", requireAuth, async (req, res) => {
  try {
    const buySchema = z.object({
      fromCurrencyId: z.number(),
      toCurrencyId: z.number(),
      amount: z.number().positive()
    });
    
    const result = buySchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request format",
        errors: result.error.format()
      });
    }
    
    const { fromCurrencyId, toCurrencyId, amount } = result.data;
    const userId = req.session.userId;
    
    // Verify that the user has enough balance
    const userBalance = await tradingService.getUserBalance(userId, fromCurrencyId);
    
    if (!userBalance || userBalance.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });
    }
    
    // Execute the trade
    const transaction = await tradingService.buyCrypto(
      userId,
      fromCurrencyId,
      toCurrencyId,
      amount
    );
    
    return res.status(200).json({
      success: true,
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error("Error buying crypto:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to execute buy order"
    });
  }
});

// Sell crypto for USD
tradingRouter.post("/sell", requireAuth, async (req, res) => {
  try {
    const sellSchema = z.object({
      fromCurrencyId: z.number(),
      toCurrencyId: z.number(),
      amount: z.number().positive()
    });
    
    const result = sellSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request format",
        errors: result.error.format()
      });
    }
    
    const { fromCurrencyId, toCurrencyId, amount } = result.data;
    const userId = req.session.userId;
    
    // Verify that the user has enough crypto
    const userBalance = await tradingService.getUserBalance(userId, fromCurrencyId);
    
    if (!userBalance || userBalance.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient crypto balance"
      });
    }
    
    // Execute the trade
    const transaction = await tradingService.sellCrypto(
      userId,
      fromCurrencyId,
      toCurrencyId,
      amount
    );
    
    return res.status(200).json({
      success: true,
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error("Error selling crypto:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to execute sell order"
    });
  }
});

// Get price chart data (historical prices)
tradingRouter.get("/chart/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // In a real application, this would fetch historical price data
    // For now, we'll use mock data to demonstrate the API structure
    
    // Find the currency ID
    const currency = await db
      .select()
      .from(currencies)
      .where(eq(currencies.symbol, symbol.toUpperCase()))
      .limit(1);
    
    if (currency.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Currency not found"
      });
    }
    
    // Get current price to build a realistic chart
    const currentPrice = await getLatestPrice(symbol);
    
    // Generate price data
    // In a real app, this would come from a database or external API
    const now = new Date();
    const timePoints = [];
    
    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - i);
      
      // Calculate a mock price based on current price
      // This is just for demonstration
      const randomFactor = 0.9 + Math.random() * 0.2; // Random value between 0.9 and 1.1
      const price = currentPrice * randomFactor;
      
      timePoints.push({
        timestamp: timestamp.toISOString(),
        price
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        currency: currency[0],
        timePoints
      }
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load chart data"
    });
  }
});

export default tradingRouter;