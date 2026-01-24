import React, { useState } from 'react';
import { adminLogin } from '../../services/api'; // Import from your api.js

const AdminLogin = ({ onAdminLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Use the imported adminLogin function from api.js
      const response = await adminLogin(formData);
      
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
        
        setMessage('Admin login successful! Redirecting...');
        
        setTimeout(() => {
          if (onAdminLogin) {
            onAdminLogin(response.data.admin);
          }
        }, 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-md p-8 space-y-8 bg-background-light dark:bg-background-dark/50 rounded-xl shadow-2xl shadow-primary/20 border border-white/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">Technovaganza 2025</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Admin Login</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="sr-only" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="relative block w-full px-3 py-4 bg-background-dark/50 dark:bg-background-dark border border-gray-700 dark:border-gray-600 placeholder-gray-500 text-black dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Username"
              required
            />
          </div>
          
          <div>
            <label className="sr-only" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="relative block w-full px-3 py-4 bg-background-dark/50 dark:bg-background-dark border border-gray-700 dark:border-gray-600 placeholder-gray-500 text-black dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Password"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-center ${
              message.includes('successful') 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary glow-on-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </span>
              ) : 'Login as Admin'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold mb-2">Default Credentials</p>
            <div className="text-yellow-500 dark:text-yellow-300 text-xs space-y-1">
              <p>Username: <code className="bg-yellow-500/20 px-1 rounded">admin</code></p>
              <p>Password: <code className="bg-yellow-500/20 px-1 rounded">admin123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;