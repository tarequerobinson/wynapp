// app/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  loginWithBiometrics: () => void;
  logout: () => void;
  user: { username: string } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();

  const TEST_USERNAME = "user@example.com";
  const TEST_PASSWORD = "password123";

  const login = (username: string, password: string) => {
    if (username === TEST_USERNAME && password === TEST_PASSWORD) {
      console.log('AuthContext: Setting isAuthenticated to true');
      setIsAuthenticated(true);
      setUser({ username });
      return true;
    }
    return false;
  };

  const loginWithBiometrics = () => {
    console.log('AuthContext: Setting isAuthenticated to true via biometrics');
    setIsAuthenticated(true);
    setUser({ username: TEST_USERNAME });
  };

  const logout = () => {
    console.log('AuthContext: Before logout - isAuthenticated:', isAuthenticated, 'user:', user);
    setIsAuthenticated(false);
    setUser(null);
    // Use a small delay to ensure state updates propagate before navigation
    setTimeout(() => {
      console.log('AuthContext: After logout - Setting isAuthenticated to false');
      router.replace('/'); // Navigate to login, replacing the current route
      console.log('AuthContext: Redirected to /');
    }, 100); // 100ms delay to ensure state updates are processed
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, loginWithBiometrics, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};