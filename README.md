# Multiplayer Hunt the Wumpus

A modern TypeScript/SvelteKit implementation of the classic Hunt the Wumpus game, with real-time multiplayer support via WebSocket.

## Features

- **Modern Tech Stack**: Built with SvelteKit frontend and standalone TypeScript WebSocket server
- **Visual Polish**: Color-coded distance feedback with fade-out mechanics
- **Animated Wumpus**: Custom SVG sprite with golden glow effect
- **Smart Game Logic**: Wumpus moves based on player movement patterns
- **Responsive Design**: Clean, modern UI with proper visual feedback
- **Real-time Multiplayer**: WebSocket-based server for live game updates

## Architecture

The project is split into two main components:

### Frontend (SvelteKit)
- Modern SvelteKit application
- TypeScript for type safety
- Responsive UI with Svelte components
- WebSocket client for real-time game updates

### Game Server
- Standalone TypeScript WebSocket server
- Direct TypeScript execution with ts-node
- Manages game state and player connections
- Located in `src/server/`

## Development

You'll need to run both the frontend and server in separate terminals:

```bash
# Install dependencies in both root and server directories
pnpm install
cd src/server && pnpm install

# Terminal 1: Start the WebSocket server
cd src/server
pnpm start

# Terminal 2: Start the SvelteKit dev server
# (from project root)
pnpm dev
```

## Project Structure

```
multiplayer-wumpus/
├── src/
│   ├── lib/            # Shared game logic
│   │   ├── components/ # Svelte components
│   │   ├── game/      # Core game mechanics
│   │   └── grid/      # Grid system implementations
│   ├── routes/        # SvelteKit routes
│   └── server/        # Standalone WebSocket server
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
  - **IGridOperation.ts**: Defines the grid system interface.
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
