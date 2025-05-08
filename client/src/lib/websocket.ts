// WebSocket client utility for connecting to the backend WebSocket server
import { useEffect, useState } from "react";

// Correctly determine the WebSocket URL based on the current protocol and host
export function getWebSocketUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}/ws`;
}

// WebSocket connection states
export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

// Event handler types
export type MessageHandler = (event: MessageEvent) => void;
export type StatusHandler = (status: WebSocketStatus) => void;

// WebSocket connection class
class WebSocketConnection {
  private socket: WebSocket | null = null;
  private url: string;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private status: WebSocketStatus = "disconnected";
  private userId: string | null = null;

  constructor(url: string) {
    this.url = url;
  }

  // Connect to the WebSocket server
  connect(userId?: string): void {
    if (userId) {
      this.userId = userId;
    }

    // Don't try to connect if already connecting or connected
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.updateStatus("connecting");
    
    try {
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.scheduleReconnect();
    }
  }

  // Disconnect from the WebSocket server
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
      
      this.socket = null;
    }

    this.updateStatus("disconnected");
  }

  // Send a message to the WebSocket server
  send(data: any): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    }
    return false;
  }

  // Register a message handler
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  // Register a status handler
  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    // Immediately notify of current status
    handler(this.status);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  // Get current connection status
  getStatus(): WebSocketStatus {
    return this.status;
  }

  // Private methods for handling WebSocket events
  private handleOpen(event: Event): void {
    console.log("WebSocket connection established");
    this.updateStatus("connected");
    
    // If we have a userId, send authentication message
    if (this.userId) {
      this.send({
        type: "auth",
        userId: this.userId
      });
    }
  }

  private handleMessage(event: MessageEvent): void {
    // Dispatch message to all registered handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in WebSocket message handler:", error);
      }
    });
  }

  private handleClose(event: CloseEvent): void {
    console.log("WebSocket connection closed:", event.code, event.reason);
    this.scheduleReconnect();
  }

  private handleError(event: Event): void {
    console.error("WebSocket error:", event);
    // The close event will be called after the error event
  }

  private scheduleReconnect(): void {
    if (!this.reconnectTimer) {
      this.updateStatus("reconnecting");
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, 3000); // Reconnect after 3 seconds
    }
  }

  private updateStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      // Notify all status handlers
      this.statusHandlers.forEach(handler => {
        try {
          handler(status);
        } catch (error) {
          console.error("Error in WebSocket status handler:", error);
        }
      });
    }
  }
}

// Global WebSocket connection instance
const wsConnection = new WebSocketConnection(getWebSocketUrl());

// Hook for interacting with the WebSocket connection
export function useWebSocket(userId?: string) {
  const [status, setStatus] = useState<WebSocketStatus>(wsConnection.getStatus());

  useEffect(() => {
    // Connect if not already connected
    wsConnection.connect(userId);

    // Register status handler
    const unsubscribe = wsConnection.onStatus(setStatus);

    // Cleanup on unmount
    return () => {
      unsubscribe();
      // Don't disconnect here - maintain the connection for other components
    };
  }, [userId]);

  // Register a message handler
  const onMessage = (handler: MessageHandler) => {
    useEffect(() => {
      return wsConnection.onMessage(handler);
    }, [handler]);
  };

  // Send a message
  const sendMessage = (data: any) => {
    return wsConnection.send(data);
  };

  return {
    status,
    sendMessage,
    onMessage,
  };
}

export default wsConnection;