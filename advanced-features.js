// Advanced Features for Ultimate Tic Tac Toe

// Statistics and Data Management
function updateStatisticsDisplay() {
  document.getElementById('gamesPlayed').textContent = statistics.gamesPlayed;
  document.getElementById('winRate').textContent = 
    statistics.gamesPlayed > 0 ? 
    Math.round((statistics.player1Wins / statistics.gamesPlayed) * 100) + '%' : '0%';
  document.getElementById('bestStreak').textContent = statistics.bestStreak.count;
  document.getElementById('avgTime').textContent = 
    statistics.gamesPlayed > 0 ? 
    Math.round(statistics.totalGameTime / statistics.gamesPlayed) + 's' : '0s';

  // Update player cards
  document.getElementById('player1Score').textContent = statistics.player1Wins;
  document.getElementById('player2Score').textContent = statistics.player2Wins;
  
  const currentP1Streak = statistics.currentStreak.player === 'player1' ? statistics.currentStreak.count : 0;
  const currentP2Streak = statistics.currentStreak.player === 'player2' ? statistics.currentStreak.count : 0;
  
  document.getElementById('player1Streak').textContent = `Streak: ${currentP1Streak}`;
  document.getElementById('player2Streak').textContent = `Streak: ${currentP2Streak}`;
}

function updatePlayerNames() {
  document.getElementById('player1Name').textContent = gameState.players.player1.name;
  document.getElementById('player2Name').textContent = gameState.players.player2.name;
}

// Achievement System
function checkAchievements(winner, gameTime) {
  const newAchievements = [];
  
  // First Win
  if (winner === 'X' && statistics.player1Wins === 1 && !statistics.achievements.has('firstWin')) {
    newAchievements.push('firstWin');
  }
  
  // Win Streaks
  if (statistics.currentStreak.count === 3 && !statistics.achievements.has('winStreak3')) {
    newAchievements.push('winStreak3');
  }
  if (statistics.currentStreak.count === 5 && !statistics.achievements.has('winStreak5')) {
    newAchievements.push('winStreak5');
  }
  
  // Beat Hard AI
  if (winner === 'X' && gameState.gameMode === 'ai' && gameState.difficulty === 'hard' && !statistics.achievements.has('beatHard')) {
    newAchievements.push('beatHard');
  }
  
  // Beat Adaptive AI
  if (winner === 'X' && gameState.gameMode === 'ai' && gameState.difficulty === 'adaptive' && !statistics.achievements.has('adaptive')) {
    newAchievements.push('adaptive');
  }
  
  // Speed Win (under 30 seconds)
  if (winner === 'X' && gameTime < 30 && !statistics.achievements.has('speedWin')) {
    newAchievements.push('speedWin');
  }
  
  // Large Board Win
  if (winner === 'X' && gameState.boardSize === 5 && !statistics.achievements.has('largeBoard')) {
    newAchievements.push('largeBoard');
  }
  
  // Centurion (100 games)
  if (statistics.gamesPlayed === 100 && !statistics.achievements.has('centurian')) {
    newAchievements.push('centurian');
  }
  
  // Add new achievements
  newAchievements.forEach(id => {
    statistics.achievements.add(id);
    showAchievementNotification(id);
  });
  
  if (newAchievements.length > 0) {
    updateAchievements();
  }
}

function showAchievementNotification(achievementId) {
  const achievement = achievementsList.find(a => a.id === achievementId);
  if (!achievement) return;
  
  playSound('achievement');
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-info">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.description}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  if (gameState.settings.animations) {
    anime({
      targets: notification,
      translateX: [300, 0],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutQuad',
      complete: () => {
        setTimeout(() => {
          anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 500,
            easing: 'easeInQuad',
            complete: () => notification.remove()
          });
        }, 3000);
      }
    });
  } else {
    setTimeout(() => notification.remove(), 4000);
  }
}

function updateAchievements() {
  achievementsGrid.innerHTML = '';
  
  achievementsList.forEach(achievement => {
    const earned = statistics.achievements.has(achievement.id);
    const achievementEl = document.createElement('div');
    achievementEl.className = `achievement ${earned ? 'earned' : 'locked'}`;
    achievementEl.innerHTML = `
      <div class="achievement-icon">${earned ? achievement.icon : '🔒'}</div>
      <div class="achievement-name">${earned ? achievement.name : '???'}</div>
      <div class="achievement-desc">${earned ? achievement.description : 'Hidden Achievement'}</div>
    `;
    achievementsGrid.appendChild(achievementEl);
  });
}

