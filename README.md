# Multiplayer Hunt the Wumpus

A modern, real-time multiplayer implementation of the classic "Hunt the Wumpus" game built with SvelteKit, WebSockets, and TypeScript.

## 🎮 Game Overview

Hunt the Wumpus is a classic text-based adventure game where players navigate a grid to find the hidden Wumpus. In this multiplayer version, multiple players can join games and compete to find the Wumpus first.

### How to Play
- Click on grid cells to search for the Wumpus
- Each click reveals the distance to the Wumpus from that cell
- Use the distance clues to triangulate the Wumpus's location
- The grid features a color-coded distance system that provides visual hints that fade over time
- Find the Wumpus in the fewest moves to win!

## 🏗️ Architecture

### Project Structure
```
src/
├── client/                 # Client-side Svelte application
│   ├── components/         # Reusable UI components
│   │   ├── HexCell.svelte  # Individual grid cell component
│   │   ├── WumpusSprite.svelte # Wumpus visual representation
│   │   └── WumpusGame.svelte   # Main game board component
│   └── routes/            # SvelteKit routes and pages
├── server/                # Server-side game logic and WebSocket handling
│   ├── game/             # Core game logic (WumpusGame, BoardState, etc.)
│   ├── grid/             # Grid operations and hex grid logic
│   └── ws/               # WebSocket handlers and message processing
└── shared/               # Code shared between client and server
    ├── types.ts          # TypeScript interfaces and message types
    └── colors.ts         # Color constants and theming
```

### Key Design Principles
- **Client-Server Separation**: All game logic runs on the server; client is pure UI
- **Real-time Communication**: WebSocket-based messaging for instant multiplayer updates
- **Type Safety**: Full TypeScript coverage with shared type definitions
- **Testable Architecture**: Pure functions and dependency injection for comprehensive testing
- **Hexagonal Grid**: Modern hex-based grid system for enhanced gameplay

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm

### Installation
```bash
git clone <repository-url>
cd multiplayer-wumpus
pnpm install
```

### Development
```bash
# Start the development server
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Build for production (main app)
cd WumpusGame/
pnpm build

# Build server
cd src/server
pnpm build
```

## 🔧 Technical Details

### WebSocket API

The game uses WebSocket communication with strongly-typed message enums:

#### Client → Server Messages
```typescript
// Start a new game
{
  type: ClientMessageType.START_GAME,
  payload: {
    gridSize: number,
    fadeSteps: number
  }
}

// Click a cell
{
  type: ClientMessageType.CELL_CLICKED, 
  payload: {
    x: number,
    y: number
  }
}

// Reset current game
{
  type: ClientMessageType.RESET_GAME,
  payload: {}
}
```

#### Server → Client Messages
```typescript
// Game state update
{
  type: ServerMessageType.GAME_STATE,
  payload: {
    gameState: {
      grid: GridCell[][],
      moves: number,
      distance?: number,
      found: boolean
    }
  }
}

// Error response
{
  type: ServerMessageType.GAME_ERROR,
  payload: {
    errorInfo: {
      error: string,
      message?: string
    }
  }
}
```

### Core Game Logic

**Server-Side (`src/server/`):**
- `WumpusGame` class: Manages game state, Wumpus placement, and move validation
- `BoardState`: Handles grid state and click tracking
- `HexGrid`: Implements hexagonal grid operations and coordinate systems
- WebSocket handlers: Process client messages and return game state updates

**Client-Side (`src/client/`):**
- Pure UI components that render game state received from server
- `WumpusGame.svelte`: Main game board with hex grid display
- `HexCell.svelte`: Individual hex cell with color-coded distance hints
- Real-time WebSocket integration for multiplayer updates

### Color System
- Dynamic color theming with customizable palettes
- Distance-based color coding that fades over time
- Visual hints help players triangulate Wumpus location

### Testing Strategy

- **Unit Tests**: Comprehensive coverage for all server-side handlers
- **Type Validation**: Runtime message validation ensures WebSocket contract compliance
- **Error Handling**: Robust testing of edge cases and invalid inputs
- **Game Logic**: Thorough testing of core game mechanics and state transitions

Current test coverage includes:
- ✅ Game creation and initialization
- ✅ Valid cell clicking and state updates  
- ✅ Error handling for invalid coordinates and edge cases
- ✅ Game reset functionality
- ✅ WebSocket message type validation
- ✅ Boundary condition testing

## 🛠️ Development

### Code Organization

**Shared Types (`src/shared/types.ts`)**
- Message type enums (`ClientMessageType`, `ServerMessageType`)
- Game state interfaces and error structures
- Ensures type consistency between client and server

**Shared Colors (`src/shared/colors.ts`)**
- Color constants and theming system
- Used by client for consistent visual representation

**Server Architecture (`src/server/`)**
- Pure functions for processing game actions
- Stateless handlers for easy testing and scaling
- Comprehensive error handling and validation

**Client Architecture (`src/client/`)**
- Reactive Svelte components
- WebSocket state management
- Responsive hex grid with visual feedback

### Adding New Features

1. **Define Types**: Add new message types to enums in `src/shared/types.ts`
2. **Implement Server Logic**: Create handler functions in `src/server/ws/`
3. **Add Tests**: Write comprehensive tests for new functionality
4. **Update Client UI**: Modify Svelte components to handle new features

### Testing

Run the test suite:
```bash
pnpm test                    # Run all tests once
pnpm run test:watch         # Run tests in watch mode
pnpm run test:ui            # Run tests with Vitest UI
pnpm run test:coverage      # Generate coverage report
```

### Building

```bash
# Build main application
cd WumpusGame/
pnpm build

# Build server
cd src/server
pnpm build

# Preview production build
pnpm preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`pnpm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

- [ ] Complete WebSocket integration in client components
- [ ] Spectator mode for watching games
- [ ] Game rooms and lobbies
- [ ] Player statistics and leaderboards
- [ ] Multiple difficulty levels and grid configurations
- [ ] Mobile-responsive design improvements
- [ ] Game replay and analysis system
