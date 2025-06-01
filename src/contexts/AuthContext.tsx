import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserInfo, login as keycloakLogin, getAccessToken } from '../service/KeycloakService';
import { User } from '../types/user';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  isAuthenticated: () => boolean;
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: () => false,
  user: null,
  loading: true,
  checkAuth: async () => {},
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const userInfo = await getUserInfo();
      if (userInfo && userInfo.id) {
        setUser(userInfo as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {

    const token = SecureStore.getItem("access_token")
    return token !== null;
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      await keycloakLogin(username, password);
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
      // Add your logout logic here (e.g., calling keycloak logout)
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        checkAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 