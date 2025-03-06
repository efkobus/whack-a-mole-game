// Game state variables and DOM references
let gameBoard, scoreDisplay, finalScoreDisplay, timerDisplay, startButton, 
    hitSound, missSound, gameOverSound, modal, playAgainButton, 
    highScoreMessage, difficultyButtons;

// Game state
let score = 0;
let timer = 30;
let moleInterval;
let gameActive = false;
let currentLevel = 1;
let highScore = 0;
let timerInterval;
let moleTimeout;
let consecutiveHits = 0;
let currentDifficulty = 'easy';

/**
 * Game difficulty settings
 * @type {Object.<string, GameDifficulty>}
 */
const difficulties = {
    easy: {
        baseSpeed: 1200,
        speedDecreasePerLevel: 100,
        minSpeed: 800,
        maxActiveMoles: 1,
        levelUpThreshold: 50,
        timeVisible: 0.8
    },
    medium: {
        baseSpeed: 1000,
        speedDecreasePerLevel: 150,
        minSpeed: 600,
        maxActiveMoles: 2,
        levelUpThreshold: 70,
        timeVisible: 0.7
    },
    hard: {
        baseSpeed: 800,
        speedDecreasePerLevel: 200,
        minSpeed: 400,
        maxActiveMoles: 3,
        levelUpThreshold: 100,
        timeVisible: 0.6
    }
};

/**
 * Initializes the game by setting up DOM references and event listeners
 */
function init() {
    if (typeof window !== 'undefined') {
        // Initialize DOM references
        gameBoard = document.querySelector('.game-board');
        scoreDisplay = document.getElementById('score');
        finalScoreDisplay = document.getElementById('final-score');
        timerDisplay = document.getElementById('time');
        startButton = document.getElementById('start-button');
        modal = document.getElementById('game-over-modal');
        playAgainButton = document.getElementById('play-again-button');
        highScoreMessage = document.getElementById('high-score-message');
        difficultyButtons = document.querySelectorAll('.difficulty-button');
        
        // Initialize audio
        hitSound = new Audio('sounds/hit.mp3');
        missSound = new Audio('sounds/miss.mp3');
        gameOverSound = new Audio('sounds/game-over.mp3');
        
        // Initialize game state
        score = 0;
        highScore = parseInt(localStorage.getItem('whackMoleHighScore')) || 0;
        scoreDisplay.textContent = '0';
        timerDisplay.textContent = '30';
        
        // Set up event listeners
        if (gameBoard) gameBoard.addEventListener('click', whackMole);
        if (startButton) startButton.addEventListener('click', startGame);
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
                startGame();
            });
        }
        
        // Set up difficulty buttons
        if (difficultyButtons) {
            difficultyButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    const difficulty = button.dataset.difficulty || button.id;
                    setDifficulty(difficulty);
                });
            });
        }
        
        setDifficulty('easy');
    }
}

// Function to start/restart the game
/**
 * Starts or restarts the game, resetting all necessary game state
 * @function startGame
 */
function startGame() {
    // Reset game state
    score = 0;
    timer = 30;
    gameActive = true;
    currentLevel = 1;
    consecutiveHits = 0;
    
    // Update display
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timer;
    
    // Disable start button during the game
    startButton.disabled = true;
    
    // Disable difficulty buttons during the game
    difficultyButtons.forEach(button => {
        button.disabled = true;
    });
    
    // Clear any existing intervals and timeouts
    clearInterval(moleInterval);
    clearInterval(timerInterval);
    clearTimeout(moleTimeout);
    
    // Hide all moles and reset modal
    const moles = document.querySelectorAll('.mole');
    moles.forEach(mole => mole.classList.remove('active', 'whacked'));
    if (modal) modal.style.display = 'none';
    
    // Start showing moles at the current difficulty level
    updateMoleInterval();
    
    // Start the countdown timer
    countdownTimer();
}

// Function to update the mole interval based on current difficulty and level
/**
 * Updates the mole appearance interval based on current difficulty and level
 * @function updateMoleInterval
 */
function updateMoleInterval() {
    clearInterval(moleInterval);
    
    const diffSettings = difficulties[currentDifficulty];
    
    // Calcular velocidade com base na dificuldade e no nível atual
    const speed = Math.max(
        diffSettings.baseSpeed - ((currentLevel - 1) * diffSettings.speedDecreasePerLevel), 
        diffSettings.minSpeed
    );
    
    moleInterval = setInterval(() => {
        hideMoles();
        showMole();
        
        // Auto-hide moles after a time that decreases with difficulty
        clearTimeout(moleTimeout);
        moleTimeout = setTimeout(hideMoles, speed * diffSettings.timeVisible);
    }, speed);
}

