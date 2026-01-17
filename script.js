// Enhanced DOM Elements
const statusText = document.getElementById("status");
const startBtn = document.getElementById("start");
const restartBtn = document.getElementById("restart");
const playerInput = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const difficultySelect = document.getElementById("difficulty");
const gameBoard = document.getElementById("gameBoard");
const hintsBtn = document.getElementById("hints");
const undoBtn = document.getElementById("undo");
const saveBtn = document.getElementById("saveGame");
const loadBtn = document.getElementById("loadGame");
const settingsToggle = document.getElementById("settingsToggle");
const settingsPanel = document.getElementById("settingsPanel");
const soundToggle = document.getElementById("soundToggle");
const animationToggle = document.getElementById("animationToggle");
const particleToggle = document.getElementById("particleToggle");
const turnIndicator = document.getElementById("turnIndicator");
const achievementsGrid = document.getElementById("achievementsGrid");

// Enhanced Audio System
const sounds = {
  click: document.getElementById("clickSound"),
  win: document.getElementById("winSound"),
  draw: document.getElementById("drawSound"),
  hover: document.getElementById("hoverSound"),
  achievement: document.getElementById("achievementSound"),
  countdown: document.getElementById("countdownSound")
};

// Game State Management
let gameState = {
  board: [],
  boardSize: 3,
  gameActive: false,
  currentPlayer: "X",
  gameMode: "ai", // ai, pvp, tournament
  difficulty: "medium",
  moveHistory: [],
  gameStartTime: null,
  theme: "default",
  settings: {
    sound: true,
    animations: true,
    particles: true
  },
  players: {
    player1: { name: "Player 1", symbol: "X", avatar: "👤" },
    player2: { name: "AI", symbol: "O", avatar: "🤖" }
  }
};

// Statistics and Achievements
let statistics = {
  gamesPlayed: 0,
  player1Wins: 0,
  player2Wins: 0,
  draws: 0,
  currentStreak: { player: null, count: 0 },
  bestStreak: { player: null, count: 0 },
  totalGameTime: 0,
  achievements: new Set(),
  difficultyStats: { easy: 0, medium: 0, hard: 0, adaptive: 0 }
};

// Dynamic Win Combinations
function generateWinCombos(size) {
  const combos = [];
  
  // Rows
  for (let row = 0; row < size; row++) {
    const rowCombo = [];
    for (let col = 0; col < size; col++) {
      rowCombo.push(row * size + col);
    }
    combos.push(rowCombo);
  }
  
  // Columns
  for (let col = 0; col < size; col++) {
    const colCombo = [];
    for (let row = 0; row < size; row++) {
      colCombo.push(row * size + col);
    }
    combos.push(colCombo);
  }
  
  // Diagonals
  const mainDiag = [];
  const antiDiag = [];
  for (let i = 0; i < size; i++) {
    mainDiag.push(i * size + i);
    antiDiag.push(i * size + (size - 1 - i));
  }
  combos.push(mainDiag);
  combos.push(antiDiag);
  
  return combos;
}

let winCombos = generateWinCombos(3);

// Enhanced Achievements System
const achievementsList = [
  { id: 'firstWin', name: 'First Victory', description: 'Win your first game', icon: '🎉' },
  { id: 'winStreak3', name: 'On Fire', description: 'Win 3 games in a row', icon: '🔥' },
  { id: 'winStreak5', name: 'Unstoppable', description: 'Win 5 games in a row', icon: '⚡' },
  { id: 'beatHard', name: 'AI Slayer', description: 'Beat Hard difficulty AI', icon: '🤖' },
  { id: 'speedWin', name: 'Lightning Fast', description: 'Win in under 30 seconds', icon: '⚡' },
  { id: 'comebackKid', name: 'Comeback Kid', description: 'Win after being behind', icon: '💪' },
  { id: 'perfectGame', name: 'Perfectionist', description: 'Win without opponent scoring', icon: '💎' },
  { id: 'centurian', name: 'Centurion', description: 'Play 100 games', icon: '💯' },
  { id: 'adaptive', name: 'Adaptive Master', description: 'Beat Adaptive AI', icon: '🧠' },
  { id: 'largeBoard', name: 'Big League', description: 'Win on 5x5 board', icon: '🏟️' }
];

