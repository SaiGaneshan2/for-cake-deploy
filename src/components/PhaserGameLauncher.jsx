import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import MainGameScene from '../game/main.js';
import Level1 from './levels/Level1';
import './PhaserGameLauncher.css';

const PhaserGameLauncher = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const gameContainerRef = useRef(null);
  const gameInstance = useRef(null);
  
  const [quizData, setQuizData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGame, setShowGame] = useState(false);

  // First useEffect: Fetch quiz data from API
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        console.log('🔍 Fetching quiz data for room code:', roomCode);
        
        const response = await fetch(`http://localhost:3001/api/quiz/${roomCode}`);
        
        if (!response.ok) {
          throw new Error('Quiz not found');
        }
        
        const result = await response.json();
        console.log('✅ Quiz data fetched successfully:', result.quiz);
        
        setQuizData(result.quiz);
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error fetching quiz:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (roomCode) {
      fetchQuizData();
    }
  }, [roomCode]);

  // Second useEffect: Initialize Phaser game after quiz data is fetched
  useEffect(() => {
    // Don't initialize if:
    // - Quiz data hasn't loaded yet
    // - Container ref isn't ready
    // - Game is already initialized
    // - User clicked play (showing Level1 component)
    if (!quizData || !gameContainerRef.current || gameInstance.current || showGame) {
      return;
    }

    console.log('🎮 Initializing Phaser game with quiz data...');

    // Phaser game configuration
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameContainerRef.current,
      backgroundColor: '#2d3436',
      scene: [MainGameScene], // Import your game scenes here
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      // ⭐ CRITICAL: Pass quiz data through custom property
      // This makes the data available to the scene's init() method
      custom: {
        quizData: quizData,
        roomCode: roomCode
      }
    };

    // Create the Phaser game instance
    console.log('🚀 Creating Phaser.Game instance...');
    gameInstance.current = new Phaser.Game(config);

    console.log('✅ Phaser game created successfully with quiz data injected');

    // Cleanup function: destroy game when component unmounts
    return () => {
      if (gameInstance.current) {
        console.log('🧹 Cleaning up Phaser game instance');
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [quizData, roomCode, showGame]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#2d3436',
        color: '#ffffff'
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h2 style={{ marginTop: '20px' }}>Loading Quiz...</h2>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#2d3436',
        color: '#ffffff',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>Error Loading Quiz</h2>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>{error}</p>
        <button
          onClick={() => navigate('/join')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#3498db',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back to Join Page
        </button>
      </div>
    );
  }

  // If user clicked play, show full-screen game layout
  if (showGame) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header with Back Button */}
        <div style={{
          padding: '15px 30px',
          backgroundColor: '#16213e',
          borderBottom: '2px solid #0f3460',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => {
              setShowGame(false);
              navigate('/join');
            }}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#e74c3c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← Back to Menu
          </button>
        </div>

        {/* Full-Screen Game Container */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Level1 
            quizData={quizData}
            onComplete={() => {
              console.log('Level 1 completed!');
              setShowGame(false);
            }} 
          />
        </div>
      </div>
    );
  }

  // Game container - Show welcome screen with Play button
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#2d3436',
      padding: '20px'
    }}>
      <div 
        id="phaser-game-container" 
        ref={gameContainerRef}
        style={{
          width: '100%',
          maxWidth: '800px',
          aspectRatio: '4/3',
          position: 'relative'
        }}
      >
        {/* Overlay with Play button */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '30px',
          zIndex: 10
        }}>
          <button
            onClick={() => {
              // Destroy the intro game and show Level1
              if (gameInstance.current) {
                gameInstance.current.destroy(true);
                gameInstance.current = null;
              }
              setShowGame(true);
            }}
            style={{
              padding: '20px 60px',
              fontSize: '32px',
              fontWeight: 'bold',
              backgroundColor: '#27ae60',
              color: '#ffffff',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(39, 174, 96, 0.4)',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.backgroundColor = '#2ecc71';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.backgroundColor = '#27ae60';
            }}
          >
            ▶ PLAY
          </button>

          <div style={{
            textAlign: 'center',
            color: '#ecf0f1'
          }}>
            <p style={{ fontSize: '14px', color: '#95a5a6', margin: '5px 0' }}>
              Press SPACE to view quiz details
            </p>
            <p style={{ fontSize: '14px', color: '#95a5a6', margin: '5px 0' }}>
              Press ESC to view all questions
            </p>
          </div>
        </div>
      </div>
      
      <div style={{
        marginTop: '20px',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', color: '#95a5a6' }}>
          Room Code: <strong style={{ color: '#3498db' }}>{roomCode}</strong>
        </p>
        <p style={{ fontSize: '14px', color: '#95a5a6' }}>
          Questions: <strong style={{ color: '#3498db' }}>{quizData?.totalQuestions || 0}</strong>
        </p>
      </div>
    </div>
  );
};

export default PhaserGameLauncher;
