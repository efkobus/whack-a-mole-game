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

// Game variables
let score = 0;
let timer = 30; // Game duration in seconds
let moleInterval;
let gameActive = false;
let currentDifficulty = 1; // Starts at level 1
let highScore = localStorage.getItem('whackMoleHighScore') || 0;
let timerInterval;
let moleTimeout;
let consecutiveHits = 0;

// Function to start/restart the game
function startGame() {
    // Reset game state
    score = 0;
    timer = 30;
    gameActive = true;
    currentDifficulty = 1;
    consecutiveHits = 0;
    
    // Update display
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timer;
    
    // Disable start button during the game
    startButton.disabled = true;
    
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

// Function to update the mole interval based on current difficulty
function updateMoleInterval() {
    clearInterval(moleInterval);
    
    // Difficulty increases the speed
    // Level 1: 1000ms, Level 2: 800ms, Level 3: 600ms, Level 4: 500ms, Level 5: 400ms
    const speed = Math.max(1000 - ((currentDifficulty - 1) * 200), 400);
    
    moleInterval = setInterval(() => {
        hideMoles();
        showMole();
        
        // Auto-hide moles after a time that decreases with difficulty
        clearTimeout(moleTimeout);
        moleTimeout = setTimeout(hideMoles, speed * 0.8);
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
    
    // As difficulty increases, sometimes show more than one mole simultaneously
    const molesToShow = Math.min(Math.floor(currentDifficulty / 2) + 1, 3); // Max 3 moles at once
    
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
    
    const mole = event.target;
    
    if (mole.classList.contains('active') && !mole.classList.contains('whacked')) {
        consecutiveHits++;
        
        // Award points based on consecutive hits
        let points = 1;
        if (consecutiveHits >= 5) points = 3;
        else if (consecutiveHits >= 3) points = 2;
        
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
        
        // Increase difficulty based on score
        if (score >= currentDifficulty * 10) {
            currentDifficulty = Math.min(currentDifficulty + 1, 5);
            updateMoleInterval();
        }
    } else if (mole.classList.contains('mole') && !mole.classList.contains('active')) {
        // Reset consecutive hits when missing
        consecutiveHits = 0;
        
        // Play miss sound if clicked wrong spot
        missSound.currentTime = 0;
        missSound.play();
        
        // Add shake animation to the mole
        mole.style.animation = 'shake 0.3s';
        setTimeout(() => {
            mole.style.animation = '';
        }, 300);
    }
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
        highScoreMessage.textContent = "🎉 New High Score! 🎉";
    } else {
        highScoreMessage.textContent = `High Score: ${highScore}`;
    }
    
    // Set final score in the modal
    finalScoreDisplay.textContent = score;
    
    // Show modal
    modal.style.display = 'flex';
}

// Event listener for mole clicks
gameBoard.addEventListener('click', whackMole);

// Event listener for start button
startButton.addEventListener('click', startGame);

// Event listener for play again button
playAgainButton.addEventListener('click', () => {
    modal.style.display = 'none';
    startGame();
});

// Initialize the game
function init() {
    highScore = localStorage.getItem('whackMoleHighScore') || 0;
    scoreDisplay.textContent = '0';
    timerDisplay.textContent = '30';
}

// Call init when the page loads
window.addEventListener('load', init);