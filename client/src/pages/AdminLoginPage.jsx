import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center py-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
  
      <div className="max-w-xl w-full relative z-10">
        

        {/* Card */}
        <div className="rounded-lg shadow-lg p-8 space-y-8" style={{ 
          backgroundColor: 'var(--color-bg-primary)',
          border: '2px solid var(--color-border-light)'
        }}>
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-block p-5 mb-0 rounded-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <i className="fas fa-shield-user text-4xl" style={{ color: 'var(--color-accent-primary)' }}></i>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Admin Portal</h1>
              <p className="text-base" style={{ color: 'var(--color-text-light)' }}>Secure Access for Administrators</p>
            </div>
          </div>

        

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="">
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Admin Email</label>
              <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-lg" style={{ color: 'var(--color-text-light)' }}></i>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none transition text-lg"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="admin@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="">
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Password</label>
              <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-lg" style={{ color: 'var(--color-text-light)' }}></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border-2 rounded-lg focus:outline-none transition text-lg"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 transition text-lg hover:opacity-80"
                  style={{ color: 'var(--color-text-light)' }}
                  disabled={loading}
                >
                  {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold transition duration-300 disabled:opacity-50 text-lg mt-2 shadow-md transform hover:scale-105"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--color-accent-light)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--color-accent-primary)';
              }}
            >
              {loading ? 'Verifying Admin Credentials...' : 'Sign In as Administrator'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '2px solid var(--color-border-light)' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 font-semibold" style={{ 
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-light)'
              }}>Need Help?</span>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-3 flex justify-between">
            <span style={{ color: 'var(--color-text-light)' }}>
              <Link to="/" className="font-bold transition" style={{ color: 'var(--color-accent-primary)' }}>
                ← Back to Home
              </Link>
            </span>
            <span style={{ color: 'var(--color-text-light)' }}>
              <Link to="/contact" className="font-bold transition" style={{ color: 'var(--color-accent-primary)' }}>
                Contact Support
              </Link>
            </span>
          </div>

      

            {/* Security Notice */}
          <div className="p-4 rounded-lg" style={{ 
            backgroundColor: 'var(--color-bg-secondary)',
            border: '2px solid var(--color-border-light)'
          }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              🔒 This portal is exclusively for authorized administrators. Unauthorized access attempts are logged and monitored.
            </p>
          </div>
        </div>

        
      </div>

     
    </div>
  );
};

export default AdminLoginPage;
