import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Render the application without StrictMode
const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
