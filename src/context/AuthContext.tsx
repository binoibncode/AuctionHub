import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => { success: boolean; message: string };
  register: (data: {
    name: string; email: string; password: string; role: Role;
    phone?: string; city?: string; photoUrl?: string; purse?: number; isIcon?: boolean;
  }) => { success: boolean; message: string };
  updateProfile: (updated: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('mock_jwt_token');
    const storedUserId = localStorage.getItem('current_user_id');
    
    if (token && storedUserId) {
      const users = db.getUsers();
      const foundUser = users.find(u => u.id === storedUserId);
      if (foundUser) {
        setUser(foundUser);
      } else {
        localStorage.removeItem('mock_jwt_token');
        localStorage.removeItem('current_user_id');
      }
    }
  }, []);

  const login = (email: string, password?: string): { success: boolean; message: string } => {
    const users = db.getUsers();
    const foundUser = users.find(u => u.email === email);
    if (!foundUser) {
      return { success: false, message: 'User not found. Please check your email or register.' };
    }
    // If password provided, validate it. Demo accounts skip password.
    if (password && foundUser.password && foundUser.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }
    setUser(foundUser);
    localStorage.setItem('mock_jwt_token', `eyMock.${foundUser.id}.JWT`);
    localStorage.setItem('current_user_id', foundUser.id);
    return { success: true, message: 'Login successful!' };
  };

  const register = (data: {
    name: string; email: string; password: string; role: Role;
    phone?: string; city?: string; photoUrl?: string; purse?: number; isIcon?: boolean;
  }): { success: boolean; message: string } => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      city: data.city,
      photoUrl: data.photoUrl,
      role: data.role,
      isIcon: data.isIcon,
      ...((data.role === 'Bidder' || (data.role === 'Player' && data.isIcon)) && data.purse ? { purse: data.purse } : {}),
    };

    const result = db.addUser(newUser);
    if (result.success) {
      setUser(newUser);
      localStorage.setItem('mock_jwt_token', `eyMock.${newUser.id}.JWT`);
      localStorage.setItem('current_user_id', newUser.id);
    }
    return result;
  };

  const updateProfile = (updated: User) => {
    db.updateUser(updated);
    setUser(updated);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_jwt_token');
    localStorage.removeItem('current_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout }}>
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
