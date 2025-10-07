import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentJoin = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!username.trim()) {
      setError('Please enter your name.');
      return;
    }
    
    if (!roomCode.trim()) {
      setError('Please enter a room code.');
      return;
    }
    
    if (roomCode.length !== 6) {
      setError('Room code must be exactly 6 characters long.');
      return;
    }

    // Additional validation for room code format
    if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
      setError('Room code must contain only letters and numbers.');
      return;
    }

    setIsLoading(true);

    try {
      // Check if room code exists in the original backend
      const response = await fetch(`http://localhost:3001/api/quiz/${roomCode.toUpperCase()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Invalid or inactive room code.');
        } else {
          setError('Unable to connect to server. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      const quizData = await response.json();
      console.log('Quiz found:', quizData);

      // Store student session data in localStorage for the game
      const studentSession = {
        username: username.trim(),
        roomCode: roomCode.toUpperCase(),
        joinedAt: new Date().toISOString(),
        quizTitle: quizData.quiz?.title || 'Quiz Session'
      };
      
      localStorage.setItem('studentSession', JSON.stringify(studentSession));
      localStorage.setItem('currentRoomCode', roomCode.toUpperCase());
      localStorage.setItem('currentUsername', username.trim());

      // Show success message briefly before navigating
      setError('');
      setSuccess(`✅ Successfully joined! Loading quiz...`);
      
      // Brief delay to show success message, then navigate
      setTimeout(() => {
        navigate(`/quiz/${roomCode.toUpperCase()}?username=${encodeURIComponent(username.trim())}`);
      }, 1000);
      
    } catch (err) {
      console.error('Error joining quiz:', err);
      setError('Unable to connect to server. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRoomCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setRoomCode(value);
    // Clear any previous messages when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    // Clear any previous messages when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Quiz Game</h1>
          <p className="text-gray-600">Enter your details to join the quiz</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
              placeholder="Enter your name"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={handleRoomCodeChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg text-center tracking-widest font-mono"
              placeholder="XXXXXX"
              maxLength={6}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm font-medium">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:ring-4 focus:ring-purple-300"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Joining...
              </div>
            ) : (
              'Join Game'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Need help? Contact your teacher for the room code.
          </p>
          <div className="text-xs text-gray-400">
            <p>💡 Room codes are exactly 6 characters (letters and numbers)</p>
            <p>📚 Example: ABC123, XYZ789, 508039</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentJoin;