// Theme System
function setupThemes() {
  const savedTheme = localStorage.getItem('ticTacToeTheme') || 'default';
  gameState.theme = savedTheme;
  applyTheme(savedTheme);
}

function applyTheme(themeName) {
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${themeName}`);
  
  // Update active theme button
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === themeName);
  });
  
  localStorage.setItem('ticTacToeTheme', themeName);
}

// Particle System
function setupParticles() {
  if (typeof particlesJS !== 'undefined' && gameState.settings.particles) {
    particlesJS('particles', {
      particles: {
        number: { value: 50 },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: { value: 0.1 },
        size: { value: 3 },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          out_mode: 'out'
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' }
        }
      }
    });
  }
}

function toggleParticles(enabled) {
  const particlesEl = document.getElementById('particles');
  particlesEl.style.display = enabled ? 'block' : 'none';
  if (enabled) {
    setupParticles();
  }
}

// Utility Functions
function playSound(soundName) {
  if (gameState.settings.sound && sounds[soundName]) {
    sounds[soundName].currentTime = 0;
    sounds[soundName].play().catch(e => console.log('Sound play failed:', e));
  }
}

function toggleSettings() {
  settingsPanel.classList.toggle('open');
}

function showHint() {
  if (gameState.gameMode !== 'ai' || gameState.currentPlayer !== 'X') return;
  
  const bestMove = bestMoveMinimax();
  if (bestMove !== undefined) {
    const cell = gameBoard.children[bestMove];
    cell.classList.add('hint');
    
    setTimeout(() => {
      cell.classList.remove('hint');
    }, 2000);
  }
}

function undoLastMove() {
  if (gameState.moveHistory.length < 2) return;
  
  // Remove last two moves (player + AI/opponent)
  const movesToRemove = gameState.gameMode === 'ai' ? 2 : 1;
  
  for (let i = 0; i < movesToRemove && gameState.moveHistory.length > 0; i++) {
    const lastMove = gameState.moveHistory.pop();
    gameState.board[lastMove.index] = '';
    gameBoard.children[lastMove.index].textContent = '';
    gameBoard.children[lastMove.index].classList.remove('filled');
  }
  
  gameState.currentPlayer = 'X';
  updateTurnIndicator();
}

// Save/Load System
function saveGameState() {
  const saveData = {
    gameState,
    statistics,
    timestamp: Date.now()
  };
  
  localStorage.setItem('ticTacToeSave', JSON.stringify(saveData));
  
  // Show save confirmation
  const notification = document.createElement('div');
  notification.className = 'save-notification';
  notification.textContent = '💾 Game Saved!';
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 2000);
}

function loadGameState() {
  const saveData = localStorage.getItem('ticTacToeSave');
  if (!saveData) {
    alert('No saved game found!');
    return;
  }
  
  try {
    const data = JSON.parse(saveData);
    Object.assign(gameState, data.gameState);
    Object.assign(statistics, data.statistics);
    
    // Restore board state
    initializeBoard();
    gameState.board.forEach((value, index) => {
      if (value) {
        gameBoard.children[index].textContent = value;
        gameBoard.children[index].classList.add('filled');
      }
    });
    
    updateStatisticsDisplay();
    updateTurnIndicator();
    
    alert('Game loaded successfully!');
  } catch (e) {
    alert('Failed to load game!');
  }
}

// Data Persistence
function saveStatistics() {
  const data = {
    statistics: {
      ...statistics,
      achievements: Array.from(statistics.achievements)
    },
    settings: gameState.settings,
    theme: gameState.theme
  };
  
  localStorage.setItem('ticTacToeStats', JSON.stringify(data));
}

function loadStatistics() {
  const data = localStorage.getItem('ticTacToeStats');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      Object.assign(statistics, parsed.statistics);
      statistics.achievements = new Set(parsed.statistics.achievements || []);
      
      if (parsed.settings) {
        Object.assign(gameState.settings, parsed.settings);
        soundToggle.checked = gameState.settings.sound;
        animationToggle.checked = gameState.settings.animations;
        particleToggle.checked = gameState.settings.particles;
      }
      
      if (parsed.theme) {
        gameState.theme = parsed.theme;
      }
    } catch (e) {
      console.log('Failed to load statistics:', e);
    }
  }
}