// Initialize Game
document.addEventListener('DOMContentLoaded', initializeGame);

function initializeGame() {
  loadStatistics();
  initializeBoard();
  setupEventListeners();
  setupThemes();
  setupParticles();
  updateAchievements();
  updateStatisticsDisplay();
}

// Event Listeners Setup
function setupEventListeners() {
  // Game Mode Selection
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      gameState.gameMode = e.target.dataset.mode;
      updateGameModeUI();
    });
  });

  // Board Size Selection
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      gameState.boardSize = parseInt(e.target.dataset.size);
      updateBoardSize();
    });
  });

  // Theme Selection
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      gameState.theme = e.target.dataset.theme;
      applyTheme(gameState.theme);
      saveStatistics();
    });
  });

  // Game Controls
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', resetGame);
  hintsBtn.addEventListener('click', showHint);
  undoBtn.addEventListener('click', undoLastMove);
  saveBtn.addEventListener('click', saveGameState);
  loadBtn.addEventListener('click', loadGameState);

  // Settings
  settingsToggle.addEventListener('click', toggleSettings);
  soundToggle.addEventListener('change', (e) => {
    gameState.settings.sound = e.target.checked;
    saveStatistics();
  });
  animationToggle.addEventListener('change', (e) => {
    gameState.settings.animations = e.target.checked;
    document.body.classList.toggle('no-animations', !e.target.checked);
    saveStatistics();
  });
  particleToggle.addEventListener('change', (e) => {
    gameState.settings.particles = e.target.checked;
    toggleParticles(e.target.checked);
    saveStatistics();
  });
}

// Game Mode UI Updates
function updateGameModeUI() {
  const isAI = gameState.gameMode === 'ai';
  const isPvP = gameState.gameMode === 'pvp';
  
  player2Input.style.display = isPvP ? 'inline-block' : 'none';
  difficultySelect.style.display = isAI ? 'inline-block' : 'none';
  hintsBtn.style.display = isAI && gameState.difficulty !== 'easy' ? 'inline-block' : 'none';
  
  if (isPvP) {
    gameState.players.player2.name = player2Input.value || 'Player 2';
    gameState.players.player2.avatar = '👥';
    document.getElementById('player2Name').textContent = gameState.players.player2.name;
  } else {
    gameState.players.player2.name = 'AI';
    gameState.players.player2.avatar = '🤖';
    document.getElementById('player2Name').textContent = 'AI';
  }
}

// Dynamic Board Management
function initializeBoard() {
  gameState.board = Array(gameState.boardSize * gameState.boardSize).fill('');
  updateBoardSize();
}

function updateBoardSize() {
  const size = gameState.boardSize;
  winCombos = generateWinCombos(size);
  
  // Clear existing board
  gameBoard.innerHTML = '';
  gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  
  // Create new cells
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => handleMove(i));
    cell.addEventListener('mouseenter', () => playSound('hover'));
    gameBoard.appendChild(cell);
  }
  
  gameState.board = Array(size * size).fill('');
  
  // Adjust cell size based on board size
  const cellSize = size === 3 ? '100px' : size === 4 ? '80px' : '65px';
  document.documentElement.style.setProperty('--cell-size', cellSize);
}

// Enhanced Game Control
function startGame() {
  gameState.players.player1.name = playerInput.value || 'Player 1';
  if (gameState.gameMode === 'pvp') {
    gameState.players.player2.name = player2Input.value || 'Player 2';
  }
  
  gameState.difficulty = difficultySelect.value;
  gameState.gameActive = true;
  gameState.currentPlayer = 'X';
  gameState.gameStartTime = Date.now();
  gameState.moveHistory = [];
  
  updatePlayerNames();
  updateTurnIndicator();
  statusText.textContent = `${gameState.players.player1.name}'s turn`;
  
  // Game start animation
  if (gameState.settings.animations) {
    anime({
      targets: '.cell',
      scale: [0.8, 1],
      opacity: [0.5, 1],
      delay: anime.stagger(50),
      duration: 300,
      easing: 'easeOutQuad'
    });
  }
  
  startBtn.style.display = 'none';
  undoBtn.style.display = gameState.gameMode === 'pvp' ? 'inline-block' : 'none';
  
  playSound('countdown');
}

