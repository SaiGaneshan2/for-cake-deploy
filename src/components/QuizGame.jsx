import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import './QuizGame.css';

const QuizGame = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const gameContainerRef = useRef(null);
  const gameInstance = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);

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

  // Initialize Phaser game once quiz data is loaded
  useEffect(() => {
    if (!quizData || !gameContainerRef.current || gameInstance.current) return;

    console.log('Initializing Phaser game with quiz data...');

    // Simple example scene that will access the quiz data
    class QuizScene extends Phaser.Scene {
      constructor() {
        super({ key: 'QuizScene' });
      }

      init(data) {
        // Access quiz data passed from config
        console.log('QuizScene init - Received quiz data:', data.quizData);
        
        // Store quiz data in Phaser Registry for global access
        this.registry.set('quizData', data.quizData);
        this.registry.set('roomCode', data.roomCode);
        
        // Log to confirm storage
        console.log('Quiz data stored in Phaser Registry');
        console.log('Total questions:', data.quizData.totalQuestions);
        console.log('Questions array length:', data.quizData.questions.length);
      }

      preload() {
        // Preload any assets here if needed
        console.log('QuizScene preload');
      }

      create() {
        console.log('QuizScene create - Retrieving quiz data from registry...');
        
        // Retrieve quiz data from registry
        const storedQuizData = this.registry.get('quizData');
        const storedRoomCode = this.registry.get('roomCode');
        
        console.log('Retrieved quiz data:', storedQuizData);
        console.log('Room code:', storedRoomCode);

        // Add background
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Display quiz info
        const titleText = this.add.text(
          400, 
          100, 
          'Quiz Loaded Successfully!', 
          {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
          }
        ).setOrigin(0.5);

        const infoText = this.add.text(
          400,
          200,
          `Room Code: ${storedRoomCode}\nTotal Questions: ${storedQuizData.totalQuestions}\nCreated: ${new Date(storedQuizData.createdAt).toLocaleDateString()}`,
          {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial',
            align: 'center',
            lineSpacing: 10
          }
        ).setOrigin(0.5);

        // Display first few questions as a demo
        let yPos = 300;
        const questionsToShow = Math.min(3, storedQuizData.questions.length);
        
        this.add.text(
          400,
          yPos,
          'Sample Questions:',
          {
            fontSize: '24px',
            color: '#ffd700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
          }
        ).setOrigin(0.5);

        yPos += 40;

        for (let i = 0; i < questionsToShow; i++) {
          const question = storedQuizData.questions[i];
          const questionText = `${i + 1}. ${question.question.substring(0, 50)}${question.question.length > 50 ? '...' : ''}`;
          
          this.add.text(
            400,
            yPos,
            questionText,
            {
              fontSize: '16px',
              color: '#00ff00',
              fontFamily: 'Arial'
            }
          ).setOrigin(0.5);
          
          yPos += 30;
        }

        // Instructions
        this.add.text(
          400,
          450,
          'Press SPACE to see next question',
          {
            fontSize: '18px',
            color: '#888888',
            fontFamily: 'Arial'
          }
        ).setOrigin(0.5);

        // Add keyboard input
        this.input.keyboard.on('keydown-SPACE', () => {
          console.log('Space pressed - Quiz data available:', this.registry.get('quizData'));
          // Here you would transition to your actual game scenes
        });

        console.log('✅ QuizScene fully initialized with quiz data in registry');
      }

      update() {
        // Game loop - access quiz data anytime via this.registry.get('quizData')
      }
    }

    // Phaser game configuration
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 500,
      parent: gameContainerRef.current,
      backgroundColor: '#1a1a2e',
      scene: [QuizScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      }
    };

    // Create Phaser game instance and pass quiz data
    console.log('Creating Phaser.Game instance...');
    gameInstance.current = new Phaser.Game(config);

    // Pass quiz data to the scene through the scene's start method
    gameInstance.current.scene.start('QuizScene', {
      quizData: quizData,
      roomCode: roomCode
    });

    console.log('Phaser game created and quiz data injected');

    // Cleanup function
    return () => {
      if (gameInstance.current) {
        console.log('Destroying Phaser game instance');
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [quizData, roomCode]);

  // Loading state
  if (isLoading) {
    return (
      <div className="quiz-game-container">
        <div className="quiz-game-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Quiz...</h2>
          <p>Room Code: {roomCode}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="quiz-game-container">
        <div className="quiz-game-error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/join')} className="back-button">
            ← Back to Join Page
          </button>
        </div>
      </div>
    );
  }

  // Game container
  return (
    <div className="quiz-game-container">
      <div className="quiz-game-header">
        <div className="room-code-badge">
          Room Code: <strong>{roomCode}</strong>
        </div>
        <button onClick={() => navigate('/join')} className="exit-button">
          ✕ Exit Quiz
        </button>
      </div>
      
      <div 
        ref={gameContainerRef} 
        className="phaser-game-canvas"
      />
      
      <div className="quiz-game-footer">
        <p>Total Questions: <strong>{quizData?.totalQuestions || 0}</strong></p>
      </div>
    </div>
  );
};

export default QuizGame;
