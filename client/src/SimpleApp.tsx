import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Simple test component to verify the app loads
function SimpleHome() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #0033a0 0%, #0099ff 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
        🚀 Nedaxer Trading Platform
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Advanced Cryptocurrency Trading Platform
      </p>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '20px', 
        borderRadius: '12px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2>Platform Features</h2>
        <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
          <li>Spot Trading</li>
          <li>Futures Trading</li>
          <li>Staking & Earn</li>
          <li>Real-time Market Data</li>
          <li>Advanced Charts</li>
          <li>Portfolio Management</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Test Button (Clicked {count} times)
        </button>
      </div>

      <div style={{ marginTop: '30px', fontSize: '14px', opacity: 0.8 }}>
        Server running on port 5000 | React + TypeScript + Vite
      </div>
    </div>
  );
}

export default function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleHome />
    </QueryClientProvider>
  );
}