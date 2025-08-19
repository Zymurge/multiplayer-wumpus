import { createServer } from 'node:http';
import { WebSocketServer, WebSocket, Server } from 'ws';
import { WumpusGame } from '@shared/game/WumpusGame.js';
import { ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from '@shared/types/game.js';

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
  console.log('New WebSocket connection established.');

  ws.on('message', (data) => {
    var game: WumpusGame | undefined;
    var result: ServerMessage = { type: ServerMessageType.GAME_ERROR, payload: {} };
    try {
      const message = JSON.parse(data.toString()) as ClientMessage;

      switch (message.type) {
        case ClientMessageType.START_GAME:
          if (!message.payload?.gridSize || !message.payload?.difficulty) {
            throw new Error('Missing required game parameters');
          }
          result = handleStartGame(ws, message.payload as { gridSize: number; difficulty: number });
          break;

        case ClientMessageType.CLICK_CELL:
          game = games.get(ws);
          if (!game) {
            throw new Error('No active game found');
          }
          if (typeof message.payload?.x !== 'number' || typeof message.payload?.y !== 'number') {
            throw new Error('Invalid click coordinates');
          }
          result = handleCellClicked(ws, game, message.payload as { x: number; y: number });
          break;

        case ClientMessageType.RESET_GAME:
          game = games.get(ws);
          if (!game) {
            throw new Error('No active game found');
          }
          result = handleResetGame(ws, game);
          break;

        default:
          result = {
            type: ServerMessageType.GAME_ERROR,
            payload: {
              error: 'INVALID_MESSAGE',
              message: `Unknown message type: ${message.type}`
            }
          };
          break;
      }
    } catch (err) {
      console.error('Failed to process message:', err);
      ws.send(JSON.stringify({
        type: 'game_error',
        payload: {
          error: 'GAME_ERROR',
          message: err instanceof Error ? err.message : 'Unknown error'
        }
      } as ServerMessage));
    }
      
    ws.send(JSON.stringify(result));
  });

  ws.on('close', () => {
    games.delete(ws);
    console.log('Client disconnected. Game removed.');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

/**
 * Get the current game state for a given game instance.
 * @param game The game instance.
 * @returns The current game state.
 */
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

/**
 * Process a clicked cell and return the updated board state
 * @param ws The WebSocket connection.
 * @param payload The game parameters.
 * @returns The updated game state
 */
function handleCellClicked(ws: WebSocket, game: WumpusGame, payload: { x: number; y: number }) {
  if (!game ||!payload.x || !payload.y) {
    throw new Error('Missing required game parameters');
  }
  game.setClicked(payload.x, payload.y);
  const result = {
    type: ServerMessageType.GAME_STATE,
    payload: getGameState(game)
  } as ServerMessage;
  return result;
}

/**
 * Start a new game and register it for the WebSocket connection.
 * @param ws The WebSocket connection.
 * @param payload The game parameters.
 * @returns The initial game state
 */
function handleStartGame(ws: WebSocket, payload: { gridSize: number; difficulty: number }) {
  if (!payload.gridSize || !payload.difficulty) {
    throw new Error('Missing required game parameters');
  }
  const game = new WumpusGame(payload.gridSize, payload.gridSize, payload.difficulty);
  games.set(ws, game);
  const result = {
      type: ServerMessageType.GAME_STATE,
      payload: getGameState(game)
    } as ServerMessage;
  return result;
}

function handleResetGame(ws: WebSocket, game: WumpusGame) {
  if (!game) {
    throw new Error('No active game found');
  }
  game.reset();
  games.delete(ws);
  const result = {
    type: ServerMessageType.GAME_STATE,
    payload: getGameState(game)
  } as ServerMessage;
  return result;
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint at ws://localhost:${PORT}/api/game/ws`);
});
