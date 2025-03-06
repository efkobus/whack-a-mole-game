// JavaScript logic for the Whack-a-Mole game

// Select necessary DOM elements
const gameBoard = document.querySelector('.game-board');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const timerDisplay = document.getElementById('time');
const startButton = document.getElementById('start-button');
const hitSound = document.getElementById('hit-sound');
const missSound = document.getElementById('miss-sound');
const gameOverSound = document.getElementById('game-over-sound');
const modal = document.getElementById('game-over-modal');
const playAgainButton = document.getElementById('play-again-button');
const highScoreMessage = document.getElementById('high-score-message');
const difficultyButtons = document.querySelectorAll('.difficulty-button');

// Game variables
let score = 0;
let timer = 30; // Game duration in seconds
let moleInterval;
let gameActive = false;
let currentLevel = 1; // Nível atual do jogador (inicia no nível 1)
let highScore = localStorage.getItem('whackMoleHighScore') || 0;
let timerInterval;
let moleTimeout;
let consecutiveHits = 0;

// Configurações de dificuldade
const difficulties = {
    easy: {
        baseSpeed: 1200,         // Velocidade base em ms (mais alto = mais lento)
        speedDecreasePerLevel: 100, // Diminuição de velocidade por nível
        minSpeed: 800,          // Velocidade mínima
        maxActiveMoles: 1,       // Máximo de toupeiras ativas no modo fácil
        levelUpThreshold: 50,    // Pontos necessários para subir de nível
        timeVisible: 0.8         // Proporção do tempo que a toupeira fica visível
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

// Dificuldade atual (padrão: fácil)
let currentDifficulty = 'easy';

// Function to start/restart the game
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
    
    // Add animation to game board
    gameBoard.style.animation = 'pulse 1s';
    setTimeout(() => {
        gameBoard.style.animation = '';
    }, 1000);
    
    // Clear any existing intervals and timeouts
    clearInterval(moleInterval);
    clearInterval(timerInterval);
    clearTimeout(moleTimeout);
    
    // Hide all moles
    const moles = document.querySelectorAll('.mole');
    moles.forEach(mole => mole.classList.remove('active', 'whacked'));
    
    // Start showing moles at the current difficulty level
    updateMoleInterval();
    
    // Start the countdown timer
    countdownTimer();
}

// Function to update the mole interval based on current difficulty and level
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
function hideMoles() {
    const moles = document.querySelectorAll('.mole');
    moles.forEach(mole => mole.classList.remove('active', 'whacked'));
}

// Function to show a mole at a random position
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
function countdownTimer() {
    timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
            timerDisplay.textContent = timer;
            
            // Visual feedback as time gets lower
            if (timer <= 10) {
                timerDisplay.style.animation = 'pulse 0.5s infinite';
                timerDisplay.style.backgroundColor = '#ff6b6b';
            }
        } else {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// Function to end the game
function endGame() {
    gameActive = false;
    clearInterval(moleInterval);
    clearTimeout(moleTimeout);
    timerDisplay.style.animation = '';
    startButton.disabled = false;
    
    // Play game over sound
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    
    // Check for new high score
    let isNewHighScore = false;
    if (score > highScore) {
        localStorage.setItem('whackMoleHighScore', score);
        highScore = score;
        isNewHighScore = true;
        highScoreMessage.textContent = "🎉 Novo Recorde! 🎉";
    } else {
        highScoreMessage.textContent = `Recorde: ${highScore}`;
    }
    
    // Set final score in the modal
    finalScoreDisplay.textContent = score;

    // Update modal difficulty buttons to match current difficulty
    const modalButtons = modal.querySelectorAll('.difficulty-button');
    modalButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.difficulty === currentDifficulty) {
            button.classList.add('active');
        }
    });

    // Re-enable difficulty buttons
    difficultyButtons.forEach(button => {
        button.disabled = false;
    });

    // Show modal
    modal.style.display = 'flex';
}

// Função para definir a dificuldade selecionada
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

// Event listener for mole clicks
gameBoard.addEventListener('click', whackMole);

// Event listener for start button
startButton.addEventListener('click', startGame);

// Event listener for play again button
playAgainButton.addEventListener('click', () => {
    modal.style.display = 'none';
    startGame();
});

// Add keyframe for level transition animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes zoomOut {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}`, styleSheet.cssRules.length);

// Initialize the game
function init() {
    highScore = localStorage.getItem('whackMoleHighScore') || 0;
    scoreDisplay.textContent = '0';
    timerDisplay.textContent = '30';
    
    // Set default difficulty
    setDifficulty('easy');
}

// Call init when the page loads
window.addEventListener('load', init);