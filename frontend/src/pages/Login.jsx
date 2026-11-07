import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please provide a valid email address';
    if (!formData.password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', { email: formData.email.trim(), password: formData.password });
      const token = response.data?.token || response.data?.data?.token;
      const user = response.data?.user || response.data?.data?.user;
      if (!token) throw new Error('Authentication token not received from server');
      login(token, user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to log in. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-black">Sign in to your account</h1>
          <p className="text-sm text-gray-500">Welcome back! Please enter your details.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5" htmlFor="email">Email Address</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border ${formErrors.email ? 'border-gray-500' : 'border-gray-300'} focus:outline-none focus:border-black transition`} />
            {formErrors.email && <p className="mt-1 text-xs text-gray-700 font-medium">{formErrors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5" htmlFor="password">Password</label>
            <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border ${formErrors.password ? 'border-gray-500' : 'border-gray-300'} focus:outline-none focus:border-black transition`} />
            {formErrors.password && <p className="mt-1 text-xs text-gray-700 font-medium">{formErrors.password}</p>}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-black hover:bg-gray-800 text-white font-semibold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed">
            {isSubmitting ? (
              <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>Signing In...</>
            ) : 'Sign In'}
          </button>
        </form>
        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600">Don't have an account?{' '}<Link to="/register" className="font-semibold text-black hover:underline">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Login;
