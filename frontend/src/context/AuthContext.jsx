/**
 * WhatsAssist - Enterprise Auth Context
 * Synchronizes merchant session with backend on mount.
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [merchant, setMerchant] = useState(() => {
    try {
      const stored = localStorage.getItem('wa_merchant');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync latest merchant details (like ZepTech name) from API
  useEffect(() => {
    const token = localStorage.getItem('wa_token');
    if (token) {
      authAPI.getMe()
        .then((res) => {
          if (res.data.success && res.data.merchant) {
            setMerchant(res.data.merchant);
            localStorage.setItem('wa_merchant', JSON.stringify(res.data.merchant));
          }
        })
        .catch((err) => {
          console.warn('Session refresh fallback', err?.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, merchantData) => {
    localStorage.setItem('wa_token', token);
    localStorage.setItem('wa_merchant', JSON.stringify(merchantData));
    setMerchant(merchantData);
  };

  const logout = () => {
    localStorage.removeItem('wa_token');
    localStorage.removeItem('wa_merchant');
    setMerchant(null);
  };

  return (
    <AuthContext.Provider value={{ merchant, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
