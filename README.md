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
- Previous guesses fade out after an adjustable number of clicks
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

- Conversion from Square based grid to Hex map
- Multiplayer turn-based gameplay
- WebSocket backend for real-time play
- Docker containerization
- Deployment configuration

## Project Structure

```multiplayer-wumpus/
├── src/
│   ├── lib/
│   │   ├── grid/              # all coordinate & neighbor math
│   │   │   ├── IGridSystem.ts # grid system interface
│   │   │   ├── SquareGrid.ts  # row/col implementation
│   │   │   ├── HexGrid.ts     # pointy-top hex (even-q) implementation
│   │   │   ├── SquareGrid.test.ts
│   │   │   └── HexGrid.test.ts
│   │   │
│   │   ├── game/              # game state and logic
│   │   │   ├── BoardState.ts  # tracks cell states, fade, clicks
│   │   │   ├── WumpusGame.ts  # orchestrator calling grid + state
│   │   │   ├── ColorFader.ts  # helper for fade-step color transitions
│   │   │   └── BoardState.test.ts
│   │   │
│   │   └── components/        # UI pieces (Svelte/React/etc.)
│   │       ├── WumpusGame.svelte    # top-level game view
│   │       ├── GridSquare.svelte    # generic square wrapper
│   │       └── WumpusSprite.svelte  # icon for Wumpus
│   │
│   ├── routes/                 # SvelteKit page routes
│   │   └── +page.svelte
│   │
│   └── app.html, app.css, etc. # static shell + global styles
├── static/                     # public assets
├── package.json
├── tsconfig.json
├── svelte.config.js
└── README.md
```

## Roles & Intentions

- **lib/grid/**
  Provides coordinate systems and neighbor-math abstractions.
  - **IGridSystem.ts**: Defines the grid system interface.
  - **SquareGrid.ts**: Implements a row/column grid (Manhattan/Chebyshev).
  - **HexGrid.ts**: Implements a pointy-top, even-q hex grid.
  - **\*.test.ts**: Unit tests validating each grid implementation.

- **lib/game/**
  Encapsulates game state and high-level rules.
  - **BoardState.ts**: Manages cell states, fade steps, clicks, and resets.
  - **WumpusGame.ts**: Drives click handling, distance checks, and Wumpus movement.
  - **ColorFader.ts**: Pure helper for computing fade-step color transitions.
  - **BoardState.test.ts**: Tests for board state logic.

- **lib/components/**
  UI components for the front-end framework (Svelte/React/etc.).
  - **WumpusGame.svelte**: Top-level game view binding state and user events.
  - **GridSquare.svelte**: Generic cell wrapper (used for square layouts).
  - **WumpusSprite.svelte**: Renders the Wumpus icon.

- **routes/**
  Application page routes (e.g., SvelteKit).
  - **+page.svelte**: Main entry point for the app.

- **static/**
  Serves static assets, icons, and images.

- **Root config files**
  - **package.json**, **tsconfig.json**, **svelte.config.js**, **vite.config.js**, etc.
  - **README.md**: Project overview and quickstart instructions.
