import React, { createContext, useState, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setCart, clearCart as clearCartAction, fetchCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const dispatch = useDispatch();

  // Verify token on app mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axios.get(`${API}/api/users/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = response.data;
          setUser(data);
          setToken(storedToken);
          setIsAdmin(data.role === 'admin');
          // hydrate cart from server via thunk
          try {
            dispatch(fetchCart());
          } catch (err) {
            console.error('Failed to dispatch fetchCart', err);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/api/users/login`, { email, password });
      const data = response.data;
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user || data);
      setIsAdmin(data.user?.role === 'admin' || data.role === 'admin');
      // hydrate cart after login
      try {
        dispatch(fetchCart());
      } catch (err) {
        console.error('Failed to dispatch fetchCart after login', err);
      }
      toast.success('Login successful!');
      return { success: true, user: data.user || data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/api/users/register`, { name, email, password });
      const data = response.data;
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user || data);
      setIsAdmin(false);
      // hydrate cart after register
      try {
        dispatch(fetchCart());
      } catch (err) {
        console.error('Failed to dispatch fetchCart after register', err);
      }
      toast.success('Registration successful!');
      return { success: true, user: data.user || data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    // clear client cart on logout
    dispatch(clearCartAction());
    toast.success('Logged out successfully!');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API}/api/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setUser(data);
      toast.success('Profile updated successfully!');
      return { success: true, user: data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};