import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuth } from '../firebase';
import './AuthForm.css';

const TeacherLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Client-side validation
    if (!email.trim()) {
      setError('❌ Email is required.');
      return;
    }

    if (!password.trim()) {
      setError('❌ Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting to sign in with:', { email: email.trim() });
      
      // Use the centralized helper function
      const { user, error: authError } = await firebaseAuth.signInTeacher(
        email.trim(),
        password
      );

      if (authError) {
        console.error('❌ Authentication error:', authError);
        
        // Handle specific error cases with better messages
        if (authError.message.includes('Invalid login credentials')) {
          setError('❌ Invalid login credentials. Please check your email and password.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('📧 Email not confirmed. Please check your email for the confirmation link.');
        } else if (authError.message.includes('Too many requests')) {
          setError('⏳ Too many login attempts. Please wait a few minutes and try again.');
        } else if (authError.message.includes('User not found')) {
          setError('👤 No account found with this email. Please register first.');
        } else {
          setError(`❌ Login failed: ${authError.message}`);
        }
        setIsLoading(false);
        return;
      }

      // Success
      console.log('✅ Login successful:', user);
      setSuccessMessage('✅ Login successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/teacher/dashboard');
      }, 1000);
      
    } catch (err) {
      console.error('💥 Unexpected error:', err);
      setError(`💥 Unexpected error: ${err.message}`);
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="auth-form-container bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 text-4xl">
            📚
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Login</h1>
          <p className="text-gray-600">Access your dashboard to monitor quiz sessions</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form login-form space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              placeholder="teacher@school.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:ring-4 focus:ring-blue-300"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging In...
              </div>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/teacher/register')}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
            >
              Register here
            </button>
          </p>
          <p className="text-xs text-gray-500">
            Having trouble? Contact your system administrator.
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;