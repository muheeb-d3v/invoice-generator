import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL || '/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Verify token by making a request to a protected endpoint
          const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            // Token is valid, decode user info from token
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ id: payload.userId, email: payload.email });
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in with:', { email, password: '***' });

      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Sign in response status:', response.status);
      // Try to parse JSON safely
      let data: any = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }
      console.log('Sign in response data:', data);

      if (!response.ok) {
        const message = data?.error || `Sign in failed (${response.status})`;
        return { error: { message } };
      }

      localStorage.setItem('auth_token', data.token);
      setUser(data.user);

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      const message = error?.message?.includes('Failed to fetch')
        ? 'Unable to reach server. Is it running?'
        : 'An unexpected error occurred during sign in';
      return { error: { message } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting sign up with:', { email, password: '***' });

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Sign up response status:', response.status);
      // Try to parse JSON safely
      let data: any = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }
      console.log('Sign up response data:', data);

      if (!response.ok) {
        const message = data?.error || `Sign up failed (${response.status})`;
        return { error: { message } };
      }

      localStorage.setItem('auth_token', data.token);
      setUser(data.user);

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      const message = error?.message?.includes('Failed to fetch')
        ? 'Unable to reach server. Is it running?'
        : 'An unexpected error occurred during sign up';
      return { error: { message } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};