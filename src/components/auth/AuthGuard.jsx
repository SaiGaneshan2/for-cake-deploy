import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsLoading } from '../../redux/authSlice';
import Auth from './Auth';
import Loader from './Loader';

const AuthGuard = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <Loader />;
  }

  // Show auth component if not authenticated
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Show protected content if authenticated
  return children;
};

export default AuthGuard;
