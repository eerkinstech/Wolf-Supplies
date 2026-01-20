import React, { createContext, useState, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCart, clearCart as clearCartAction, fetchCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
          const response = await fetch(`${API}/api/users/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            setToken(storedToken);
            setIsAdmin(data.role === 'admin');
            // hydrate cart from server via thunk
            try {
              dispatch(fetchCart());
            } catch (err) {
              console.error('Failed to dispatch fetchCart', err);
            }
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAdmin(false);
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
      const response = await fetch(`${API}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
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
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
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
      toast.error(error.message);
      return { success: false, error: error.message };
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
      const response = await fetch(`${API}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile update failed');
      }

      const data = await response.json();
      setUser(data);
      toast.success('Profile updated successfully!');
      return { success: true, user: data };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
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