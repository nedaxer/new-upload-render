// Fix for Vite WebSocket connection issues in development
if (import.meta.hot) {
  // Suppress WebSocket connection errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && 
        (message.includes('WebSocket closed without opened') || 
         message.includes('failed to connect to websocket'))) {
      // Silently ignore WebSocket errors
      return;
    }
    originalError.apply(console, args);
  };

  // Handle unhandled promise rejections related to WebSocket
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('WebSocket')) {
      event.preventDefault();
    }
  });
}