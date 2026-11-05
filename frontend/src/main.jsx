// ============================================================
// src/main.jsx
// React application entry point.
// Wraps App inside BrowserRouter and AuthProvider.
// Imports all CSS stylesheets.
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Import plain CSS files
import './styles/global.css';
import './styles/layout.css';
import './styles/pages.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

