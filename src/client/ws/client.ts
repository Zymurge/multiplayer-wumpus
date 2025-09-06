import { ClientMessageType, type ClientMessage, type ServerMessage } from '@shared/types.ts';
import { handleServerMessage } from './gameStateUtils.ts';
import { setGameStore } from '@client/components/gameStore.ts';

// Lightweight browser WebSocket client with lazy connection.
// It only connects when starting/resetting a game; clicks are no-ops if not connected.

let socket: WebSocket | null = null;
let openPromise: Promise<void> | null = null;

function getWsUrl(): string {
  if (typeof window === 'undefined') return 'ws://localhost:5173/api/game/ws';
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host; // includes hostname:port
  return `${protocol}://${host}/api/game/ws`;
}

function ensureConnected(): Promise<void> {
  if (socket && socket.readyState === WebSocket.OPEN) return Promise.resolve();
  if (openPromise) return openPromise;

  openPromise = new Promise<void>((resolve, reject) => {
    try {
      socket = new WebSocket(getWsUrl());
    } catch (err) {
      openPromise = null;
      // Surface error in store but don't throw in UI flows
      setGameStore({ state: undefined, error: { error: 'WS_CONNECT', message: (err as Error)?.message } });
      return resolve();
    }

    socket.addEventListener('open', () => {
      resolve();
    });

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data as string) as ServerMessage;
        const res = handleServerMessage(data);
        if ('gameState' in res) {
          setGameStore({ state: res.gameState });
        } else {
          setGameStore({ error: res.errorInfo });
        }
      } catch (e) {
        setGameStore({ error: { error: 'INVALID_MESSAGE', message: (e as Error)?.message } });
      }
    });

    socket.addEventListener('error', (ev) => {
      setGameStore({ error: { error: 'WS_ERROR', message: 'WebSocket error' } });
    });

    socket.addEventListener('close', () => {
      // Reset connection state; allow lazy reconnect on next action
      socket = null;
      openPromise = null;
    });
  });

  return openPromise;
}

async function send(msg: ClientMessage) {
  // Only send if connected or after successful ensureConnected; otherwise, no-op to keep tests stable.
  await ensureConnected();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

export const wsClient = {
  async startGame(gridSize: number, fadeSteps: number) {
    await send({ type: ClientMessageType.START_GAME, payload: { gridSize, fadeSteps } });
  },
  async resetGame() {
    await send({ type: ClientMessageType.RESET_GAME });
  },
  async clickCell(x: number, y: number) {
    // If not connected, ignore in tests; UI won't crash
    await send({ type: ClientMessageType.CLICK_CELL, payload: { x, y } });
  },
  // For tests to stub or inspect if needed
  __getSocket() {
    return socket;
  }
};
