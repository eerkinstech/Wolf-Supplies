import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSpinner, FaLock } from 'react-icons/fa';

/**
 * AdminRoute Component - Protects admin-only routes with authentication and role-based access
 * 
 * Usage:
 * <Route 
 *   path="/admin/dashboard" 
 *   element={<AdminRoute><AdminDashboardPage /></AdminRoute>}
 * />
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-gray-700 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated but not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-black">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <FaLock className="text-5xl text-black mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this page. Only administrators can access this area.
          </p>
          <a href="/" className="inline-block px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
