import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isLoggedIn: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (data: Partial<User>) => void;
}

const DEMO_USERS: Record<UserRole, User> = {
  client: {
    id: 'cl-demo',
    name: 'سید مسعود هاشمی',
    email: 'client@kabultech.af',
    role: 'client',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    isSuspended: false,
    createdAt: '2023-04-10',
    phone: '+93 79 123 4567',
    location: { city: 'کابل', country: 'افغانستان' },
  },
  freelancer: {
    id: 'fl-1',
    name: 'احمد ولی فایز',
    email: 'ahmad.faiz@example.af',
    role: 'freelancer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    isSuspended: false,
    createdAt: '2023-01-15',
    phone: '+93 70 987 6543',
    location: { city: 'کابل', country: 'افغانستان' },
  },
  admin: {
    id: 'adm-1',
    name: 'مدیریت ارشد افغان فریلنس',
    email: 'admin@afghanfreelance.org',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    isSuspended: false,
    createdAt: '2022-10-01',
    location: { city: 'کابل', country: 'افغانستان' },
  },
  super_admin: {
    id: 'sup-1',
    name: 'سوپر ادمین سیستم',
    email: 'superadmin@afghanfreelance.org',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    isSuspended: false,
    createdAt: '2022-09-01',
    location: { city: 'کابل', country: 'افغانستان' },
  },
  moderator: {
    id: 'mod-1',
    name: 'ناظر محتوا و سفارشات',
    email: 'moderator@afghanfreelance.org',
    role: 'moderator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    isSuspended: false,
    createdAt: '2023-02-15',
    location: { city: 'هرات', country: 'افغانستان' },
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('af_user_role') as UserRole;
    return DEMO_USERS[saved] || DEMO_USERS.client;
  });

  const role = currentUser?.role || 'client';
  const isLoggedIn = currentUser !== null;

  const login = (email: string, designatedRole: UserRole = 'client') => {
    const user = { ...DEMO_USERS[designatedRole], email };
    setCurrentUser(user);
    localStorage.setItem('af_user_role', designatedRole);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('af_user_role');
  };

  const switchRole = (newRole: UserRole) => {
    setCurrentUser(DEMO_USERS[newRole]);
    localStorage.setItem('af_user_role', newRole);
  };

  const updateProfile = (data: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isLoggedIn,
        login,
        logout,
        switchRole,
        updateProfile,
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
