import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'fallback-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem('auth_token');
};