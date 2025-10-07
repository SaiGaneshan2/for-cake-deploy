import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizPlayer.css';

const QuizPlayer = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        console.log('Fetching quiz data for room code:', roomCode);
        const response = await fetch(`http://localhost:3001/api/quiz/${roomCode}`);
        
        if (!response.ok) {
          throw new Error('Quiz not found');
        }
        
        const result = await response.json();
        const data = result.quiz; // Extract quiz from result
        
        console.log('Quiz data received:', data);
        console.log('Number of questions:', data.questions?.length);
        console.log('Number of levels:', data.numLevels);
        console.log('Questions per level:', data.questionsPerLevel);
        
        setQuizData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [roomCode]);

  if (loading) {
    return (
      <div className="quiz-player-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-player-container">
        <div className="error-screen">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/join')}>Back to Join</button>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return null;
  }

  const questionsPerLevel = quizData.questionsPerLevel || 
                            Math.ceil(quizData.questions.length / quizData.numLevels);
  const totalLevels = quizData.numLevels || 
                      Math.ceil(quizData.questions.length / questionsPerLevel);
  
  const levelStartIndex = (currentLevel - 1) * questionsPerLevel;
  const levelEndIndex = Math.min(currentLevel * questionsPerLevel, quizData.questions.length);
  const levelQuestions = quizData.questions.slice(levelStartIndex, levelEndIndex);
  const currentQuestion = levelQuestions[currentQuestionIndex];

  // Safety check - if no current question, something went wrong
  if (!currentQuestion) {
    console.error('No current question found!');
    console.error('Current level:', currentLevel);
    console.error('Current question index:', currentQuestionIndex);
    console.error('Level questions:', levelQuestions);
    console.error('Questions per level:', questionsPerLevel);
    console.error('Total levels:', totalLevels);
    
    return (
      <div className="quiz-player-container">
        <div className="error-screen">
          <h2>❌ Error</h2>
          <p>Unable to load quiz question. Please try refreshing the page.</p>
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  const handleAnswerClick = (answer) => {
    if (showFeedback) return; // Prevent multiple clicks
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (currentQuestionIndex + 1 < levelQuestions.length) {
        // More questions in this level
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Level complete
        setIsLevelComplete(true);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }, 2000);
  };

  const handleNextLevel = () => {
    if (currentLevel < totalLevels) {
      setCurrentLevel(currentLevel + 1);
      setCurrentQuestionIndex(0);
      setIsLevelComplete(false);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentLevel(1);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsLevelComplete(false);
    setIsQuizComplete(false);
  };

  const handleExit = () => {
    navigate('/');
  };

  // Quiz completion screen
  if (isQuizComplete) {
    const percentage = Math.round((score / quizData.questions.length) * 100);
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
      message = 'Outstanding! You\'re a SQL master!';
      emoji = '🏆';
    } else if (percentage >= 70) {
      message = 'Great job! You have a solid understanding!';
      emoji = '🌟';
    } else if (percentage >= 50) {
      message = 'Good effort! Keep practicing!';
      emoji = '👍';
    } else {
      message = 'Keep learning! You\'ll get better!';
      emoji = '📚';
    }

    return (
      <div className="quiz-player-container">
        <div className="results-screen">
          <div className="results-card">
            <div className="results-emoji">{emoji}</div>
            <h1>Quiz Complete!</h1>
            <div className="results-stats">
              <div className="stat">
                <div className="stat-value">{score}</div>
                <div className="stat-label">Correct</div>
              </div>
              <div className="stat">
                <div className="stat-value">{quizData.questions.length}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat">
                <div className="stat-value">{percentage}%</div>
                <div className="stat-label">Score</div>
              </div>
            </div>
            <p className="results-message">{message}</p>
            <div className="results-buttons">
              <button className="restart-button" onClick={handleRestart}>
                🔄 Try Again
              </button>
              <button className="exit-button" onClick={handleExit}>
                🏠 Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Level completion screen
  if (isLevelComplete) {
    return (
      <div className="quiz-player-container">
        <div className="level-complete-screen">
          <div className="level-complete-card">
            <h1>🎉 Level {currentLevel} Complete!</h1>
            <p className="level-score">
              You got {levelQuestions.filter((q, idx) => {
                const globalIdx = levelStartIndex + idx;
                return score > globalIdx - (currentLevel - 1) * questionsPerLevel;
              }).length} out of {levelQuestions.length} correct!
            </p>
            {currentLevel < totalLevels ? (
              <button className="next-level-button" onClick={handleNextLevel}>
                ➡️ Next Level
              </button>
            ) : (
              <button className="next-level-button" onClick={handleNextLevel}>
                🏁 View Results
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main quiz screen
  return (
    <div className="quiz-player-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <span className="room-code-badge">Room: {roomCode}</span>
          <span className="level-badge">Level {currentLevel}/{totalLevels}</span>
          <span className="question-badge">
            Question {currentQuestionIndex + 1}/{levelQuestions.length}
          </span>
        </div>
        <div className="score-display">
          Score: {score}/{quizData.questions.length}
        </div>
      </div>

      <div className="question-card">
        <div className="question-number">Question {levelStartIndex + currentQuestionIndex + 1}</div>
        <h2 className="question-text">{currentQuestion.question}</h2>
        
        <div className="options-grid">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            
            let buttonClass = 'option-button';
            
            if (showFeedback) {
              if (isCorrect) {
                buttonClass += ' correct';
              } else if (isSelected && !isCorrect) {
                buttonClass += ' incorrect';
              }
            } else if (isSelected) {
              buttonClass += ' selected';
            }

            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswerClick(option)}
                disabled={showFeedback}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`feedback ${selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`}>
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <span>✅ Correct!</span>
            ) : (
              <span>❌ Incorrect. The correct answer is: {currentQuestion.correctAnswer}</span>
            )}
          </div>
        )}
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${((levelStartIndex + currentQuestionIndex + 1) / quizData.questions.length) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default QuizPlayer;