// Function to hide all moles
/**
 * Hides all moles on the game board
 * @function hideMoles
 */
function hideMoles() {
    const moles = document.querySelectorAll('.mole');
    moles.forEach(mole => mole.classList.remove('active', 'whacked'));
}

// Function to show a mole at a random position
/**
 * Shows moles at random positions based on current difficulty
 * @function showMole
 */
function showMole() {
    const moles = document.querySelectorAll('.mole');
    const diffSettings = difficulties[currentDifficulty];
    
    // Quantidade de toupeiras para mostrar com base na dificuldade e nível
    // Aumenta gradualmente até o máximo definido para a dificuldade
    const molesToShow = Math.min(
        Math.ceil(currentLevel / 2), 
        diffSettings.maxActiveMoles
    );
    
    // Select random moles without repeating
    const availableMoleIndices = Array.from({ length: moles.length }, (_, i) => i);
    for (let i = 0; i < molesToShow; i++) {
        if (availableMoleIndices.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableMoleIndices.length);
        const moleIndex = availableMoleIndices[randomIndex];
        
        moles[moleIndex].classList.add('active');
        availableMoleIndices.splice(randomIndex, 1);
    }
}

// Function to handle mole click
/**
 * Handles player interaction with moles, updating score and game state
 * @function whackMole
 * @param {Event} event - Click event object
 */
function whackMole(event) {
    if (!gameActive) return; // Ignore clicks if game is not active
    
    // Se o evento for no buraco (mole) e não em algum elemento dentro dele
    const mole = event.target.closest('.mole');
    if (!mole) return;
    
    if (mole.classList.contains('active') && !mole.classList.contains('whacked')) {
        // Acertou uma toupeira!
        consecutiveHits++;
        
        // Sistema de pontuação: 10 pontos por acerto
        const points = 10;
        
        // Atualiza a pontuação
        score += points;
        scoreDisplay.textContent = score;
        
        // Add animation to score
        scoreDisplay.style.animation = 'pulse 0.3s';
        setTimeout(() => {
            scoreDisplay.style.animation = '';
        }, 300);
        
        // Create floating score animation
        const scorePoint = document.createElement('div');
        scorePoint.className = 'score-points';
        scorePoint.textContent = `+${points}`;
        scorePoint.style.left = `${event.pageX - 10}px`;
        scorePoint.style.top = `${event.pageY - 20}px`;
        document.body.appendChild(scorePoint);
        
        // Remove the element after animation completes
        setTimeout(() => {
            document.body.removeChild(scorePoint);
        }, 800);
        
        // Hide the mole and add the whacked class
        mole.classList.remove('active');
        mole.classList.add('whacked');
        
        // Play hit sound effect
        hitSound.currentTime = 0;
        hitSound.play();
        
        // Remove the whacked class after animation
        setTimeout(() => {
            mole.classList.remove('whacked');
        }, 300);
        
        // Verificar se o jogador deve subir de nível
        const diffSettings = difficulties[currentDifficulty];
        if (score >= currentLevel * diffSettings.levelUpThreshold) {
            currentLevel++;
            
            // Exibir mensagem de novo nível
            showLevelUpMessage();
            
            // Atualizar o intervalo de toupeiras para a nova velocidade
            updateMoleInterval();
        }
    } else if (!mole.classList.contains('active')) {
        // O jogador clicou em um buraco vazio
        consecutiveHits = 0;
        
        // Penalidade por erro: -5 pontos
        const penalty = -5;
        
        // Não permite pontuação negativa
        score = Math.max(0, score + penalty);
        scoreDisplay.textContent = score;
        
        // Create floating penalty animation
        const penaltyPoint = document.createElement('div');
        penaltyPoint.className = 'score-points';
        penaltyPoint.style.color = '#ff6b6b'; // Vermelho para penalidade
        penaltyPoint.textContent = penalty;
        penaltyPoint.style.left = `${event.pageX - 10}px`;
        penaltyPoint.style.top = `${event.pageY - 20}px`;
        document.body.appendChild(penaltyPoint);
        
        // Remove the element after animation completes
        setTimeout(() => {
            document.body.removeChild(penaltyPoint);
        }, 800);
        
        // Play miss sound
        missSound.currentTime = 0;
        missSound.play();
        
        // Add shake animation to the mole
        mole.style.animation = 'shake 0.3s';
        setTimeout(() => {
            mole.style.animation = '';
        }, 300);
    }
}

// Exibir mensagem de novo nível
/**
 * Displays level up message and animations
 * @function showLevelUpMessage
 */
