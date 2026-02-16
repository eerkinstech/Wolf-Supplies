import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


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
          <i className="fas fa-spinner animate-spin text-4xl text-gray-700 block mx-auto mb-4"></i>
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
          <i className="fas fa-lock text-5xl text-black block mx-auto mb-4"></i>
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
