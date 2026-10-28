import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  loginAs: (user: User) => void;
  canUpload: boolean;
  canVerify: boolean;
  canReviewFraud: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canExportReports: boolean;
  demoUsers: User[];
}

const DEMO_USERS: Record<UserRole, User> = {
  SUPER_ADMIN: {
    id: 'USR-001',
    name: 'Dr. T. G. Sitharam',
    email: 'chairman@aicte-india.org',
    role: 'SUPER_ADMIN',
    designation: 'AICTE Council Chairman & Super Administrator'
  },
  AICTE_OFFICER: {
    id: 'USR-002',
    name: 'Rajiv Kumar',
    email: 'rajiv.kumar@aicte.gov.in',
    role: 'AICTE_OFFICER',
    designation: 'Director (Approval & Security Deposits)'
  },
  COLLEGE_ADMIN: {
    id: 'USR-003',
    name: 'Dr. Sneha Kulkarni',
    email: 'principal@rvce.edu.in',
    role: 'COLLEGE_ADMIN',
    designation: 'Registrar & Authorized Finance Representative',
    institutionId: 'INST-001',
    institutionName: 'R.V. College of Engineering, Bengaluru'
  },
  AUDITOR: {
    id: 'USR-004',
    name: 'Vinod Sharma',
    email: 'v.sharma@cag.gov.in',
    role: 'AUDITOR',
    designation: 'Principal Financial Auditor (Empanelled Reviewer)'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('smartfdr_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEMO_USERS.AICTE_OFFICER; // Default to AICTE Officer for hackathon demo
  });

  useEffect(() => {
    localStorage.setItem('smartfdr_user', JSON.stringify(user));
  }, [user]);

  const switchRole = (role: UserRole) => {
    setUser(DEMO_USERS[role]);
  };

  const loginAs = (u: User) => {
    setUser(u);
  };

  const role = user.role;

  // Permissions based on Master Prompt Section 4
  const canUpload = role === 'SUPER_ADMIN' || role === 'COLLEGE_ADMIN';
  const canVerify = role === 'SUPER_ADMIN' || role === 'AICTE_OFFICER';
  const canReviewFraud = role === 'SUPER_ADMIN' || role === 'AICTE_OFFICER' || role === 'AUDITOR';
  const canManageSettings = role === 'SUPER_ADMIN';
  const canManageUsers = role === 'SUPER_ADMIN';
  const canExportReports = true; // All authenticated roles can export permitted reports

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        switchRole,
        loginAs,
        canUpload,
        canVerify,
        canReviewFraud,
        canManageSettings,
        canManageUsers,
        canExportReports,
        demoUsers: Object.values(DEMO_USERS)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

