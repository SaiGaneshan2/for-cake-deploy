import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './InteractiveQuizGame.css';

const QuizGame = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);
  
  // Interactive quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [gameStarted, setGameStarted] = useState(false);

  // Get username from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username') || localStorage.getItem('currentUsername') || 'Student';

  // Fetch quiz data when component mounts
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        console.log('Fetching quiz data for room code:', roomCode);
        
        const response = await fetch(`http://localhost:3001/api/quiz/${roomCode}`);
        const result = await response.json();

        if (response.ok) {
          console.log('Quiz data fetched successfully:', result.quiz);
          setQuizData(result.quiz);
          setIsLoading(false);
        } else {
          setError(result.details || 'Quiz not found');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Unable to load quiz. Please try again.');
        setIsLoading(false);
      }
    };

    if (roomCode) {
      fetchQuizData();
    }
  }, [roomCode]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || showResult || quizCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-select no answer
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, showResult, quizCompleted, timeLeft]);

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  const totalQuestions = quizData?.questions?.length || 0;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Handle game start
  const handleStartGame = () => {
    setGameStarted(true);
    setTimeLeft(30);
  };

  // Handle answer selection
  const handleAnswerSelect = (selectedOption) => {
    if (showResult) return; // Prevent multiple selections
    
    setSelectedAnswer(selectedOption);
    setShowResult(true);

    // Check if answer is correct
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Auto-advance to next question after showing result
    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  // Handle time up
  const handleTimeUp = () => {
    if (showResult) return;
    
    setSelectedAnswer(null);
    setShowResult(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setQuizCompleted(true);
    }
  };

  // Restart quiz
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    setTimeLeft(30);
    setGameStarted(false);
  };

  // Exit quiz
  const handleExit = () => {
    navigate('/join');
  };

  // Get result message
  const getResultMessage = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) return "🎉 Excellent! Outstanding performance!";
    if (percentage >= 75) return "👏 Great job! You did really well!";
    if (percentage >= 60) return "👍 Good work! Keep it up!";
    if (percentage >= 40) return "📚 Not bad! Study more to improve!";
    return "💪 Don't give up! Practice makes perfect!";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="quiz-container loading">
        <div className="loading-spinner"></div>
        <h2>Loading Quiz...</h2>
        <p>Preparing your quiz experience</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="quiz-container error">
        <div className="error-icon">❌</div>
        <h2>Quiz Not Found</h2>
        <p>{error}</p>
        <button onClick={handleExit} className="exit-btn">
          Back to Join Page
        </button>
      </div>
    );
  }

  // Quiz completed state
  if (quizCompleted) {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div className="quiz-container completed">
        <div className="results-card">
          <div className="trophy-icon">🏆</div>
          <h1>Quiz Completed!</h1>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/{totalQuestions}</span>
            </div>
            <div className="percentage">{percentage}%</div>
          </div>
          <p className="result-message">{getResultMessage()}</p>
          <div className="student-info">
            <p><strong>Student:</strong> {username}</p>
            <p><strong>Room Code:</strong> {roomCode}</p>
          </div>
          <div className="action-buttons">
            <button onClick={handleRestart} className="restart-btn">
              🔄 Try Again
            </button>
            <button onClick={handleExit} className="exit-btn">
              🏠 Exit Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game start screen
  if (!gameStarted) {
    return (
      <div className="quiz-container start-screen">
        <div className="start-card">
          <h1>🎯 Ready to Start?</h1>
          <div className="quiz-info">
            <div className="info-item">
              <span className="label">Student:</span>
              <span className="value">{username}</span>
            </div>
            <div className="info-item">
              <span className="label">Room Code:</span>
              <span className="value">{roomCode}</span>
            </div>
            <div className="info-item">
              <span className="label">Total Questions:</span>
              <span className="value">{totalQuestions}</span>
            </div>
            <div className="info-item">
              <span className="label">Time per Question:</span>
              <span className="value">30 seconds</span>
            </div>
          </div>
          <div className="instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Each question has 30 seconds time limit</li>
              <li>Click on your answer to select it</li>
              <li>You'll see if you're correct after each question</li>
              <li>Try to answer all questions for the best score!</li>
            </ul>
          </div>
          <button onClick={handleStartGame} className="start-btn">
            🚀 Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Main quiz game screen
  return (
    <div className="quiz-container game-screen">
      {/* Header */}
      <div className="quiz-header">
        <div className="student-info">
          <span className="student-name">👤 {username}</span>
          <span className="room-code">🏠 {roomCode}</span>
        </div>
        <button onClick={handleExit} className="exit-btn-small">
          ❌ Exit
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-info">
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          <span>Score: {score}/{currentQuestionIndex}</span>
        </div>
      </div>

      {/* Timer */}
      <div className="timer-container">
        <div className={`timer ${timeLeft <= 5 ? 'warning' : ''}`}>
          ⏰ {timeLeft}s
        </div>
      </div>

      {/* Question */}
      <div className="question-container">
        <h2 className="question-text">
          {currentQuestion?.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="options-container">
        {currentQuestion?.options?.map((option, index) => {
          let className = 'option-btn';
          
          if (showResult) {
            if (index === currentQuestion.correctAnswer) {
              className += ' correct';
            } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
              className += ' incorrect';
            } else {
              className += ' disabled';
            }
          } else if (selectedAnswer === index) {
            className += ' selected';
          }

          return (
            <button
              key={index}
              className={className}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Result Feedback */}
      {showResult && (
        <div className="result-feedback">
          {selectedAnswer === currentQuestion.correctAnswer ? (
            <div className="feedback correct-feedback">
              <div className="feedback-icon">✅</div>
              <div className="feedback-text">Correct! Well done!</div>
            </div>
          ) : selectedAnswer === null ? (
            <div className="feedback timeout-feedback">
              <div className="feedback-icon">⏰</div>
              <div className="feedback-text">Time's up! The correct answer was {String.fromCharCode(65 + currentQuestion.correctAnswer)}</div>
            </div>
          ) : (
            <div className="feedback incorrect-feedback">
              <div className="feedback-icon">❌</div>
              <div className="feedback-text">
                Incorrect. The correct answer was {String.fromCharCode(65 + currentQuestion.correctAnswer)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGame;