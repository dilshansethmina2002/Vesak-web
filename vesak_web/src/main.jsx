import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { AlertProvider } from './context/AlertContext.jsx'
import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AlertProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </AlertProvider>
    </AuthProvider>
  </React.StrictMode>,
) 