import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/hooks/use-websocket';

/**
 * WebSocketManager component
 * 
 * This component manages the WebSocket connection based on authentication state.
 * It will automatically connect to the WebSocket when the user is logged in,
 * and disconnect when the user logs out.
 */
export function WebSocketManager() {
  const { user } = useAuth();
  const { connect, disconnect, authenticate, connected } = useWebSocket();

  // Connect to WebSocket when user logs in, disconnect when user logs out
  useEffect(() => {
    if (user) {
      // User is logged in, connect to WebSocket
      connect();
      
      // If already connected, authenticate the connection
      if (connected) {
        authenticate(user.id.toString());
      }
    } else {
      // User is logged out, disconnect from WebSocket
      disconnect();
    }
  }, [user, connect, disconnect, authenticate, connected]);

  // When connection status changes and user is logged in, authenticate
  useEffect(() => {
    if (connected && user) {
      authenticate(user.id.toString());
    }
  }, [connected, user, authenticate]);

  // This component doesn't render anything
  return null;
}