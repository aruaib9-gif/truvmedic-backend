import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, onUnauthorized, tokenStore } from '@/api/client';

const AuthContext = createContext(null);

/** Roles that may enter the /admin portal. */
export const STAFF_ROLES = ['admin', 'recruiter', 'manager', 'viewer'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  /** Loads the current session. Anonymous visitors simply get `user === null`. */
  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setAuthError(null);
    } catch (error) {
      setUser(null);
      // A failure here is a server/network problem — not "please log in".
      setAuthError({ type: 'unknown', message: error.message || 'Could not verify your session' });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  // A 401 from any request means the token expired or was revoked.
  useEffect(() => onUnauthorized(() => {
    setUser(null);
    setAuthChecked(true);
    setIsLoadingAuth(false);
  }), []);

  const login = useCallback(async (email, password) => {
    const signedIn = await api.auth.login(email, password);
    setUser(signedIn);
    setAuthError(null);
    setAuthChecked(true);
    return signedIn;
  }, []);

  const register = useCallback(async (details) => {
    const created = await api.auth.register(details);
    setUser(created);
    setAuthError(null);
    setAuthChecked(true);
    return created;
  }, []);

  const logout = useCallback((redirectTo = '/') => {
    tokenStore.clear();
    setUser(null);
    setAuthChecked(true);
    if (redirectTo) window.location.href = redirectTo;
  }, []);

  const navigateToLogin = useCallback((returnUrl) => {
    api.auth.redirectToLogin(returnUrl);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isStaff: Boolean(user) && STAFF_ROLES.includes(user.role),
    isAdmin: user?.role === 'admin',
    isLoadingAuth,
    authChecked,
    authError,
    login,
    register,
    logout,
    navigateToLogin,
    checkUserAuth,
    setUser,
  }), [user, isLoadingAuth, authChecked, authError, login, register, logout, navigateToLogin, checkUserAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
