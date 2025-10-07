import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuth } from '../firebase';
import './AuthForm.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!email.trim()) {
      setError('❌ Email is required.');
      return;
    }

    if (!email.includes('@')) {
      setError('❌ Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('❌ Password is required.');
      return;
    }

    // Check password strength
    const strengthError = checkPasswordStrength(password);
    if (strengthError) {
      setError(`❌ ${strengthError}`);
      return;
    }

    if (password !== confirmPassword) {
      setError('❌ Passwords do not match. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Attempting to register with:', { email });

      const { user, error: signUpError } = await firebaseAuth.signUpTeacher(
        email.trim(),
        password
      );

      if (signUpError) {
        console.error('❌ Registration error:', signUpError);

        // Handle specific error cases
        if (signUpError.message.includes('User already registered')) {
          setError('❌ User with this email already exists. Please try logging in instead.');
        } else if (signUpError.message.includes('Password should be at least')) {
          setError('❌ Password must be at least 6 characters long.');
        } else if (signUpError.message.includes('Invalid email')) {
          setError('❌ Please enter a valid email address.');
        } else {
          setError(`❌ Registration failed: ${signUpError.message}`);
        }
        setIsLoading(false);
        return;
      }

      // Success
      console.log('✅ Registration successful:', user);
      setSuccessMessage('✅ Registration successful! Please check your email to confirm your account before logging in.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/teacher/login');
      }, 3000);

    } catch (err) {
      console.error('💥 Unexpected error:', err);
      setError(`💥 Unexpected error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-indigo-700 to-blue-800 flex items-center justify-center p-4">
      <div className="auth-form-container bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 text-4xl">
            📝
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Registration</h1>
          <p className="text-gray-600">Create your account to start managing quizzes</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form register-form space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
              placeholder="Confirm your password"
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
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:ring-4 focus:ring-purple-300"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/teacher/login')}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
            >
              Log in here
            </button>
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

export default Register;
