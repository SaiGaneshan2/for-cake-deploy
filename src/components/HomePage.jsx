import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎓 Interactive Quiz Game
          </h1>
          <p className="text-xl text-gray-600">
            Choose your role to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">I'm a Student</h2>
            <p className="text-gray-600 mb-6">
              Join a quiz session with your room code
            </p>
            <button
              onClick={() => navigate('/student/join')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105"
            >
              Join Quiz
            </button>
          </div>

          {/* Teacher Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">I'm a Teacher</h2>
            <p className="text-gray-600 mb-6">
              Login to monitor quiz sessions and view results
            </p>
            <button
              onClick={() => navigate('/teacher/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:from-blue-700 hover:to-cyan-700 transform hover:scale-105"
            >
              Teacher Login
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gray-100 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Test Links</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                File Upload (Original)
              </button>
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Dashboard (Direct)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;