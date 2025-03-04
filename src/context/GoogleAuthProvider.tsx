'use client';
import { AuthType, GoogleAuthUser, userInfo } from '@/type/auth/auth-type';
import { CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<userInfo | null>(null);
  const [isLoading] = useState<boolean>(false);

  // let's check user login or not

  useEffect(() => {
    const isUserLogin = localStorage.getItem('userInfo');
    if (isUserLogin) {
      const info = JSON.parse(isUserLogin) as GoogleAuthUser;
      const currentTime = new Date().getTime() / 1000;
      const isSessionExpired = info.exp < currentTime;
      if (isSessionExpired) {
        localStorage.removeItem('userInfo');
        setIsLogin(false);
      } else {
        setIsLogin(true);
        setUserInfo({
          name: info.name,
          email: info.email,
          picture: info.picture,
          isVerified: info.email_verified,
          familyName: info.family_name,
        });
      }
    }
  }, []);

  const handleLoginSuccess = (user: CredentialResponse) => {
    try {
      setIsLogin(true);
      const token = user.credential || null;
      if (token) {
        const decoder = jwtDecode(token) as GoogleAuthUser;
        setUserInfo({
          name: decoder?.name,
          email: decoder?.email,
          picture: decoder?.picture,
          isVerified: decoder?.email_verified,
          familyName: decoder?.family_name,
        });
        localStorage.setItem('userInfo', JSON.stringify(decoder));
      } else throw new Error('Token not found');
    } catch (error) {
      console.log({ error });
    }
  };

  const handleLoginFailure = () => {
    setIsLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setIsLogin(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLogin, isLoading, userInfo, handleLoginSuccess, handleLoginFailure, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
