// src/routes/api/game/+server.js

// This file serves as a WebSocket endpoint for the Wumpus game.
// It uses SvelteKit's native WebSocket handling to manage the game state on the server.
import type { RequestEvent } from '@sveltejs/kit';

// The core game logic is imported from a separate file.
import { WumpusGame } from '$lib/game/WumpusGame';

// Define types for our messages and game state
interface WebSocketMessage {
    type: string;
    x?: number;
    y?: number;
}

interface GameCell {
    value: string;
    color: string;
    showWumpus: boolean;
}

interface GameState {
    displayGrid: GameCell[][];
    moves: number;
    gameWon: boolean;
    found: boolean;
    distance: number;
}

// A map to store game instances, associating each with a unique WebSocket connection.
const games = new Map();

/**
 * Handles a new WebSocket connection.
 */
export async function GET(event: RequestEvent): Promise<Response> {
  // Check if the request is a WebSocket upgrade
  const isWebSocket = event.request.headers.get('upgrade')?.toLowerCase() === 'websocket';
  if (!isWebSocket) {
      return new Response('Not a WebSocket request', { status: 400 });
  }

  const webSocket = event.request.webSocket;
  if (!webSocket) {
      return new Response('Server failed to provide a WebSocket', { status: 500 });
  }

  // Create a new game instance and associate it with this connection.
  const game = new WumpusGame(5, 5, 4);
  games.set(webSocket, game);
  console.log('New WebSocket connection established.');

  // Set up event listeners for the WebSocket.
  webSocket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Received message from client:', message);

      // Handle the 'click' action.
      if (message.type === 'click') {
        const { x, y } = message;
        
        // Execute the game logic on the server.
        game.setClicked(x, y);

        // Get the updated game state to send back to the client.
        const gameState = getGameState(game);

        // Send the updated state back to the client.
        webSocket.send(
          JSON.stringify({
            type: 'gameStateUpdate',
            ...gameState,
          })
        );
      }
    } catch (err) {
      console.error('Failed to parse message or process game logic:', err);
    }
  };

  webSocket.onclose = () => {
    // Clean up the game instance when the client disconnects.
    games.delete(webSocket);
    console.log('Client disconnected. Game removed.');
  };

  webSocket.onerror = (err) => {
    console.error('WebSocket error:', err);
  };

  // Send the initial game state to the client upon connection.
  const initialState = getGameState(game);
  webSocket.send(
    JSON.stringify({
      type: 'initialState',
      ...initialState,
    })
  );

  // Return a 101 response to acknowledge the WebSocket upgrade.
  return new Response(null, { status: 101 });
}

/**
 * Helper function to get the current state of the game instance.
 * @param {WumpusGame} game The game instance.
 * @returns {object} An object containing the current game state for the client.
 */
function getGameState(game) {
  const { width, height } = game.getDimensions();
  const displayGrid = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      const cell = game.get(x, y);
      const clicked = cell.clicked;
      // We check the distance to determine if the Wumpus was found.
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
    // Add distance and found status to the payload for immediate feedback on the client
    found: game.wumpusFound,
    distance: game.last?.dist ?? -1,
  };
}
