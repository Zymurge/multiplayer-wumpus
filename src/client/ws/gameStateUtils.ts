// Pure function to update WumpusGame state from GAME_STATE payload
// This function is decoupled from WebSocket and Svelte internals
import { ServerMessageType, type ErrorInfo, type GameState, type ServerMessage } from '@shared/types.ts';

export function logServerError(errorInfo: { error: string; message?: string }) {
    console.error(`Server error: ${errorInfo.error} ${errorInfo.message || ''}`);
    // You can add more error handling logic here
    return null;
}

type HandlerResult = { gameState: GameState } | { errorInfo: ErrorInfo };

/**
 * Handle incoming server messages to extract game state or error information. If messages are
 * of unknown type or malformed, an error is returned.
 * @param msg The server message to handle.
 * @returns The extracted game state or error information.
 */
export function handleServerMessage(msg: ServerMessage): HandlerResult {
  if (msg.type === ServerMessageType.GAME_STATE) {
    if (msg.payload?.gameState) {
      return { gameState: msg.payload.gameState };
    }
    else {
        return { errorInfo: { error: 'INVALID_PAYLOAD', message: 'Game state is missing payload' } };
    }
  }
  if (msg.type === ServerMessageType.GAME_ERROR) {
    if (msg.payload?.errorInfo) {
      return { errorInfo: msg.payload.errorInfo };
    }
    else {
      return { errorInfo: { error: 'INVALID_PAYLOAD', message: 'Error info is missing payload' } };
    }
  }
  return { errorInfo: { error: 'UNKNOWN', message: 'Unknown message type' } };
}