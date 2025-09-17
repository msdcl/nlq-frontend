/**
 * App - Main application component
 * Sets up routing, providers, and main layout
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import useNLQStore, { useNLQActions } from './store/nlqStore';
import { nlqAPI } from './services/api';
import SimpleNLQInterface from './components/SimpleNLQInterface';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { setServiceHealth, setSchema } = useNLQActions();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check service health
        const health = await nlqAPI.getHealth();
        setServiceHealth(health);

        // Load schema if healthy
        if (health.healthy) {
          const schema = await nlqAPI.getSchema();
          if (schema.success) {
            setSchema(schema.schema);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setServiceHealth({ healthy: false, error: error.message });
      }
    };

    initializeApp();
  }, [setServiceHealth, setSchema]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
          {/* Header */}
          <Header />
          
          {/* Main Content */}
          <div className="pt-4">
            <Routes>
              {/* Default route - redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard route */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Query Assistant route */}
              <Route path="/askquestions" element={<SimpleNLQInterface />} />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                color: '#fff',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
