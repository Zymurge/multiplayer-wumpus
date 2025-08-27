import { logger } from '@shared/logger.js'
import { createServer } from 'node:http';
import { WebSocketServer, Server } from 'ws';
import { GameSocket } from './ws/types.js';
import { ClientMessage, ClientMessageType, ServerMessage, ServerMessageType } from '@shared/types.js';
import { createServerError, gameMap, handleCellClicked, handleStartGame, handleResetGame } from './ws/handler.js';

// Create HTTP server with basic handler for health check
export const gameServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
    return;
  }
  res.writeHead(404);
  res.end('Not Found');
});

// Create WebSocket server on the same HTTP server
const wss = new WebSocketServer({ server: gameServer, path: '/api/game/ws' });

wss.on('connection', (ws: GameSocket) => {
  ws.id = Math.random().toString(36).substring(7); // Assign a unique ID to the WebSocket connection
  logger.info(`New WebSocket connection established. id: ${ws.id}`);

  ws.on('message', (data) => {
    var result: ServerMessage = createServerError('DEFAULT_SERVER_REPLY', 'This should never get sent');
    try {
      const message = JSON.parse(data.toString()) as ClientMessage;

      switch (message.type) {
      case ClientMessageType.START_GAME:
        result = handleStartGame(ws.id, message.payload);
        break;

      case ClientMessageType.CLICK_CELL:
        result = handleCellClicked(ws.id, message.payload);
        break;

      case ClientMessageType.RESET_GAME:
        result = handleResetGame(ws.id);
        break;

      default:
        result = createServerError('INVALID_MESSAGE', `Unknown message type: ${message.type}`);
        break;
      }
    } catch (err) {
      logger.error('Failed to process message:', err);
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
    logger.info('Client disconnected. Game removed.');
  });

  ws.on('error', (err) => {
    logger.error('WebSocket error:', err);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
gameServer.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT}`);
  logger.info(`WebSocket endpoint at ws://localhost:${PORT}/api/game/ws`);
});
