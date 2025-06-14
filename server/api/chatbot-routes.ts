import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

const router = Router();

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Company knowledge base for Nedaxer
const NEDAXER_KNOWLEDGE = `
Nedaxer is a comprehensive cryptocurrency trading platform offering:

FUNDING & DEPOSITS:
- Deposit cryptocurrencies using generated wallet addresses
- Support for multiple networks: Ethereum Network, BEP-20 (Binance Smart Chain)
- Popular cryptocurrencies: Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB), Tether (USDT), and more
- Real-time balance updates after deposits
- QR codes provided for easy mobile deposits

TRADING FEATURES:
- Spot Trading: Buy and sell cryptocurrencies at current market prices
- Futures Trading: Leveraged trading with position management
- Convert: Exchange between different cryptocurrencies
- Real-time market data and charts
- Order types: Market orders, limit orders

STAKING:
- Earn rewards by staking supported cryptocurrencies
- Various APY rates depending on the cryptocurrency
- Flexible and fixed staking options available

ACCOUNT FEATURES:
- Unified Trading Account and Funding Account management
- Portfolio tracking and performance analytics
- Referral program with commission earnings (20% spot, 25% futures, 15% staking)
- 24/7 customer support via chatbot
- Multi-language support

SECURITY:
- Regulated exchange with robust customer protections
- Email verification required for account activation
- Secure wallet address generation
- Two-factor authentication available

To make a deposit:
1. Go to Assets page
2. Select the cryptocurrency you want to deposit
3. Choose the network (Ethereum or BEP-20)
4. Copy the generated wallet address or scan QR code
5. Send funds from your external wallet
6. Wait for network confirmation

For trading:
1. Ensure you have funds in your account
2. Go to Spot or Futures trading page
3. Select trading pair
4. Choose order type and amount
5. Execute the trade

Need help with anything specific? I'm here to assist with account setup, trading, deposits, or any other platform features.
`;

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  language: string;
  conversationHistory: ChatMessage[];
}

router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, language, conversationHistory }: ChatRequest = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation context
    const contextMessages: any[] = [
      {
        role: 'system',
        content: `You are Nedaxer Bot, a helpful customer support assistant for Nedaxer cryptocurrency trading platform. 

IMPORTANT INSTRUCTIONS:
- Always respond in ${getLanguageName(language)} language
- Be professional, helpful, and concise
- Focus on helping with Nedaxer platform features
- Use the knowledge base provided to answer questions accurately
- If you don't know something specific about Nedaxer, admit it and suggest contacting human support
- Keep responses conversational and friendly
- For complex trading or technical issues, guide users step-by-step

NEDAXER PLATFORM KNOWLEDGE:
${NEDAXER_KNOWLEDGE}

Respond as Nedaxer Bot helping a user with their question about the platform.`
      }
    ];

    // Add conversation history for context (last 5 messages)
    conversationHistory.slice(-5).forEach(msg => {
      contextMessages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Add current message
    contextMessages.push({
      role: 'user',
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: contextMessages,
      max_tokens: 500,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || 
      "I apologize, but I'm having trouble processing your request right now. Please try again or contact our human support team.";

    res.json({ response });

  } catch (error) {
    console.error('Chatbot API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      response: "I'm sorry, I'm experiencing technical difficulties. Please try again later or contact our support team directly."
    });
  }
});

function getLanguageName(code: string): string {
  const languageMap: { [key: string]: string } = {
    'en': 'English',
    'zh-CN': 'Simplified Chinese',
    'zh-TW': 'Traditional Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ru': 'Russian',
    'es': 'Spanish',
    'es-MX': 'Mexican Spanish'
  };
  
  return languageMap[code] || 'English';
}

export default router;