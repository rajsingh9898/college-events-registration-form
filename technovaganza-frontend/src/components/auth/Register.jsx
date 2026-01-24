import React, { useState } from 'react';
import { registerUser } from '../../services/api.js';
import { BRANCHES, BATCHES, COLLEGES } from '../../utils/constants.js';
import { validateEmail, validateMobile } from '../../utils/helpers.js';

const Register = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    rollno: '',
    mobile: '',
    batch: '',
    branch: '',
    college: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special validation for roll number - only allow numbers
    if (name === 'rollno') {
      // Allow only numbers and limit to reasonable length
      if (value === '' || /^\d+$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateRollNo = (rollno) => {
    // Check if roll number contains only numbers and has reasonable length
    if (!/^\d+$/.test(rollno)) {
      return 'Roll number must contain only numbers';
    }
    if (rollno.length < 3 || rollno.length > 15) {
      return 'Roll number must be between 3 and 15 digits';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (!validateEmail(formData.email)) {
      setMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!validateMobile(formData.mobile)) {
      setMessage('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    // Validate roll number
    const rollNoError = validateRollNo(formData.rollno);
    if (rollNoError) {
      setMessage(rollNoError);
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await registerUser(submitData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setMessage('Registration successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="px-3 py-3 bg-background-dark border border-gray-700 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            required
          />
          <input
            type="text"
            name="rollno"
            placeholder="Roll Number (Numbers Only)"
            value={formData.rollno}
            onChange={handleChange}
            className="px-3 py-3 bg-background-dark border border-gray-700 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            required
            inputMode="numeric"
            pattern="[0-9]*"
            title="Please enter numbers only"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="px-3 py-3 bg-background-dark border border-gray-700 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            required
          />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            className="px-3 py-3 bg-background-dark border border-gray-700 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select 
            name="batch" 
            value={formData.batch} 
            onChange={handleChange} 
            className="px-3 py-3 bg-background-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm form-select"
            required
          >
            <option value="" className="text-gray-500">Select Batch</option>
            {BATCHES.map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>

          <select 
            name="branch" 
            value={formData.branch} 
            onChange={handleChange} 
            className="px-3 py-3 bg-background-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm form-select"
            required
          >
            <option value="" className="text-gray-500">Select Branch</option>
            {BRANCHES.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        <div>
          <select 
            name="college" 
            value={formData.college} 
            onChange={handleChange} 
            className="w-full px-3 py-3 bg-background-dark border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm form-select"
            required
          >
            <option value="" className="text-gray-500">Select College</option>
            {COLLEGES.map(college => (
              <option key={college} value={college}>{college}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="px-3 py-3 bg-background-dark border border-gray-700 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="px-3 py-3 bg-background-dark border border-gray-700 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            required
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-center text-sm ${
            message.includes('successful') 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary glow-on-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;