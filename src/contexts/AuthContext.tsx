import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getUserInfo, login as keycloakLogin, getAccessToken, clearTokens, signOutFromGoogle } from '../service/KeycloakService';
import { User } from '../types/user';
import { AppState, AppStateStatus } from 'react-native';

interface AuthContextType {
  isAuthenticated: () => Promise<boolean>;
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void; // For global error handling
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: async () => false,
  user: null,
  loading: true,
  checkAuth: async () => {},
  login: async () => {},
  logout: async () => {},
  forceLogout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const ACCESS_TOKEN_KEY = 'access_token';

  const checkAuth = useCallback(async () => {
    try {
      // First check if token exists and is valid
      const token = await getAccessToken();
      
      if (!token) {
        setUser(null);
        return;
      }
      
      // If token exists, get user info
      const userInfo = await getUserInfo();
      if (userInfo && userInfo.id) {
        setUser(userInfo as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = async () => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return Boolean(token);
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      await keycloakLogin(username, password);
      await checkAuth(); // Update user info after successful login
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Sign out from Google first
      await signOutFromGoogle();
      
      // Clear stored tokens
      await clearTokens();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Force logout without async operations (for global error handling)
  const forceLogout = useCallback(() => {
    setUser(null);
    clearTokens().catch(err => console.error('Error clearing tokens:', err));
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Re-check auth when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkAuth();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        checkAuth,
        login,
        logout,
        forceLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};