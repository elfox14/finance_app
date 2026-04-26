import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// نظام تتبع الأخطاء البرمجية فور حدوثها
window.onerror = function(message, source, lineno, colno, error) {
  console.error('🔥 Global Crash Detected:', { message, source, lineno, error });
};

console.log('💎 Main.jsx Initializing...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
