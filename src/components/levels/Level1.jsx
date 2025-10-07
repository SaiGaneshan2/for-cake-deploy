


import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { AiFillBug } from "react-icons/ai";
import MobileControls from "../MobileControls"; // Import the component



const Level1 = ({ onComplete, quizData, onSceneReady }) => {
  const gameContainerRef = useRef(null);
  const gameInstance = useRef(null);
  const mobileControlsRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
  });



  const [uiState, setUiState] = useState({
    health: 100,
    isQueryComplete: false,
    currentQuestion: null,
    questionsAnswered: 0,
    totalQuestions: quizData?.questions?.length || 0,
  });

  // Mobile controls state (for UI updates only)
  const [mobileControls, setMobileControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
  });



  useEffect(() => {
    if (!gameContainerRef.current) return;

    // Use quiz data if available, otherwise fallback to default
    const questions = quizData?.questions || [];
    let currentQuestionIndex = 0;

    console.log('🎮 Level1 starting with quiz data:', quizData);
    console.log('📝 Total questions:', questions.length);

    let player, enemies, correctCollectible, wrongCollectibles, walls;
    let cursors, spaceKey;



    const gameState = {
      health: 100,
      maxHealth: 100,
      mistakes: 0,
      isLevelComplete: false,
      canAttack: true,
      attackCooldown: 300,
      questionsAnswered: 0,
      totalQuestions: questions.length,
    };

    // Get current question or fallback
    const getCurrentQuestion = () => {
      if (questions.length > 0 && currentQuestionIndex < questions.length) {
        return questions[currentQuestionIndex];
      }
      // Fallback to default SQL question
      return {
        question: "SELECT * ___ levels",
        correctAnswer: "FROM",
        options: ["SELECT", "WHERE", "UPDATE", "DELETE", "ORDER BY", "GROUP BY", "HAVING", "JOIN", "INNER", "LEFT"]
      };
    };

    let currentQuestion = getCurrentQuestion();

    const query = {
      text: currentQuestion.question,
      word: currentQuestion.correctAnswer,
    };

    // Get all wrong options (excluding correct answer)
    const allKeywords = currentQuestion.options 
      ? currentQuestion.options.filter(opt => opt !== currentQuestion.correctAnswer)
      : ["SELECT", "WHERE", "UPDATE", "DELETE", "ORDER BY", "GROUP BY", "HAVING", "JOIN", "INNER"];



    let sceneRef;
    let keywordPositions = [];
    
    // ⏱️ Timer variables
    let timerText = null;
    let timerEvent = null;
    let timeUpEvent = null;
    let currentTime = 20;

    function preload() {
      sceneRef = this;



      // --- Create Wizard Character for Player ---
      const playerGraphics = this.add.graphics();



      // Wizard robe (main body)
      playerGraphics.fillStyle(0x1e3a8a, 1);
      playerGraphics.fillCircle(16, 25, 14);
      playerGraphics.fillRect(2, 15, 28, 20);



      // Wizard hood
      playerGraphics.fillStyle(0x1e40af, 1);
      playerGraphics.fillCircle(16, 12, 10);



      // Hood shadow/depth
      playerGraphics.fillStyle(0x0f172a, 1);
      playerGraphics.fillEllipse(16, 14, 18, 8);



      // Face (visible under hood)
      playerGraphics.fillStyle(0xfbbf24, 1);
      playerGraphics.fillCircle(16, 16, 6);



      // Eyes
      playerGraphics.fillStyle(0x000000, 1);
      playerGraphics.fillCircle(13, 15, 1.5);
      playerGraphics.fillCircle(19, 15, 1.5);



      // Eye glow (magical effect)
      playerGraphics.fillStyle(0x60a5fa, 0.7);
      playerGraphics.fillCircle(13, 15, 2.5);
      playerGraphics.fillCircle(19, 15, 2.5);



      // Robe trim/details
      playerGraphics.fillStyle(0xfbbf24, 1);
      playerGraphics.fillRect(2, 20, 28, 2);
      playerGraphics.fillRect(14, 15, 4, 25);



      // Magical scroll (held in left hand)
      playerGraphics.fillStyle(0xf7fafc, 1);
      playerGraphics.fillRect(8, 22, 6, 8);
      playerGraphics.lineStyle(1, 0x8b5cf6);
      playerGraphics.beginPath();
      playerGraphics.moveTo(9, 24);
      playerGraphics.lineTo(13, 24);
      playerGraphics.moveTo(9, 26);
      playerGraphics.lineTo(13, 26);
      playerGraphics.moveTo(9, 28);
      playerGraphics.lineTo(13, 28);
      playerGraphics.strokePath();



      // Magic staff (held in right hand)
      playerGraphics.lineStyle(3, 0x92400e);
      playerGraphics.beginPath();
      playerGraphics.moveTo(24, 35);
      playerGraphics.lineTo(26, 18);
      playerGraphics.strokePath();



      // Staff crystal/orb at top
      playerGraphics.fillStyle(0x8b5cf6, 0.8);
      playerGraphics.fillCircle(26, 16, 4);
      playerGraphics.fillStyle(0xfbbf24, 0.6);
      playerGraphics.fillCircle(26, 16, 6);



      // Staff decorative elements
      playerGraphics.lineStyle(2, 0xfbbf24);
      playerGraphics.beginPath();
      playerGraphics.moveTo(24, 20);
      playerGraphics.lineTo(28, 20);
      playerGraphics.moveTo(24, 24);
      playerGraphics.lineTo(28, 24);
      playerGraphics.strokePath();



      // Robe bottom (flowing)
      playerGraphics.fillStyle(0x1e3a8a, 1);
      playerGraphics.beginPath();
      playerGraphics.moveTo(5, 35);
      playerGraphics.lineTo(8, 38);
      playerGraphics.lineTo(12, 35);
      playerGraphics.lineTo(16, 38);
      playerGraphics.lineTo(20, 35);
      playerGraphics.lineTo(24, 38);
      playerGraphics.lineTo(27, 35);
      playerGraphics.lineTo(27, 25);
      playerGraphics.lineTo(5, 25);
      playerGraphics.closePath();
      playerGraphics.fillPath();



      // Magical aura particles around character
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = 16 + Math.cos(angle) * 18;
        const y = 25 + Math.sin(angle) * 15;
        playerGraphics.fillStyle(0x8b5cf6, 0.4 + Math.random() * 0.3);
        playerGraphics.fillCircle(x, y, 1 + Math.random() * 2);
      }



      playerGraphics.generateTexture("player", 32, 40);
      playerGraphics.destroy();



      // Create Bug Enemies with Different Colors
      const enemyColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff];



      enemyColors.forEach((color, index) => {
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(color, 1);
        enemyGraphics.fillEllipse(16, 20, 16, 10);
        enemyGraphics.fillCircle(16, 12, 6);
        enemyGraphics.lineStyle(2, color);
        enemyGraphics.beginPath();
        enemyGraphics.moveTo(8, 18);
        enemyGraphics.lineTo(4, 22);
        enemyGraphics.moveTo(8, 22);
        enemyGraphics.lineTo(4, 26);
        enemyGraphics.moveTo(24, 18);
        enemyGraphics.lineTo(28, 22);
        enemyGraphics.moveTo(24, 22);
        enemyGraphics.lineTo(28, 26);
        enemyGraphics.strokePath();
        enemyGraphics.beginPath();
        enemyGraphics.moveTo(14, 8);
        enemyGraphics.lineTo(12, 4);
        enemyGraphics.moveTo(18, 8);
        enemyGraphics.lineTo(20, 4);
        enemyGraphics.strokePath();
        enemyGraphics.fillStyle(0x000000, 1);
        enemyGraphics.fillCircle(13, 12, 1.5);
        enemyGraphics.fillCircle(19, 12, 1.5);



        enemyGraphics.generateTexture(`enemy${index}`, 32, 32);
        enemyGraphics.destroy();
      });



      this.add
        .graphics()
        .fillStyle(0x444444)
        .fillRect(0, 0, 40, 40)
        .generateTexture("wall", 40, 40);
      this.add
        .graphics()
        .fillStyle(0x0a192f)
        .fillRect(0, 0, 800, 500)
        .generateTexture("background", 800, 500);
    }



    function create() {
      this.add.image(400, 250, "background");



      walls = this.physics.add.staticGroup();
      enemies = this.physics.add.group();
      correctCollectible = this.physics.add.group();
      wrongCollectibles = this.physics.add.group();



      player = this.physics.add.sprite(400, 250, "player");
      player.setCollideWorldBounds(true).body.setSize(20, 25).setOffset(6, 10);



      cursors = this.input.keyboard.createCursorKeys();
      spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );



      this.physics.add.collider(player, walls);
      this.physics.add.collider(enemies, walls);
      this.physics.add.collider(enemies, enemies);



      this.physics.add.overlap(
        player,
        correctCollectible,
        collectCorrectItem,
        null,
        this
      );
      this.physics.add.overlap(
        player,
        wrongCollectibles,
        collectWrongItem,
        null,
        this
      );
      this.physics.add.overlap(player, enemies, hitByEnemy, null, this);



      // ⏱️ Create Timer UI in top-right corner
      timerText = this.add
        .text(750, 20, "Time: 20", {
          fontSize: "28px",
          fontFamily: "Courier New",
          color: "#00ff00",
          fontStyle: "bold",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 }
        })
        .setOrigin(1, 0) // Align to top-right
        .setDepth(1000); // Display above game elements



      createLevel.call(this);
      updateReactUI();
    }

    function createLevel() {
      enemies.clear(true, true);
      
      // Clear existing collectibles - PROPERLY destroy graphics and text first!
      // Destroy correct collectible's graphics and text
      correctCollectible.children.entries.forEach(collectible => {
        if (collectible.graphics) collectible.graphics.destroy();
        if (collectible.keywordText) collectible.keywordText.destroy();
      });
      
      // Destroy wrong collectibles' graphics and text
      wrongCollectibles.children.entries.forEach(collectible => {
        if (collectible.graphics) collectible.graphics.destroy();
        if (collectible.keywordText) collectible.keywordText.destroy();
      });
      
      // Now clear the groups (this removes physics sprites)
      correctCollectible.clear(true, true);
      wrongCollectibles.clear(true, true);
      
      walls.clear(true, true);
      gameState.mistakes = 0;
      keywordPositions = [];

      sceneRef.children.list.forEach((child) => {
        if (child.isKeyword) child.destroy();
      });



      // Symmetric wall layout
      const wallPositions = [
        // Outer border walls
        [80, 80],
        [160, 80],
        [240, 80],
        [320, 80],
        [480, 80],
        [560, 80],
        [640, 80],
        [720, 80],
        [80, 420],
        [160, 420],
        [240, 420],
        [320, 420],
        [480, 420],
        [560, 420],
        [640, 420],
        [720, 420],
        [80, 160],
        [80, 240],
        [80, 260],
        [80, 340],
        [720, 160],
        [720, 240],
        [720, 260],
        [720, 340],



        // Symmetric inner walls
        [200, 160],
        [600, 160], // Top inner walls
        [200, 340],
        [600, 340], // Bottom inner walls
        [320, 200],
        [480, 200], // Middle upper
        [320, 300],
        [480, 300], // Middle lower
        [160, 250],
        [640, 250], // Side walls
        [400, 160],
        [400, 340], // Center pillars
      ];
      wallPositions.forEach((pos) => walls.create(pos[0], pos[1], "wall"));



      // --- MODIFIED: Create multiple enemies with different colors ---
      for (let i = 0; i < 3; i++) createEnemy.call(this, i);





      // Create correct keyword first
      createCorrectKeyword.call(this);
      
      // Create 3 wrong keywords (total 4 floating words)
      for (let i = 0; i < 3; i++) {
        createWrongKeyword.call(this);
      }



      player.setPosition(400, 250).setVelocity(0, 0);

      // Notify React component that scene is ready
      if (onSceneReady) {
        onSceneReady(this);
        console.log('🎮 Scene ready callback invoked');
      }
      
      // ⏱️ Start timer for the first question
      startQuestionTimer.call(this);
    }



    // ⏱️ TIMER FUNCTIONS
    
    /**
     * Starts a 20-second countdown timer for the current question
     * - Updates timer text every second
     * - Changes color based on remaining time (green -> yellow -> red)
     * - Automatically treats answer as wrong if time runs out
     */
    function startQuestionTimer() {
      // Reset time to 20 seconds
      currentTime = 20;
      
      // Update timer display
      if (timerText) {
        timerText.setText(`Time: ${currentTime}`);
        timerText.setColor("#00ff00"); // Green color
      }
      
      // Clear any existing timers to prevent overlaps
      stopQuestionTimer.call(this);
      
      // Create repeating 1-second timer event
      timerEvent = this.time.addEvent({
        delay: 1000, // Fire every 1 second (1000ms)
        callback: () => {
          currentTime--;
          
          // Update timer text
          if (timerText) {
            timerText.setText(`Time: ${currentTime}`);
            
            // Change color based on remaining time
            if (currentTime <= 5) {
              timerText.setColor("#ff0000"); // Red when ≤5 seconds
            } else if (currentTime <= 10) {
              timerText.setColor("#ffff00"); // Yellow when ≤10 seconds
            } else {
              timerText.setColor("#00ff00"); // Green when >10 seconds
            }
          }
          
          // If time reaches 0, the timeUpEvent will handle it
        },
        loop: true, // Repeat every second
        callbackScope: this
      });
      
      // Create one-time "time's up" event after 20 seconds
      timeUpEvent = this.time.delayedCall(20000, () => {
        console.log("⏰ Time's up! Treating as wrong answer.");
        
        // Flash the timer
        if (timerText) {
          timerText.setColor("#ff0000");
          this.tweens.add({
            targets: timerText,
            alpha: 0.3,
            duration: 200,
            yoyo: true,
            repeat: 2
          });
        }
        
        // Treat as wrong answer: reduce health and check if should restart
        gameState.mistakes++;
        gameState.health -= 25;
        
        // Flash player red
        if (player) {
          player.setTint(0xff0000);
          this.time.delayedCall(300, () => player.clearTint());
        }
        
        // Check if game over
        if (gameState.mistakes > 1 || gameState.health <= 0) {
          stopQuestionTimer.call(this);
          restartLevel();
        } else {
          // Move to next question
          collectCorrectItem(player, { 
            graphics: { destroy: () => {} }, 
            keywordText: { destroy: () => {} }, 
            destroy: () => {} 
          });
        }
        
        updateReactUI();
      }, [], this);
    }
    
    /**
     * Stops and cleans up all timer events
     * - Removes the repeating countdown timer
     * - Removes the "time's up" delayed call
     * - Prevents memory leaks and unwanted timer callbacks
     */
    function stopQuestionTimer() {
      // Remove repeating timer event
      if (timerEvent) {
        timerEvent.remove();
        timerEvent = null;
      }
      
      // Remove one-time "time's up" event
      if (timeUpEvent) {
        timeUpEvent.remove();
        timeUpEvent = null;
      }
    }



    function createEnemy(enemyIndex = 0) {
      let x, y;
      let attempts = 0;
      do {
        x = Phaser.Math.Between(150, 650);
        y = Phaser.Math.Between(150, 350);
        attempts++;
      } while (
        attempts < 50 &&
        (Phaser.Math.Distance.Between(x, y, player.x, player.y) < 120 ||
          checkWallCollision(x, y) ||
          checkEnemyCollision(x, y))
      );



      // Use different enemy textures with different colors
      const enemyTextureIndex = enemyIndex % 5; // Cycle through 5 different colored bugs
      const enemy = enemies.create(x, y, `enemy${enemyTextureIndex}`);
      enemy.setCollideWorldBounds(true).body.setSize(24, 20).setOffset(4, 8);
      enemy.health = 75;
      enemy.speed = 50 + enemyIndex * 10; // Different speeds for variety
      enemy.enemyType = enemyTextureIndex; // Store enemy type for visual effects



      // Add floating animation
      sceneRef.tweens.add({
        targets: enemy,
        y: enemy.y - 5,
        duration: 1000 + enemyIndex * 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }



    function createKeyword(isCorrect) {
      let x, y;
      let attempts = 0;
      const maxAttempts = 100;
      const minDistance = 150; // Increased for larger bubbles (was 130)

      // Well-separated predefined positions to avoid collisions
      const predefinedPositions = [
        [200, 140], // Top left
        [600, 140], // Top right  
        [140, 280], // Middle left
        [660, 280], // Middle right
        [300, 380], // Bottom left
        [500, 380], // Bottom right
        [140, 380], // Bottom far left
        [660, 380], // Bottom far right
        [350, 140], // Top center-left
        [450, 140], // Top center-right
      ];



      // Filter positions that are available and maintain minimum distance
      const availablePositions = predefinedPositions.filter((pos) => {
        const [posX, posY] = pos;



        // Check distance from player
        if (Phaser.Math.Distance.Between(posX, posY, player.x, player.y) < 150) {
          return false;
        }



        // Check wall collision
        if (checkWallCollision(posX, posY)) {
          return false;
        }



        // Check distance from existing keywords
        for (let keywordPos of keywordPositions) {
          if (
            Phaser.Math.Distance.Between(
              posX,
              posY,
              keywordPos.x,
              keywordPos.y
            ) < minDistance
          ) {
            return false;
          }
        }



        // Check distance from enemies
        for (let enemy of enemies.children.entries) {
          if (
            Phaser.Math.Distance.Between(posX, posY, enemy.x, enemy.y) < 100
          ) {
            return false;
          }
        }



        return true;
      });



      // Use available predefined position if exists, otherwise find random position
      if (availablePositions.length > 0) {
        const selectedPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        x = selectedPosition[0];
        y = selectedPosition[1];
      } else {
        // Fallback to random position with strict distance checking
        do {
          x = Phaser.Math.Between(150, 650);
          y = Phaser.Math.Between(130, 370);
          attempts++;



          const validPosition = 
            Phaser.Math.Distance.Between(x, y, player.x, player.y) >= 150 &&
            !checkWallCollision(x, y) &&
            !checkKeywordCollision(x, y, minDistance) &&
            !checkEnemyCollision(x, y);



          if (validPosition) break;



        } while (attempts < maxAttempts);



        // If we couldn't find a good position, use a safe fallback
        if (attempts >= maxAttempts) {
          const safeFallbacks = [
            [150, 150], [650, 150], [150, 350], [650, 350]
          ];
          const safeFallback = safeFallbacks.find(pos => 
            !checkKeywordCollision(pos[0], pos[1], minDistance)
          );
          if (safeFallback) {
            x = safeFallback[0];
            y = safeFallback[1];
          }
        }
      }



      let keywordText;
      if (isCorrect) {
        // Use the actual correct answer text
        keywordText = query.word;
      } else {
        // Get a random wrong answer
        const wrongOptions = allKeywords.filter(opt => opt !== query.word);
        
        // Filter out already used options
        const usedKeywords = keywordPositions.map(pos => pos.keyword).filter(Boolean);
        const availableOptions = wrongOptions.filter(opt => !usedKeywords.includes(opt));
        
        keywordText = availableOptions[Math.floor(Math.random() * availableOptions.length)] || wrongOptions[0];
      }

      // STEP 1: Create text FIRST to measure its dimensions
      const text = sceneRef.add
        .text(0, 0, keywordText, {
          fontSize: "24px", // Adjusted for longer text
          fontFamily: "Arial, sans-serif",
          color: "#ffffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
          wordWrap: { width: 200, useAdvancedWrap: true }, // Wrap long text
          align: 'center'
        })
        .setOrigin(0.5);
      text.isKeyword = true;

      // STEP 2: Get text dimensions using getBounds()
      const textBounds = text.getBounds();
      const textWidth = textBounds.width;
      const textHeight = textBounds.height;

      // STEP 3: Calculate required shape size with padding
      const padding = 20; // Space around text
      const shapeWidth = textWidth + (padding * 2);
      const shapeHeight = textHeight + (padding * 2);
      
      // Determine if we should use circle or rounded rectangle
      const isShortText = keywordText.length <= 4;
      const radius = isShortText ? Math.max(shapeWidth, shapeHeight) / 2 : Math.min(shapeWidth, shapeHeight) / 2;

      // STEP 4: Create dynamically sized bubble background
      const graphics = sceneRef.add.graphics();
      graphics.fillStyle(0x8a2be2, 0.9);
      graphics.lineStyle(4, 0x9932cc);
      
      if (isShortText) {
        // Circle for very short text
        graphics.fillCircle(0, 0, radius);
        graphics.strokeCircle(0, 0, radius);
      } else {
        // Rounded rectangle for longer text
        const rectWidth = shapeWidth;
        const rectHeight = shapeHeight;
        graphics.fillRoundedRect(-rectWidth/2, -rectHeight/2, rectWidth, rectHeight, 15);
        graphics.strokeRoundedRect(-rectWidth/2, -rectHeight/2, rectWidth, rectHeight, 15);
      }
      
      graphics.setPosition(x, y);
      graphics.isKeyword = true;

      // STEP 5: Position text at the same location
      text.setPosition(x, y);

      // Create physics sprite for collision detection with dynamic size
      const collisionRadius = radius;
      const collectible = sceneRef.physics.add
        .sprite(x, y, null)
        .setVisible(false);
      collectible.body.setCircle(collisionRadius);
      collectible.graphics = graphics;
      collectible.keywordText = text;      // Add to appropriate group
      (isCorrect ? correctCollectible : wrongCollectibles).add(collectible);



      // Store position and keyword for collision checking
      keywordPositions.push({ x, y, keyword: keywordText });



      // Add floating animation to both graphics and text
      sceneRef.tweens.add({
        targets: [graphics, text],
        y: y - 8,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }



    function checkKeywordCollision(x, y, minDistance = 150) {
      for (let pos of keywordPositions) {
        if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < minDistance) {
          return true;
        }
      }

      if (correctCollectible.children.entries.length > 0) {
        const correct = correctCollectible.children.entries[0];
        if (
          Phaser.Math.Distance.Between(x, y, correct.x, correct.y) < minDistance
        ) {
          return true;
        }
      }



      for (let wrong of wrongCollectibles.children.entries) {
        if (
          Phaser.Math.Distance.Between(x, y, wrong.x, wrong.y) < minDistance
        ) {
          return true;
        }
      }



      return false;
    }



    function checkEnemyCollision(x, y) {
      for (let enemy of enemies.children.entries) {
        if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) < 100) {
          return true;
        }
      }
      return false;
    }



    const createCorrectKeyword = () => createKeyword(true);
    const createWrongKeyword = () => createKeyword(false);



    function checkWallCollision(x, y) {
      return walls.children.entries.some(
        (wall) => Phaser.Math.Distance.Between(x, y, wall.x, wall.y) < 80
      );
    }



     function update() {
      if (gameState.isLevelComplete) return;



      player.setVelocity(0);
      const speed = 200;



      // Use the ref instead of state for game logic
      if (cursors.left.isDown || mobileControlsRef.current.left) {
        player.setVelocityX(-speed);
      } else if (cursors.right.isDown || mobileControlsRef.current.right) {
        player.setVelocityX(speed);
      }



      if (cursors.up.isDown || mobileControlsRef.current.up) {
        player.setVelocityY(-speed);
      } else if (cursors.down.isDown || mobileControlsRef.current.down) {
        player.setVelocityY(speed);
      }



      if (
        (Phaser.Input.Keyboard.JustDown(spaceKey) || mobileControlsRef.current.attack) &&
        gameState.canAttack
      ) {
        attack.call(this);
      }



      enemies.children.entries.forEach((enemy) => {
        if (!enemy.active) return;
        this.physics.moveTo(enemy, player.x, player.y, enemy.speed);
      });
    }



    function attack() {
      gameState.canAttack = false;



      const attackRange = 90; // Slightly larger range for magical attack



      // Magical attack effect with wizard theme
      const attackEffect = sceneRef.add.circle(
        player.x,
        player.y,
        attackRange,
        0x8b5cf6,
        0.3
      ); // Purple magic
      const innerEffect = sceneRef.add.circle(
        player.x,
        player.y,
        attackRange * 0.6,
        0xfbbf24,
        0.4
      ); // Golden core



      // Add magical sparkles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const distance = attackRange * 0.8;
        const sparkleX = player.x + Math.cos(angle) * distance;
        const sparkleY = player.y + Math.sin(angle) * distance;



        const sparkle = sceneRef.add.circle(
          sparkleX,
          sparkleY,
          3,
          0xfbbf24,
          0.8
        );
        sceneRef.tweens.add({
          targets: sparkle,
          scaleX: 0,
          scaleY: 0,
          duration: 300,
          onComplete: () => sparkle.destroy(),
        });
      }



      sceneRef.tweens.add({
        targets: attackEffect,
        scaleX: 1.8,
        scaleY: 1.8,
        alpha: 0,
        duration: 250,
        onComplete: () => attackEffect.destroy(),
      });



      sceneRef.tweens.add({
        targets: innerEffect,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 200,
        onComplete: () => innerEffect.destroy(),
      });



      // Add screen flash for magical effect
      sceneRef.cameras.main.flash(
        100,
        139,
        92,
        246,
        false,
        (camera, progress) => {
          if (progress === 1) {
            // Flash complete
          }
        }
      );



      enemies.children.entries.forEach((enemy) => {
        if (!enemy.active) return;



        const distance = Phaser.Math.Distance.Between(
          player.x,
          player.y,
          enemy.x,
          enemy.y
        );
        if (distance <= attackRange) {
          enemy.health -= 60; // Slightly more damage for magical attack



          const angle = Phaser.Math.Angle.Between(
            player.x,
            player.y,
            enemy.x,
            enemy.y
          );
          enemy.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350); // Stronger knockback



          // Magical damage effect
          enemy.setTint(0x8b5cf6); // Purple tint for magic damage
          sceneRef.time.delayedCall(150, () => {
            if (enemy.active) enemy.clearTint();
          });



          if (enemy.health <= 0) {
            // Enhanced explosion with magical effects
            const explosionColors = [
              0xff6b6b, 0x6bff6b, 0x6b6bff, 0xffff6b, 0xff6bff,
            ];
            const explosionColor = explosionColors[enemy.enemyType] || 0xffff00;



            const explosion = sceneRef.add.circle(
              enemy.x,
              enemy.y,
              25,
              explosionColor
            );
            const magicExplosion = sceneRef.add.circle(
              enemy.x,
              enemy.y,
              15,
              0x8b5cf6,
              0.7
            );



            sceneRef.tweens.add({
              targets: explosion,
              scaleX: 4,
              scaleY: 4,
              alpha: 0,
              duration: 400,
              onComplete: () => explosion.destroy(),
            });



            sceneRef.tweens.add({
              targets: magicExplosion,
              scaleX: 3,  
              scaleY: 3,
              alpha: 0,
              duration: 300,
              onComplete: () => magicExplosion.destroy(),
            });



            enemy.destroy();
          }
        }
      });



      sceneRef.time.delayedCall(gameState.attackCooldown, () => {
        gameState.canAttack = true;
      });
    }



    function collectCorrectItem(player, collectible) {
      // ⏱️ Stop the timer immediately when correct answer is collected
      stopQuestionTimer.call(sceneRef);
      
      collectible.graphics.destroy();
      collectible.keywordText.destroy();
      collectible.destroy();

      // Increment questions answered
      gameState.questionsAnswered++;
      currentQuestionIndex++;

      console.log(`✅ Correct answer! Questions answered: ${gameState.questionsAnswered}/${gameState.totalQuestions}`);

      // Check if there are more questions
      if (currentQuestionIndex < questions.length) {
        // Load next question
        currentQuestion = getCurrentQuestion();
        query.text = currentQuestion.question;
        query.word = currentQuestion.correctAnswer;

        // 🔥 EMIT EVENT TO REACT: Notify UI that question has changed
        // Defensive check: Ensure sceneRef and events are available
        if (sceneRef && sceneRef.events) {
          console.log('PHASER IS SENDING: Event updateQuestion with index:', currentQuestionIndex);
          sceneRef.events.emit('updateQuestion', { 
            questionIndex: currentQuestionIndex 
          });
          console.log(`📢 Emitted updateQuestion event with index: ${currentQuestionIndex}`);
        } else {
          console.error('❌ ERROR: Cannot emit event - sceneRef or sceneRef.events is unavailable!');
          console.error('sceneRef:', sceneRef);
        }

        // Update wrong keywords list for the new question
        allKeywords.length = 0; // Clear array
        const newWrongOptions = currentQuestion.options 
          ? currentQuestion.options.filter(opt => opt !== currentQuestion.correctAnswer)
          : ["SELECT", "WHERE", "UPDATE", "DELETE", "ORDER BY", "GROUP BY", "HAVING", "JOIN"];
        allKeywords.push(...newWrongOptions);

        // Clear existing collectibles - PROPERLY destroy graphics and text first!
        // Destroy correct collectible's graphics and text
        correctCollectible.children.entries.forEach(collectible => {
          if (collectible.graphics) collectible.graphics.destroy();
          if (collectible.keywordText) collectible.keywordText.destroy();
        });
        
        // Destroy wrong collectibles' graphics and text
        wrongCollectibles.children.entries.forEach(collectible => {
          if (collectible.graphics) collectible.graphics.destroy();
          if (collectible.keywordText) collectible.keywordText.destroy();
        });
        
        // Now clear the groups (this removes physics sprites)
        correctCollectible.clear(true, true);
        wrongCollectibles.clear(true, true);
        keywordPositions = [];

        // Show next question message
        const nextQuestionText = sceneRef.add
          .text(400, 250, `Question ${currentQuestionIndex + 1}/${questions.length}\n\n${currentQuestion.question}`, {
            fontSize: "24px",
            fontFamily: "Courier New",
            color: "#00ff00",
            fontStyle: "bold",
            align: "center",
            wordWrap: { width: 700 }
          })
          .setOrigin(0.5)
          .setDepth(1001)
          .setAlpha(0);

        // Fade in and out
        sceneRef.tweens.add({
          targets: nextQuestionText,
          alpha: 1,
          duration: 500,
          yoyo: true,
          hold: 2000,
          onComplete: () => {
            nextQuestionText.destroy();
            // Create new collectibles for the new question
            createCorrectKeyword.call(sceneRef);
            for (let i = 0; i < 3; i++) {
              createWrongKeyword.call(sceneRef);
            }
            // ⏱️ Start timer for the new question
            startQuestionTimer.call(sceneRef);
          }
        });

        updateReactUI();
      } else {
        // All questions answered - level complete!
        // ⏱️ Stop timer when quiz is complete
        stopQuestionTimer.call(sceneRef);
        
        gameState.isLevelComplete = true;
        updateReactUI();
        showLevelComplete();
      }
    }

    function showLevelComplete() {
      const overlay = sceneRef.add.rectangle(400, 250, 800, 500, 0x000000, 0.8);
      overlay.setDepth(1000);

      const completionText = sceneRef.add
        .text(400, 150, "🎉 Quiz Complete! 🎉", {
          fontSize: "32px",
          fontFamily: "Courier New",
          color: "#00ff00",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(1001);

      const scoreText = sceneRef.add
        .text(400, 220, `Questions Answered: ${gameState.questionsAnswered}/${gameState.totalQuestions}`, {
          fontSize: "24px",
          fontFamily: "Courier New",
          color: "#00d2ff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(1001);

      const healthText = sceneRef.add
        .text(400, 270, `Final Health: ${gameState.health}/100`, {
          fontSize: "20px",
          fontFamily: "Courier New",
          color: "#ff69b4",
        })
        .setOrigin(0.5)
        .setDepth(1001);

      const instructionText = sceneRef.add
        .text(400, 350, "Click to return to menu", {
          fontSize: "24px",
          fontFamily: "Courier New",
          color: "#00ff00",
        })
        .setOrigin(0.5)
        .setDepth(1001);

      overlay.setInteractive();
      overlay.on("pointerdown", () => {
        onComplete();
      });

      sceneRef.tweens.add({
        targets: instructionText,
        alpha: 0.5,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    }

    function collectWrongItem(player, collectible) {
      // ⏱️ Stop the timer when wrong answer is collected
      stopQuestionTimer.call(sceneRef);
      
      collectible.graphics.destroy();
      collectible.keywordText.destroy();
      collectible.destroy();



      gameState.mistakes++;
      gameState.health -= 25;



      player.setTint(0xff0000);
      sceneRef.time.delayedCall(200, () => player.clearTint());



      if (gameState.mistakes > 1 || gameState.health <= 0) {
        restartLevel();
      }
      updateReactUI();
    }

    function restartLevel() {
      // ⏱️ Stop any running timers before restart
      stopQuestionTimer.call(sceneRef);
      
      const restartText = sceneRef.add
        .text(400, 250, "Too many mistakes... Try Again!", {
          fontSize: "24px",
          fontFamily: "Courier New",
          color: "#ff4444",
          backgroundColor: "#000000",
        })
        .setOrigin(0.5);



      sceneRef.cameras.main.flash(500, 255, 0, 0);
      gameState.health = 100;



      sceneRef.time.delayedCall(1500, () => {
        restartText.destroy();
        createLevel.call(sceneRef);
        updateReactUI();
      });
    }

    function hitByEnemy(player, enemy) {
      if (enemy.lastAttack && sceneRef.time.now - enemy.lastAttack < 1000)
        return;



      enemy.lastAttack = sceneRef.time.now;
      gameState.health -= 15;



      player.setTint(0xff0000);
      sceneRef.time.delayedCall(200, () => player.clearTint());



      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        player.x,
        player.y
      );
      player.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);



      if (gameState.health <= 0) {
        restartLevel();
      }
      updateReactUI();
    }



     function updateReactUI() {
      setUiState({
        health: Math.max(0, gameState.health),
        isQueryComplete: gameState.isLevelComplete,
        currentQuestion: currentQuestion,
        questionsAnswered: gameState.questionsAnswered,
        totalQuestions: gameState.totalQuestions,
      });
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 500,
      parent: gameContainerRef.current,
      physics: { default: "arcade", arcade: { gravity: { y: 0 } } },
      scene: { preload, create, update },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };



    gameInstance.current = new Phaser.Game(config);



    return () => {
      gameInstance.current?.destroy(true);
    };
  }, [onComplete]);




  return (
        <div className="w-full flex flex-col items-center gap-4 text-white">
      {/* Display the icons as reference in the UI */}
      <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <span className="text-xs text-yellow-300">🧙</span>
          </div>
          <span>Your Wizard</span>
        </div>
        <div className="flex items-center gap-2">
          <AiFillBug size={20} color="#ff4444" />
          <span>Bug Enemies</span>
        </div>
      </div>

      {/* Question Progress */}
      <div className="w-full max-w-3xl p-3 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-500/50 text-center">
        <div className="pixel-font text-blue-200 text-sm mb-1">
          Question {uiState.questionsAnswered + 1} of {uiState.totalQuestions}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(uiState.questionsAnswered / uiState.totalQuestions) * 100}%` }}
          />
        </div>
      </div>



      {/* Responsive game container */}
      <div className="w-full max-w-4xl">
        <div
          ref={gameContainerRef}
          className="w-full aspect-[8/5] rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg mx-auto"
          style={{ maxWidth: "800px" }}
        />
      </div>



      <div className="w-full max-w-3xl flex justify-between items-center pixel-font text-lg">
        <div>
          Health: <span className="text-rose-400">{uiState.health}/100</span>
        </div>
      </div>



      <div className="w-full max-w-3xl p-4 bg-black/50 rounded-lg border border-slate-700">
        <div className="pixel-font text-slate-300 mb-2 text-center">Current Question:</div>
        <div className="font-mono text-lg text-center mb-3 text-cyan-300">
          {uiState.currentQuestion?.question || "Loading question..."}
        </div>
        <div className="text-sm text-slate-400 text-center">
          Collect the correct answer: <span className="text-green-400 font-bold">{uiState.currentQuestion?.correctAnswer}</span>
        </div>
        {uiState.isQueryComplete && (
          <div className="mt-3 text-center">
            <span className="text-green-400 font-bold bg-green-900/50 px-3 py-1 rounded">✓ All Questions Complete!</span>
          </div>
        )}
      </div>

      {/* Use the reusable MobileControls component */}
      <MobileControls 
        mobileControlsRef={mobileControlsRef}
        setMobileControls={setMobileControls}
      />



      <style >{`
        .pixel-font {
          font-family: "Courier New", monospace;
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
};



export default Level1;