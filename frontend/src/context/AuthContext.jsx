import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('carbon_auth_token'));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (token) {
      fetchUserMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserMe = async () => {
    try {
      setLoading(true);
      const data = await api.getMe();
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch current user details:', error.message);
      logoutUser();
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    try {
      setLoading(true);
      const data = await api.login({ email, password });
      setToken(data.token);
      showToast(`Welcome back, ${data.user.name}!`);
      return true;
    } catch (error) {
      showToast(error.message || 'Login failed. Please check credentials.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (registrationDetails) => {
    try {
      setLoading(true);
      const data = await api.register(registrationDetails);
      setToken(data.token);
      showToast(`Welcome to EcoCarbon, ${data.user.name}!`);
      return true;
    } catch (error) {
      showToast(error.message || 'Registration failed. Try again.', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    api.logout();
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.');
  };

  const refreshProfileState = (updatedProfile) => {
    if (user) {
      setUser((prev) => ({
        ...prev,
        profile: updatedProfile,
      }));
    }
  };

  const refreshUserGamification = (gamification) => {
    if (user && gamification) {
      setUser((prev) => {
        const newProfile = prev.profile
          ? {
              ...prev.profile,
              xpPoints: gamification.xpPoints,
              streakDays: gamification.streakDays,
              level: gamification.level,
            }
          : null;
        return {
          ...prev,
          profile: newProfile,
        };
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        setLoading,
        toast,
        showToast,
        loginUser,
        registerUser,
        logoutUser,
        fetchUserMe,
        refreshProfileState,
        refreshUserGamification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
