import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { getUserPortfolio } from './tradingService';
import { getUserStakingPositions } from './stakingService';
import { getExchangeRates } from './blockchainService';
import { Transaction } from '../models/Transaction';

// Store active WebSocket connections with their associated user IDs
const clients = new Map<string, WebSocket>();

// Initialize WebSocket server
export function initializeWebSocketServer(server: Server) {
  // Create WebSocket server on a distinct path (not to conflict with Vite HMR)
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  console.log('WebSocket server initialized on path /ws');
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    let userId: string | null = null;
    
    // Handle messages from client
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Authentication message to associate WebSocket with user
        if (data.type === 'auth' && data.userId) {
          userId = data.userId;
          if (userId) {
            clients.set(userId, ws);
            console.log(`WebSocket authenticated for user ${userId}`);
            
            // Send initial data to client
            sendUserData(userId);
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        console.log(`WebSocket connection closed for user ${userId}`);
      } else {
        console.log('Unauthenticated WebSocket connection closed');
      }
    });
  });
  
  // Start periodic update broadcasts
  startPeriodicUpdates();
  
  return wss;
}

// Send data to a specific user
async function sendUserData(userId: string) {
  const ws = clients.get(userId);
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }
  
  try {
    // Get user portfolio data
    const portfolio = await getUserPortfolio(userId);
    
    // Get user staking positions
    const stakingPositions = await getUserStakingPositions(userId);
    
    // Get current exchange rates
    const exchangeRates = await getExchangeRates();
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Send data to client
    ws.send(JSON.stringify({
      type: 'userData',
      portfolio,
      stakingPositions,
      exchangeRates,
      recentTransactions
    }));
  } catch (error) {
    console.error(`Error sending data to user ${userId}:`, error);
  }
}

// Broadcast exchange rates to all connected clients
async function broadcastExchangeRates() {
  try {
    const rates = await getExchangeRates();
    
    const message = JSON.stringify({
      type: 'exchangeRates',
      rates
    });
    
    // Send to all connected clients
    clients.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  } catch (error) {
    console.error('Error broadcasting exchange rates:', error);
  }
}

// Start periodic updates
function startPeriodicUpdates() {
  // Broadcast exchange rates every 30 seconds
  setInterval(broadcastExchangeRates, 30000);
  
  // Update user data every 60 seconds
  setInterval(() => {
    clients.forEach((_, userId) => {
      sendUserData(userId);
    });
  }, 60000);
}

// Send notification to a specific user
export function sendNotificationToUser(userId: string, notification: {
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  const ws = clients.get(userId);
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }
  
  ws.send(JSON.stringify({
    type: 'notification',
    notification
  }));
}

// Broadcast message to all users
export function broadcastToAllUsers(message: any) {
  const messageStr = JSON.stringify(message);
  
  clients.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}