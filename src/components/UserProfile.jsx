import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, LogOut, Settings, Trophy, Clock, Target } from 'lucide-react';
import { logoutUser } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 text-white px-3 py-2 rounded-lg transition-all duration-200 border border-gray-600"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <User size={16} />
        </div>
        <span className="hidden sm:block font-medium">{user.username}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">{user.username}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Game Progress</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Target size={16} className="text-blue-400" />
                <div>
                  <div className="text-sm text-gray-400">Current Level</div>
                  <div className="font-bold text-white">{user.gameProgress?.currentLevel || 1}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy size={16} className="text-yellow-400" />
                <div>
                  <div className="text-sm text-gray-400">Completed</div>
                  <div className="font-bold text-white">{user.gameProgress?.progress?.length || 0}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Lives</div>
                  <div className="font-bold text-white">{user.gameProgress?.lives || 3}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Settings size={16} className="text-purple-400" />
                <div>
                  <div className="text-sm text-gray-400">Member Since</div>
                  <div className="font-bold text-white text-xs">{formatDate(user.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all duration-200"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