function handleMove(index) {
  if (!gameState.gameActive || gameState.board[index] !== '') return;
  
  const cell = gameBoard.children[index];
  gameState.board[index] = gameState.currentPlayer;
  gameState.moveHistory.push({ index, player: gameState.currentPlayer, timestamp: Date.now() });
  
  // Enhanced cell animation
  if (gameState.settings.animations) {
    anime({
      targets: cell,
      scale: [1.3, 1],
      rotateZ: [180, 0],
      duration: 400,
      easing: 'easeOutElastic(1, .8)',
      complete: () => {
        cell.textContent = gameState.currentPlayer;
        cell.classList.add('filled');
      }
    });
  } else {
    cell.textContent = gameState.currentPlayer;
    cell.classList.add('filled');
  }
  
  playSound('click');
  
  // Check for win or draw
  if (checkWin(gameState.currentPlayer)) {
    handleGameEnd('win');
    return;
  }
  
  if (isDraw()) {
    handleGameEnd('draw');
    return;
  }
  
  // Switch players
  switchPlayer();
  
  // AI move for AI mode
  if (gameState.gameMode === 'ai' && gameState.currentPlayer === 'O') {
    setTimeout(() => aiMove(), 500);
  }
}

function switchPlayer() {
  gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
  updateTurnIndicator();
  
  const currentPlayerName = gameState.currentPlayer === 'X' ? 
    gameState.players.player1.name : gameState.players.player2.name;
  
  statusText.textContent = `${currentPlayerName}'s turn`;
  
  // Turn indicator animation
  if (gameState.settings.animations) {
    anime({
      targets: '#turnIndicator',
      translateX: gameState.currentPlayer === 'X' ? -50 : 50,
      duration: 300,
      easing: 'easeOutQuad'
    });
  }
}

function updateTurnIndicator() {
  turnIndicator.textContent = gameState.currentPlayer;
  turnIndicator.className = `turn-indicator player-${gameState.currentPlayer.toLowerCase()}`;
}

// Enhanced AI System
function aiMove() {
  if (!gameState.gameActive) return;
  
  const difficulty = gameState.difficulty;
  let move;
  
  switch (difficulty) {
    case 'easy':
      move = randomMove();
      break;
    case 'medium':
      move = mediumMove();
      break;
    case 'hard':
      move = bestMoveMinimax();
      break;
    case 'adaptive':
      move = adaptiveMove();
      break;
    default:
      move = mediumMove();
  }
  
  if (move !== undefined) {
    handleMove(move);
  }
}

