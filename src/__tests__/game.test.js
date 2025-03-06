/**
 * @jest-environment jsdom
 */

describe('Whack-a-Mole Game', () => {
    let game;
    let gameElements;
    
    beforeEach(() => {
        jest.useFakeTimers();
        
        // Create and append a stylesheet to handle animations
        const style = document.createElement('style');
        document.head.appendChild(style);
        
        // Set up document body with game elements
        document.body.innerHTML = `
            <div class="game-container">
                <div class="score">Score: <span id="score">0</span></div>
                <div class="timer">Time: <span id="time">30</span>s</div>
                <div class="game-board">
                    ${Array(9).fill().map((_, i) => `
                        <div class="mole" id="mole${i + 1}">
                            <div class="eyes">
                                <div class="eye-left"></div>
                                <div class="eye-right"></div>
                            </div>
                            <div class="nose"></div>
                            <div class="mouth"></div>
                        </div>
                    `).join('')}
                </div>
                <button id="start-button">Start Game</button>
                <div class="difficulty-buttons">
                    <button id="easy" class="difficulty-button active">Easy</button>
                    <button id="medium" class="difficulty-button">Medium</button>
                    <button id="hard" class="difficulty-button">Hard</button>
                </div>
            </div>
            <div id="game-over-modal" class="modal">
                <div class="modal-content">
                    <h2>Game Over!</h2>
                    <p>Your score: <span id="final-score">0</span></p>
                    <p id="high-score-message"></p>
                    <button id="play-again-button">Play Again</button>
                </div>
            </div>
        `;

        // Cache DOM elements before loading game script
        gameElements = {
            score: document.getElementById('score'),
            timer: document.getElementById('time'),
            startButton: document.getElementById('start-button'),
            moles: document.querySelectorAll('.mole'),
            modal: document.getElementById('game-over-modal'),
            finalScore: document.getElementById('final-score'),
            difficultyButtons: document.querySelectorAll('.difficulty-button'),
            highScoreMessage: document.getElementById('high-score-message'),
            playAgainButton: document.getElementById('play-again-button')
        };

        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Mock Audio
        const mockAudio = {
            play: jest.fn().mockReturnValue(Promise.resolve()),
            pause: jest.fn(),
            currentTime: 0
        };
        global.Audio = jest.fn().mockImplementation(() => mockAudio);

        // Mock animations
        Element.prototype.animate = jest.fn();
        
        // Load game script and initialize
        game = require('../js/script');
        game.init();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
        localStorage.clear();
        document.body.innerHTML = '';
        jest.resetModules();
    });

    describe('Game Initialization', () => {
        test('should initialize game with correct default values', () => {
            expect(gameElements.score.textContent).toBe('0');
            expect(gameElements.timer.textContent).toBe('30');
            expect(gameElements.moles.length).toBe(9);
            expect(localStorage.getItem).toHaveBeenCalledWith('whackMoleHighScore');
        });

        test('should have correct difficulty settings', () => {
            const easyButton = document.getElementById('easy');
            expect(easyButton.classList.contains('active')).toBe(true);
            expect(document.getElementById('medium').classList.contains('active')).toBe(false);
            expect(document.getElementById('hard').classList.contains('active')).toBe(false);
        });
    });

    describe('Game Mechanics', () => {
        test('should start game when start button is clicked', () => {
            gameElements.startButton.click();
            expect(gameElements.startButton.disabled).toBe(true);
            expect(document.querySelectorAll('.difficulty-button:disabled').length).toBe(3);
        });

        test('should handle mole clicks correctly', () => {
            game.startGame();
            const mole = gameElements.moles[0];
            mole.classList.add('active');
            
            // Simulate hit on active mole
            mole.click();
            expect(gameElements.score.textContent).toBe('10');
            expect(mole.classList.contains('active')).toBe(false);
            expect(mole.classList.contains('whacked')).toBe(true);

            // Simulate miss (clicking inactive mole)
            const inactiveMole = gameElements.moles[1];
            inactiveMole.click();
            expect(gameElements.score.textContent).toBe('5');
        });

        test('should handle difficulty changes', () => {
            const mediumButton = document.getElementById('medium');
            const hardButton = document.getElementById('hard');

            mediumButton.click();
            expect(mediumButton.classList.contains('active')).toBe(true);
            expect(document.getElementById('easy').classList.contains('active')).toBe(false);

            hardButton.click();
            expect(hardButton.classList.contains('active')).toBe(true);
            expect(mediumButton.classList.contains('active')).toBe(false);
        });
    });

    describe('Timer and Game End', () => {
        test('should end game when timer reaches zero', () => {
            game.startGame();
            
            // Run all pending timers
            jest.runOnlyPendingTimers();
            
            // Fast-forward 30 seconds
            for (let i = 0; i < 30; i++) {
                jest.advanceTimersByTime(1000);
            }
            
            // Let any pending state updates complete
            jest.runAllTimers();
            
            expect(gameElements.modal.style.display).toBe('flex');
            expect(gameElements.startButton.disabled).toBe(false);
            expect(document.querySelectorAll('.difficulty-button:disabled').length).toBe(0);
        });

        test('should update timer display correctly', () => {
            game.startGame();
            
            jest.advanceTimersByTime(5000);
            expect(gameElements.timer.textContent).toBe('25');
            
            jest.advanceTimersByTime(15000);
            expect(gameElements.timer.textContent).toBe('10');
        });
    });

    describe('Scoring System', () => {
        test('should update high score when game ends with new high score', () => {
            localStorage.getItem.mockReturnValue('50');
            game.startGame();
            
            // Simulate scoring points
            const mole = gameElements.moles[0];
            mole.classList.add('active');
            
            // Click the mole 6 times to get 60 points
            for (let i = 0; i < 6; i++) {
                mole.click();
                mole.classList.remove('whacked');
                mole.classList.add('active');
            }
            
            // Force game end by advancing timer
            for (let i = 0; i < 30; i++) {
                jest.advanceTimersByTime(1000);
            }
            
            // Let any pending state updates complete
            jest.runAllTimers();
            
            expect(localStorage.setItem).toHaveBeenCalledWith('whackMoleHighScore', '60');
            expect(gameElements.modal.style.display).toBe('flex');
        });

        test('should not update high score when score is lower', () => {
            localStorage.getItem.mockReturnValue('100');
            game.startGame();
            
            // Simulate some points
            const mole = gameElements.moles[0];
            mole.classList.add('active');
            mole.click();
            
            // Force game end
            for (let i = 0; i < 30; i++) {
                jest.advanceTimersByTime(1000);
            }
            
            // Let any pending state updates complete
            jest.runAllTimers();
            
            expect(localStorage.setItem).not.toHaveBeenCalled();
        });
    });
});