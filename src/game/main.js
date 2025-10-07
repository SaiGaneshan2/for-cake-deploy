import Phaser from 'phaser';

/**
 * Main Game Scene
 * This is the entry point for your Phaser game.
 * Quiz data is received through the init() method and stored in the Phaser Registry.
 */
class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainGameScene' });
  }

  /**
   * init() - Called first when scene starts
   * This is where we receive data passed from the React component
   * and store it globally in the Phaser Registry
   */
  init(config) {
    console.log('🎮 MainGameScene init() called');
    
    // Access quiz data from the config.custom object
    const quizData = config.custom?.quizData;
    const roomCode = config.custom?.roomCode;
    
    if (quizData) {
      console.log('📦 Quiz data received in Phaser scene:', quizData);
      console.log('🔑 Room code:', roomCode);
      console.log('❓ Total questions:', quizData.totalQuestions);
      
      // Store quiz data in Phaser Registry for global access
      // Any scene can now access this data via: this.registry.get('quizData')
      this.registry.set('quizData', quizData);
      this.registry.set('roomCode', roomCode);
      
      console.log('✅ Quiz data stored in Phaser Registry');
    } else {
      console.warn('⚠️ No quiz data found in config');
    }
  }

  /**
   * preload() - Load all game assets here
   */
  preload() {
    console.log('📥 MainGameScene preload()');
    
    // Load your game assets here
    // Example:
    // this.load.image('background', '/assets/background.png');
    // this.load.spritesheet('player', '/assets/player.png', { frameWidth: 32, frameHeight: 48 });
  }

  /**
   * create() - Initialize game objects and logic
   */
  create() {
    console.log('🎨 MainGameScene create()');
    
    // Retrieve quiz data from registry
    const quizData = this.registry.get('quizData');
    const roomCode = this.registry.get('roomCode');
    
    console.log('🔍 Retrieved from registry:', { quizData, roomCode });
    
    // Set background color
    this.cameras.main.setBackgroundColor('#16213e');
    
    // Display game title
    const titleText = this.add.text(
      this.cameras.main.width / 2,
      150,
      'Quiz Game Ready!',
      {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Add pulsing animation to title
    this.tweens.add({
      targets: titleText,
      scale: { from: 1, to: 1.1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Display quiz information
    if (quizData) {
      const infoText = `Room: ${roomCode}\nQuestions: ${quizData.totalQuestions}\nLevels: ${quizData.numLevels || 'N/A'}`;
      
      this.add.text(
        this.cameras.main.width / 2,
        250,
        infoText,
        {
          fontSize: '24px',
          color: '#00d2ff',
          fontFamily: 'Arial',
          align: 'center',
          lineSpacing: 10
        }
      ).setOrigin(0.5);
      
      // Display first question as example
      if (quizData.questions && quizData.questions.length > 0) {
        const firstQuestion = quizData.questions[0];
        
        this.add.text(
          this.cameras.main.width / 2,
          360,
          'First Question Preview:',
          {
            fontSize: '18px',
            color: '#ffd700',
            fontFamily: 'Arial',
            fontStyle: 'bold'
          }
        ).setOrigin(0.5);
        
        const questionText = firstQuestion.question.length > 60 
          ? firstQuestion.question.substring(0, 60) + '...'
          : firstQuestion.question;
        
        this.add.text(
          this.cameras.main.width / 2,
          400,
          questionText,
          {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial',
            wordWrap: { width: 700 }
          }
        ).setOrigin(0.5);
      }
    }
    
    // Instructions with better formatting
    const instructionStyle = {
      fontSize: '16px',
      color: '#95a5a6',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 5
    };
    
    this.add.text(
      this.cameras.main.width / 2,
      500,
      'Press SPACE to view quiz details',
      instructionStyle
    ).setOrigin(0.5);
    
    this.add.text(
      this.cameras.main.width / 2,
      530,
      'Press ESC to view all questions',
      instructionStyle
    ).setOrigin(0.5);
    
    this.add.text(
      this.cameras.main.width / 2,
      560,
      'Click the PLAY button to start!',
      {
        fontSize: '18px',
        color: '#27ae60',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Add keyboard controls
    this.input.keyboard.on('keydown-SPACE', () => {
      console.log('🚀 SPACE pressed - Showing quiz details...');
      const allQuizData = this.registry.get('quizData');
      console.log('Quiz Details:', {
        roomCode: this.registry.get('roomCode'),
        totalQuestions: allQuizData.totalQuestions,
        questionsPerLevel: allQuizData.questionsPerLevel,
        numLevels: allQuizData.numLevels,
        createdAt: allQuizData.createdAt
      });
      // You could show a modal or overlay with quiz details
    });
    
    this.input.keyboard.on('keydown-ESC', () => {
      console.log('📋 ESC pressed - Showing all questions...');
      const allQuestions = this.registry.get('quizData');
      console.log('All Questions:', allQuestions.questions);
      allQuestions.questions.forEach((q, i) => {
        console.log(`Q${i + 1}: ${q.question}`);
        console.log(`   Options: ${q.options.join(', ')}`);
        console.log(`   Answer: ${q.correctAnswer}`);
      });
    });
    
    console.log('✅ MainGameScene fully initialized');
    console.log('💡 Quiz data is available globally via: this.registry.get("quizData")');
    console.log('🎮 Click the PLAY button overlay to start Level 1!');
  }

  /**
   * update() - Game loop, called every frame
   */
  update(time, delta) {
    // Game update logic here
  }
}

/**
 * Example Level Scene
 * Shows how to access quiz data from another scene
 */
class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1Scene' });
  }

  create() {
    console.log('🎯 Level1Scene started');
    
    // Access quiz data from registry
    const quizData = this.registry.get('quizData');
    
    if (quizData && quizData.questions.length > 0) {
      const currentQuestion = quizData.questions[0];
      
      this.add.text(400, 100, 'Level 1', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
      this.add.text(400, 200, currentQuestion.question, { 
        fontSize: '18px', 
        color: '#fff',
        wordWrap: { width: 700 }
      }).setOrigin(0.5);
      
      // Display answer options
      const startY = 300;
      currentQuestion.options.forEach((option, index) => {
        this.add.text(400, startY + (index * 40), `${index + 1}. ${option}`, {
          fontSize: '16px',
          color: '#00ff00'
        }).setOrigin(0.5);
      });
    }
  }
}

// Export game configuration
export const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#16213e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: [MainGameScene, Level1Scene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export default MainGameScene;