function randomMove() {
  const empty = gameState.board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function mediumMove() {
  // 70% chance to make optimal move, 30% random
  if (Math.random() < 0.7) {
    return bestMoveMinimax();
  }
  return randomMove();
}

function adaptiveMove() {
  // Adapts based on player performance
  const playerWinRate = statistics.player1Wins / (statistics.gamesPlayed || 1);
  
  if (playerWinRate > 0.7) {
    return bestMoveMinimax(); // Player is winning too much, play optimally
  } else if (playerWinRate < 0.3) {
    return Math.random() < 0.5 ? mediumMove() : randomMove(); // Give player a chance
  } else {
    return mediumMove(); // Balanced play
  }
}

function bestMoveMinimax() {
  let bestScore = -Infinity;
  let move;
  const depth = gameState.boardSize === 3 ? 9 : 5; // Limit depth for larger boards

  for (let i = 0; i < gameState.board.length; i++) {
    if (gameState.board[i] === '') {
      gameState.board[i] = 'O';
      let score = minimax(gameState.board, 0, false, -Infinity, Infinity, depth);
      gameState.board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(boardState, depth, isMax, alpha, beta, maxDepth) {
  const oWin = checkWinner('O');
  const xWin = checkWinner('X');
  
  if (oWin) return 10 - depth;
  if (xWin) return depth - 10;
  if (boardState.every(c => c !== '') || depth >= maxDepth) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = 'O';
        best = Math.max(best, minimax(boardState, depth + 1, false, alpha, beta, maxDepth));
        boardState[i] = '';
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === '') {
        boardState[i] = 'X';
        best = Math.min(best, minimax(boardState, depth + 1, true, alpha, beta, maxDepth));
        boardState[i] = '';
        beta = Math.min(beta, best);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return best;
  }
}

function checkWin(player) {
  const winningCombo = winCombos.find(combo => 
    combo.every(i => gameState.board[i] === player)
  );
  
  return winningCombo || false;
}

function checkWinner(player) {
  return winCombos.some(combo =>
    combo.every(i => gameState.board[i] === player)
  );
}

function highlightWinningCells(player) {
  const winningCombo = checkWin(player);
  if (winningCombo) {
    winningCombo.forEach((index, i) => {
      const cell = gameBoard.children[index];
      cell.classList.add('win');
      
      if (gameState.settings.animations) {
        anime({
          targets: cell,
          scale: [1, 1.1, 1],
          boxShadow: ['0 0 0px rgba(255,215,0,0)', '0 0 20px rgba(255,215,0,1)', '0 0 10px rgba(255,215,0,0.5)'],
          delay: i * 100,
          duration: 600,
          easing: 'easeOutElastic(1, .8)'
        });
      }
    });
  }
}

function isDraw() {
  return gameState.board.every(cell => cell !== '');
}

// Enhanced Game End Handling
function handleGameEnd(result) {
  gameState.gameActive = false;
  const gameTime = (Date.now() - gameState.gameStartTime) / 1000;
  
  statistics.gamesPlayed++;
  statistics.totalGameTime += gameTime;
  
  if (result === 'win') {
    const winner = gameState.currentPlayer;
    const winnerName = winner === 'X' ? gameState.players.player1.name : gameState.players.player2.name;
    
    // Update win statistics
    if (winner === 'X') {
      statistics.player1Wins++;
      updateStreak('player1');
    } else {
      statistics.player2Wins++;
      updateStreak('player2');
    }
    
    // Update difficulty stats
    if (gameState.gameMode === 'ai') {
      statistics.difficultyStats[gameState.difficulty]++;
    }
    
    // Victory animation and effects
    highlightWinningCells(winner);
    statusText.textContent = `${winnerName} wins! 🎉`;
    
    playSound('win');
    
    if (gameState.settings.particles) {
      createVictoryEffect();
    }
    
    // Check achievements
    checkAchievements(winner, gameTime);
    
  } else if (result === 'draw') {
    statistics.draws++;
    statistics.currentStreak = { player: null, count: 0 };
    statusText.textContent = "It's a Draw! 🤝";
    playSound('draw');
  }
  
  updateStatisticsDisplay();
  saveStatistics();
  startBtn.style.display = 'inline-block';
  startBtn.textContent = '🎮 Play Again';
}

function updateStreak(player) {
  if (statistics.currentStreak.player === player) {
    statistics.currentStreak.count++;
  } else {
    statistics.currentStreak = { player, count: 1 };
  }
  
  if (statistics.currentStreak.count > statistics.bestStreak.count) {
    statistics.bestStreak = { ...statistics.currentStreak };
  }
}

function createVictoryEffect() {
  // Enhanced confetti effect
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
  
  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors
  });
  
  // Burst effect from multiple points
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: colors
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: colors
    });
  }, 200);
}

function resetGame() {
  gameState.board.fill('');
  gameState.gameActive = true;
  gameState.currentPlayer = 'X';
  gameState.moveHistory = [];
  gameState.gameStartTime = Date.now();
  
  // Clear board display
  Array.from(gameBoard.children).forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win', 'filled', 'hint');
  });
  
  updateTurnIndicator();
  statusText.textContent = `${gameState.players.player1.name}'s turn`;
  
  // Reset button states
  startBtn.style.display = 'none';
  undoBtn.style.display = gameState.gameMode === 'pvp' ? 'inline-block' : 'none';
}
