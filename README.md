# Whack-a-Mole Game 🦫

A modern, engaging implementation of the classic Whack-a-Mole arcade game built with HTML5, CSS3, and JavaScript.

## Features 🎮

- Three difficulty levels: Easy, Medium, and Hard
- Dynamic scoring system with points and penalties
- Progressive level system that increases challenge
- High score tracking using localStorage
- Responsive design for all screen sizes
- Sound effects and visual feedback
- Smooth animations and transitions

## How to Play 🎯

1. Select your difficulty level:
   - Easy: Slower moles, maximum 1 mole at a time
   - Medium: Moderate speed, up to 2 moles at once
   - Hard: Fast moles, up to 3 moles simultaneously

2. Click "Start Game" to begin

3. Click on moles as they appear:
   - Hit a mole: +10 points
   - Miss (click empty hole): -5 points
   - Progress through levels by reaching score thresholds

4. Game ends after 30 seconds
   
![image](https://github.com/user-attachments/assets/3e912574-e8df-4ef1-bcb6-3e11d01518a8)

## Technical Features 🛠️

### Game Mechanics
- Dynamic difficulty adjustment
- Level progression system
- Collision detection for accurate clicking
- Randomized mole appearances
- Anti-cheat mechanisms

### Performance
- Optimized animations using CSS transforms
- Efficient DOM manipulation
- Debounced event handlers
- Memory leak prevention

### Testing
- Comprehensive Jest test suite
- Unit tests for core game functions
- Integration tests for game mechanics
- Coverage reporting

## Installation and Setup 🚀

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/whack-a-mole-game.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. For development with live reload:
   ```bash
   npm run dev
   ```

## Project Structure 📁

```
whack-a-mole-game/
├── src/
│   ├── index.html          # Main game HTML
│   ├── css/
│   │   └── styles.css      # Game styles and animations
│   ├── js/
│   │   └── script.js       # Game logic
│   ├── sounds/             # Game sound effects
│   └── __tests__/         # Test files
├── .github/
│   └── workflows/          # CI/CD configuration
└── package.json           # Project dependencies
```

## Testing 🧪

The game includes comprehensive tests using Jest:

- Unit tests for game mechanics
- Integration tests for user interactions
- Coverage reporting
- Continuous Integration via GitHub Actions

Run tests:
```bash
npm test            # Run all tests
npm test:watch     # Run tests in watch mode
npm test:coverage  # Generate coverage report
```

## Technologies Used 💻

- HTML5
- CSS3 (Animations, Flexbox, Grid)
- JavaScript (ES6+)
- Jest (Testing)
- GitHub Actions (CI/CD)

## Browser Support 🌐

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📝

This project is licensed under the MIT License - see the LICENSE file for details.
