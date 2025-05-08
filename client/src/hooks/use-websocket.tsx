import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
  initializeWebSocket, 
  authenticateWebSocket, 
  closeWebSocket,
  addWebSocketListener,
  sendWebSocketMessage,
  getWebSocketStatus
} from '@/lib/websocket';

// Define WebSocket context types
interface WebSocketContextType {
  connected: boolean;
  authenticated: boolean;
  connect: (userId?: string) => void;
  disconnect: () => void;
  authenticate: (userId: string) => void;
  send: (message: any) => boolean;
  addListener: (type: string, callback: (data: any) => void) => () => void;
}

// Create WebSocket context
const WebSocketContext = createContext<WebSocketContextType | null>(null);

// WebSocket Provider component
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState({
    connected: false,
    authenticated: false
  });

  // Update status when WebSocket status changes
  const updateStatus = useCallback(() => {
    setStatus(getWebSocketStatus());
  }, []);

  // Connect to WebSocket
  const connect = useCallback((userId?: string) => {
    initializeWebSocket(userId);
    updateStatus();
  }, [updateStatus]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    closeWebSocket();
    updateStatus();
  }, [updateStatus]);

  // Authenticate WebSocket connection
  const authenticate = useCallback((userId: string) => {
    authenticateWebSocket(userId);
    updateStatus();
  }, [updateStatus]);

  // Send message to WebSocket server
  const send = useCallback((message: any) => {
    const result = sendWebSocketMessage(message);
    updateStatus();
    return result;
  }, [updateStatus]);

  // Set up WebSocket status listeners
  useEffect(() => {
    // Add listeners for connection status
    const connectedRemover = addWebSocketListener('connected', () => {
      updateStatus();
    });

    const disconnectedRemover = addWebSocketListener('disconnected', () => {
      updateStatus();
    });

    // Clean up listeners
    return () => {
      connectedRemover();
      disconnectedRemover();
    };
  }, [updateStatus]);

  // Create context value
  const contextValue: WebSocketContextType = {
    connected: status.connected,
    authenticated: status.authenticated,
    connect,
    disconnect,
    authenticate,
    send,
    addListener: addWebSocketListener
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook for using WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  
  return context;
}

// Hook for using WebSocket connection
export function useWebSocketConnection(userId?: string, autoConnect = true) {
  const { connect, disconnect, authenticate, connected, authenticated } = useWebSocket();

  // Connect to WebSocket on mount
  useEffect(() => {
    if (autoConnect) {
      connect(userId);

      // If userId is provided, authenticate connection
      if (userId && connected && !authenticated) {
        authenticate(userId);
      }
    }

    // Disconnect from WebSocket on unmount
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, authenticate, userId, connected, authenticated]);

  return { connected, authenticated };
}

// Hook for listening to WebSocket messages
export function useWebSocketMessage<T = any>(type: string, callback: (data: T) => void) {
  const { addListener } = useWebSocket();

  // Add listener for message type
  useEffect(() => {
    const removeListener = addListener(type, callback);

    // Clean up listener when component unmounts
    return () => {
      removeListener();
    };
  }, [addListener, type, callback]);
}

// Hook for sending WebSocket messages
export function useWebSocketSender() {
  const { send, connected } = useWebSocket();

  // Send message to WebSocket server
  const sendMessage = useCallback((type: string, data: any) => {
    if (!connected) {
      console.warn('Cannot send WebSocket message: not connected');
      return false;
    }

    return send({
      type,
      ...data
    });
  }, [send, connected]);

  return { sendMessage, connected };
}