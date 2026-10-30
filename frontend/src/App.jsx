/**
 * WhatsAssist - Enterprise Application Router
 * Configures role-based protected paths, public routes, and Theme Provider.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import LiveChats from './pages/LiveChats';
import KnowledgeBase from './pages/KnowledgeBase';
import Leads from './pages/Leads';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { merchant, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-medium">
        Loading WhatsAssist Session...
      </div>
    );
  }
  return merchant ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { merchant, loading } = useAuth();
  if (loading) return null;
  return merchant ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/chats" element={<ProtectedRoute><LiveChats /></ProtectedRoute>} />
            <Route path="/knowledge" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
