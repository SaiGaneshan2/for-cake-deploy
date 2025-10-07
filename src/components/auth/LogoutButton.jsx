import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logoutUser } from '../../redux/authSlice';

const LogoutButton = ({ className = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      aria-label="Logout"
      title="Logout"
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-600 bg-gray-800/60 hover:bg-gray-700/60 text-white transition-colors ${className}`}
    >
      <LogOut size={18} className="text-red-400" />
      <span className="hidden sm:inline text-sm">Logout</span>
    </button>
  );
};

export default LogoutButton;
