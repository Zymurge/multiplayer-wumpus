import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { WumpusGame } from '../shared/game/WumpusGame.js';

// Create HTTP server with basic handler for health check
const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
    return;
  }
  res.writeHead(404);
  res.end('Not Found');
});

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
  const cells = game.getCellsAs2DArray();
  const displayGrid = cells.map(row =>
    row.map(cell => {
      const clicked = cell.clicked;
      const isWumpus = clicked && game.last?.dist === 0 && 
                       game.wumpus.x === cell.position.x && 
                       game.wumpus.y === cell.position.y;
      return {
        value: !isWumpus && clicked ? (game.last?.dist?.toString() ?? '') : '',
        color: cell.fader?.color() ?? '',
        showWumpus: isWumpus
      };
    })
  );
  return {
    displayGrid,
    moves: game.clickCount,
    gameWon: game.last?.dist === 0,
    found: game.last?.dist === 0,
    distance: game.last?.dist ?? -1,
  };
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint at ws://localhost:${PORT}/api/game/ws`);
});
