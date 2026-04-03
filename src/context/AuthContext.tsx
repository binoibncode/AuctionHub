import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: {
    name: string; email: string; password: string; role: Role;
    phone?: string; city?: string; photoUrl?: string; purse?: number; isIcon?: boolean;
  }) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updated: Partial<User>) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = api.getToken();
    if (!token) return;

    api.me()
      .then((res) => {
        if (res.user) setUser(res.user as User);
      })
      .catch(() => {
        api.clearToken();
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.login(email, password);
      if (!res.success || !res.user || !res.token) {
        return { success: false, message: res.message || 'Login failed.' };
      }

      api.setToken(res.token);
      setUser(res.user as User);
      return { success: true, message: 'Login successful!' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Login failed.' };
    }
  };

  const register = async (data: {
    name: string; email: string; password: string; role: Role;
    phone?: string; city?: string; photoUrl?: string; purse?: number; isIcon?: boolean;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.register(data);
      if (!res.success || !res.user || !res.token) {
        return { success: false, message: res.message || 'Registration failed.' };
      }

      api.setToken(res.token);
      setUser(res.user as User);
      return { success: true, message: 'Registration successful!' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Registration failed.' };
    }
  };

  const updateProfile = async (updated: Partial<User>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.updateMe(updated);
      if (!res.success || !res.user) {
        return { success: false, message: res.message || 'Failed to update profile.' };
      }
      setUser(res.user as User);
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to update profile.' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      return { success: true, message: res.message || 'Password changed successfully!' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to change password.' };
    }
  };

  const logout = () => {
    setUser(null);
    api.clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, changePassword, logout }}>
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