function showLevelUpMessage() {
    const levelMessage = document.createElement('div');
    levelMessage.className = 'level-message';
    levelMessage.textContent = `Nível ${currentLevel}!`;
    levelMessage.style.position = 'absolute';
    levelMessage.style.top = '50%';
    levelMessage.style.left = '50%';
    levelMessage.style.transform = 'translate(-50%, -50%)';
    levelMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.8)';
    levelMessage.style.color = 'white';
    levelMessage.style.padding = '20px 40px';
    levelMessage.style.borderRadius = '10px';
    levelMessage.style.fontSize = '2rem';
    levelMessage.style.fontWeight = 'bold';
    levelMessage.style.zIndex = '100';
    levelMessage.style.animation = 'zoomIn 0.5s forwards';
    document.body.appendChild(levelMessage);
    
    setTimeout(() => {
        levelMessage.style.animation = 'zoomOut 0.5s forwards';
        setTimeout(() => {
            document.body.removeChild(levelMessage);
        }, 500);
    }, 1500);
}

// Function to manage the countdown timer
/**
 * Manages the game countdown timer
 * @function countdownTimer
 */
function countdownTimer() {
    timerInterval = setInterval(() => {
        timer--;
        if (timerDisplay) {
            timerDisplay.textContent = timer.toString();
            
            // Visual feedback for last 10 seconds
            if (timer <= 10) {
                timerDisplay.style.animation = 'pulse 0.5s infinite';
                timerDisplay.style.backgroundColor = '#ff6b6b';
            }
        }
        
        if (timer <= 0) {
            clearInterval(timerInterval);
            gameActive = false;
            endGame();
        }
    }, 1000);
}

// Function to end the game
/**
 * Ends the game, showing final score and updating high score if necessary
 * @function endGame
 */
function endGame() {
    // Clear all intervals and timeouts
    clearInterval(moleInterval);
    clearTimeout(moleTimeout);
    clearInterval(timerInterval);
    
    // Reset game state
    gameActive = false;
    
    // Re-enable buttons
    if (startButton) startButton.disabled = false;
    if (difficultyButtons) {
        difficultyButtons.forEach(button => button.disabled = false);
    }
    
    // Stop timer animation
    if (timerDisplay) {
        timerDisplay.style.animation = '';
        timerDisplay.style.backgroundColor = '';
    }
    
    // Handle high score
    const currentScore = parseInt(score, 10);
    const currentHighScore = parseInt(localStorage.getItem('whackMoleHighScore')) || 0;
    
    if (currentScore > currentHighScore) {
        highScore = currentScore;
        localStorage.setItem('whackMoleHighScore', currentScore.toString());
        if (highScoreMessage) {
            highScoreMessage.textContent = "🎉 New High Score! 🎉";
        }
    } else if (highScoreMessage) {
        highScoreMessage.textContent = `High Score: ${currentHighScore}`;
    }
    
    // Update final score and show modal
    if (finalScoreDisplay) {
        finalScoreDisplay.textContent = currentScore.toString();
    }
    if (modal) {
        modal.style.display = 'flex';
    }
    
    // Play game over sound
    if (gameOverSound) {
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(() => {});
    }
}

// Função para definir a dificuldade selecionada
/**
 * Sets the game difficulty level
 * @function setDifficulty
 * @param {string} difficulty - Difficulty level ('easy', 'medium', or 'hard')
 */
function setDifficulty(difficulty) {
    // Atualiza a dificuldade atual
    currentDifficulty = difficulty;
    
    // Atualiza os botões de dificuldade (visual) no jogo e no modal
    const allButtons = document.querySelectorAll('.difficulty-button');
    allButtons.forEach(button => {
        button.classList.remove('active');
        if ((button.id === difficulty) || (button.dataset.difficulty === difficulty)) {
            button.classList.add('active');
        }
    });
}

// Event listener para os botões de dificuldade (incluindo os do modal)
document.querySelectorAll('.difficulty-button').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        const difficulty = button.dataset.difficulty || button.id;
        setDifficulty(difficulty);
        
        // Atualiza os botões em ambos os lugares (modal e tela principal)
        const allButtons = document.querySelectorAll('.difficulty-button');
        allButtons.forEach(btn => {
            btn.classList.remove('active');
            if ((btn.dataset.difficulty === difficulty) || (btn.id === difficulty)) {
                btn.classList.add('active');
            }
        });
    });
});

// Initialize when in browser environment
if (typeof window !== 'undefined') {
    window.addEventListener('load', init);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init,
        startGame,
        whackMole,
        setDifficulty,
        difficulties,
        endGame,
        showMole,
        hideMoles,
        updateMoleInterval,
        countdownTimer,
        getGameState: () => ({
            score,
            timer,
            gameActive,
            currentLevel,
            highScore,
            currentDifficulty
        })
    };
}