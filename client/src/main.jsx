import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// رقم النسخة لضمان تحميل التحديثات الجديدة (V2.1.0 - Pie Chart Update)
console.log('💎 Geybi v2.1.0 - Dashboard Analytics Loaded');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
