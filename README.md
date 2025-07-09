# Multiplayer Hunt the Wumpus

A modern TypeScript/SvelteKit implementation of the classic Hunt the Wumpus game, built for learning and multiplayer functionality.

## Features

- **Modern Tech Stack**: Built with SvelteKit and TypeScript
- **Visual Polish**: Color-coded distance feedback with fade-out mechanics
- **Animated Wumpus**: Custom SVG sprite with golden glow effect
- **Smart Game Logic**: Wumpus moves based on player movement patterns
- **Responsive Design**: Clean, modern UI with proper visual feedback

## Game Mechanics

- Click squares to hunt for the Wumpus
- Distance feedback: Green (close) → Yellow (medium) → Red (far)
- Previous guesses fade out after 3 new clicks
- The Wumpus moves based on your movement distance
- Find the Wumpus to win!

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Coming Soon

- Multiplayer turn-based gameplay
- WebSocket backend for real-time play
- Docker containerization
- Deployment configuration

## Project Structure

- `src/lib/GameGrid.ts` - Core game logic and state management
- `src/lib/components/` - Svelte components for UI
- `src/lib/components/WumpusGame.svelte` - Main game component
- `src/lib/components/GridSquare.svelte` - Individual grid squares
- `src/lib/components/WumpusSprite.svelte` - Animated Wumpus sprite
