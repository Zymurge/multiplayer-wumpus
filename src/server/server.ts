import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { handler } from '../../../build/handler.js'; // SvelteKit Node adapter output
import { WumpusGame } from '../lib/game/WumpusGame';

// Create HTTP server
const server = createServer(handler);

// Create WebSocket server on the same HTTP server
const wss = new WebSocketServer({ server, path: '/api/game/ws' });

// Store game instances per WebSocket connection
const games = new Map<WebSocket, WumpusGame>();

wss.on('connection', (ws) => {
  // Create a new game instance for this connection
  const game = new WumpusGame(5, 5, 4);
  games.set(ws, game);
  console.log('New WebSocket connection established.');

  // Send initial state
  ws.send(JSON.stringify({
    type: 'initialState',
    ...getGameState(game)
  }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'click') {
        const { x, y } = message;
        game.setClicked(x, y);
        ws.send(JSON.stringify({
          type: 'gameStateUpdate',
          ...getGameState(game)
        }));
      }
    } catch (err) {
      console.error('Failed to parse message or process game logic:', err);
    }
  });

  ws.on('close', () => {
    games.delete(ws);
    console.log('Client disconnected. Game removed.');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Helper to get game state
function getGameState(game: WumpusGame) {
  const { width, height } = game.getDimensions();
  const displayGrid = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      const cell = game.get(x, y);
      const clicked = cell.clicked;
      const isWumpus = clicked && cell.distance === 0;
      return {
        value: !isWumpus && clicked ? cell.distance?.toString() ?? '' : '',
        color: cell.fader?.color() ?? '',
        showWumpus: isWumpus
      };
    })
  );
  return {
    displayGrid,
    moves: game.clickCount,
    gameWon: game.wumpusFound,
    found: game.wumpusFound,
    distance: game.last?.dist ?? -1,
  };
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint at ws://localhost:${PORT}/api/game/ws`);
});
