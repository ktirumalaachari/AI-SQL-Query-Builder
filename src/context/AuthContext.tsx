import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserSettings, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (token: string, user: User, settings: UserSettings) => void;
  register: (token: string, user: User, settings: UserSettings) => void;
  logout: () => void;
  updateProfile: (updatedUser: User) => void;
  updateSettings: (newSettings: UserSettings) => void;
  refreshProfile: () => Promise<void>;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  aiModel: 'gemini-3.6-flash',
  defaultPageSize: 10,
  exportPreference: 'csv'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (currentToken: string) => {
    try {
      const res = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.settings) {
          setSettings(data.settings);
        }
      } else {
        // Token invalid or expired
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to restore session profile:", e);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User, newSettings: UserSettings) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
    if (newSettings) setSettings(newSettings);
  };

  const register = (newToken: string, newUser: User, newSettings: UserSettings) => {
    login(newToken, newUser, newSettings);
  };

  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        settings,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updateSettings,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
