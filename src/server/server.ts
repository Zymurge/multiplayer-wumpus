import { createServer } from 'node:http';
import { WebSocketServer, Server } from 'ws';
import { GameSocket } from './ws/types.js';
import { ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from '@shared/types.js';
import { createServerError, gameMap, handleCellClicked, handleStartGame, handleResetGame } from './ws/handler.js';

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

wss.on('connection', (ws: GameSocket) => {
  ws.id = Math.random().toString(36).substring(7); // Assign a unique ID to the WebSocket connection
  console.log(`New WebSocket connection established. id: ${ws.id}`);

  ws.on('message', (data) => {
    var result: ServerMessage = createServerError('DEFAULT_SERVER_REPLY', 'This should never get sent');
    try {
      const message = JSON.parse(data.toString()) as ClientMessage;

      switch (message.type) {
        case ClientMessageType.START_GAME:
          if (!message.payload?.gridSize || !message.payload?.fadeSteps) {
            throw new Error('Missing required game parameters');
          }
          result = handleStartGame(ws.id, message.payload as { gridSize: number; fadeSteps: number });
          break;

        case ClientMessageType.CLICK_CELL:
          if (!gameMap.has(ws.id)) {
            throw new Error('No active game found');
          }
          if (typeof message.payload?.x !== 'number' || typeof message.payload?.y !== 'number') {
            throw new Error('Invalid click coordinates');
          }
          result = handleCellClicked(ws.id, message.payload as { x: number; y: number });
          break;

        case ClientMessageType.RESET_GAME:
          if (!gameMap.has(ws.id)) {
            throw new Error('No active game found');
          }
          result = handleResetGame(ws.id);
          break;

        default:
          result = createServerError('INVALID_MESSAGE', `Unknown message type: ${message.type}`);
          break;
      }
    } catch (err) {
      console.error('Failed to process message:', err);
      ws.send(
        JSON.stringify(
          createServerError('GAME_ERROR', err instanceof Error ? err.message : 'Unknown error')
        )
      );
    }

    ws.send(JSON.stringify(result));
  });

  ws.on('close', () => {
    gameMap.delete(ws.id);
    console.log('Client disconnected. Game removed.');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint at ws://localhost:${PORT}/api/game/ws`);
});
