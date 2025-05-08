import { 
  createContext, 
  ReactNode, 
  useContext, 
  useEffect, 
  useState 
} from "react";
import wsConnection, { WebSocketStatus } from "@/lib/websocket";
import { useAuth } from "./use-auth";

// Define the context type
type WebSocketContextType = {
  status: WebSocketStatus;
  portfolioData: any | null;
  stakingData: any | null;
  marketRates: any | null;
  transactions: any[] | null;
  notifications: any[] | null;
  clearNotifications: () => void;
};

// Create the context
const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Context provider component
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<WebSocketStatus>(wsConnection.getStatus());
  const [portfolioData, setPortfolioData] = useState<any | null>(null);
  const [stakingData, setStakingData] = useState<any | null>(null);
  const [marketRates, setMarketRates] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    let messageHandler: ((event: MessageEvent) => void) | null = null;
    
    if (user) {
      console.log("Connecting to WebSocket with userId:", user.id);
      
      // Setup message handler
      messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'userData':
              // Update portfolio data
              if (data.portfolio) {
                setPortfolioData(data.portfolio);
              }
              
              // Update staking data
              if (data.stakingPositions) {
                setStakingData(data.stakingPositions);
              }
              
              // Update recent transactions
              if (data.recentTransactions) {
                setTransactions(data.recentTransactions);
              }
              break;
              
            case 'exchangeRates':
              // Update market rates
              if (data.rates) {
                setMarketRates(data.rates);
              }
              break;
              
            case 'notification':
              // Add new notification
              if (data.notification) {
                setNotifications(prev => [data.notification, ...prev].slice(0, 10));
              }
              break;
              
            default:
              console.log("Unknown WebSocket message type:", data.type);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
      
      // Register message handler
      const unsubscribe = wsConnection.onMessage(messageHandler);
      
      // Connect with user ID
      wsConnection.connect(user.id.toString());
      
      // Register status handler
      const statusUnsubscribe = wsConnection.onStatus(setStatus);
      
      // Cleanup on unmount or when user changes
      return () => {
        unsubscribe();
        statusUnsubscribe();
      };
    }
    
    return () => {};
  }, [user]);

  // Function to clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <WebSocketContext.Provider
      value={{
        status,
        portfolioData,
        stakingData,
        marketRates,
        transactions,
        notifications,
        clearNotifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use the WebSocket context
export function useWebSocketData() {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error("useWebSocketData must be used within a WebSocketProvider");
  }
  
  return context;
}