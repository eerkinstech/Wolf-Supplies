import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUserShield, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      const userData = result.user;
      // Check if user is admin
      if (userData.role !== 'admin') {
        toast.error('You do not have admin privileges');
        return;
      }
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gray-1000 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-black rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-lg w-full relative z-10">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition duration-300 mb-8 font-semibold"
        >
          <FaArrowLeft className="text-lg" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 sm:p-12 space-y-8 border border-slate-700/50">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-2xl shadow-xl">
              <FaUserShield className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Admin Portal</h1>
              <p className="text-lg text-gray-400">Secure Access for Administrators</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gray-1000/10 border border-gray-600/30 p-4 rounded-lg">
            <p className="text-sm text-gray-300">
              🔒 This portal is exclusively for authorized administrators. Unauthorized access attempts are logged and monitored.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-200">Admin Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent outline-none transition text-lg text-white placeholder-gray-900"
                  placeholder="admin@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-200">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent outline-none transition text-lg text-white placeholder-gray-900"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition text-lg"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-bold transition duration-300 disabled:opacity-50 text-lg mt-8 transform hover:scale-105 shadow-lg shadow-blue-500/50"
            >
              {loading ? 'Verifying Admin Credentials...' : 'Sign In as Administrator'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800/50 text-gray-400 font-semibold">Need Help?</span>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-3 text-center">
            <p className="text-gray-400">
              Not an admin?{' '}
              <Link to="/login" className="text-black hover:text-gray-700 font-bold">
                User Login
              </Link>
            </p>
            <p className="text-gray-400">
              <Link to="/contact" className="text-purple-400 hover:text-purple-300 font-bold">
                Contact Support
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 border border-slate-600/50 p-6 rounded-lg space-y-3">
            <p className="text-sm text-gray-300 font-bold flex items-center gap-2">
              <span className="text-lg">👨‍💼</span> Admin Demo Credentials
            </p>
            <div className="space-y-2 bg-slate-900/50 p-3 rounded">
              <div>
                <p className="text-xs text-gray-900">Email:</p>
                <p className="text-sm text-gray-200 font-mono">admin@ecommerce.com</p>
              </div>
              <div>
                <p className="text-xs text-gray-900">Password:</p>
                <p className="text-sm text-gray-200 font-mono">Admin@123</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-xs text-gray-900">
              Last login attempt will be logged for security purposes
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-900">
            🔐 SSL Secured • Admin Access Only • Monitored Access
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AdminLoginPage;
