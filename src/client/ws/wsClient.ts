import { ClientMessageType, type ClientMessage } from '@shared/types.ts';
import { handleServerMessage } from './gameStateUtils.ts';
import { setGameStore } from '@client/components/gameStore.ts';

type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closing' | 'closed';

let socket: WebSocket | null = null;
let statusState: ConnectionStatus = 'idle';
let openPromise: Promise<void> | null = null;
let clientId: string | null = null;

interface Pending {
  msg: ClientMessage;
  resolve: () => void;
  reject: (err: any) => void;
}
const queue: Pending[] = [];

const CLIENT_ID_KEY = 'wumpus:cid';

function ensureClientId(): string {
  if (clientId) return clientId;
  try {
    const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem(CLIENT_ID_KEY) : null;
    if (stored) {
      clientId = stored;
      return clientId;
    }
  } catch {}
  // Generate a UUID-ish identifier (prefer crypto.randomUUID if available)
  let id: string;
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      // @ts-ignore
      id = crypto.randomUUID();
    } else {
      id = Math.random().toString(36).slice(2, 10);
    }
  } catch {
    id = Math.random().toString(36).slice(2, 10);
  }
  clientId = id;
  try { (typeof localStorage !== 'undefined') && localStorage.setItem(CLIENT_ID_KEY, id); } catch {}
  return clientId;
}

function getWsUrl(): string {
  if (typeof location !== 'undefined') {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${location.host}/ws`;
  }
  return 'ws://localhost/ws';
}

function setStatus(s: ConnectionStatus) { statusState = s; }

function flushQueue() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  while (queue.length) {
    const { msg, resolve } = queue.shift()!;
    try {
      const cid = ensureClientId();
      socket.send(JSON.stringify({ type: msg.type, payload: { ...msg.payload, clientId: cid } }));
      resolve();
    } catch (err) {
      // per-message errors ignored for now
    }
  }
}

function connect(): Promise<void> {
  if (openPromise) return openPromise;
  if (socket && socket.readyState === WebSocket.OPEN) {
    setStatus('open');
    return Promise.resolve();
  }
  setStatus('connecting');
  openPromise = new Promise<void>((resolve) => {
    const url = getWsUrl();
    socket = new WebSocket(url);

    socket.addEventListener('open', () => {
      setStatus('open');
      flushQueue();
      resolve();
    });
    socket.addEventListener('message', (evt: MessageEvent) => {
      try {
        const data = JSON.parse((evt as any).data);
        const result = handleServerMessage(data);
        if ('gameState' in result) setGameStore({ state: result.gameState });
        else if ('errorInfo' in result) setGameStore({ error: result.errorInfo });
      } catch {}
    });
    socket.addEventListener('close', () => {
      setStatus('closed');
      openPromise = null; // allow reconnect
    });
    socket.addEventListener('error', () => {
      setStatus('closed');
    });
  });
  return openPromise;
}

function enqueue(msg: ClientMessage): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    queue.push({ msg, resolve, reject });
  });
}

async function send(msg: ClientMessage) {
  ensureClientId();
  if (!socket || socket.readyState === WebSocket.CLOSED || statusState === 'closed') {
    socket = null;
    openPromise = null;
  }
  if (!socket || (socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING)) {
    connect();
  }
  if (socket && socket.readyState === WebSocket.OPEN && statusState === 'open') {
    const cid = ensureClientId();
    socket.send(JSON.stringify({ type: msg.type, payload: { ...msg.payload, clientId: cid } }));
    return;
  }
  // Instead of awaiting (which waits for flush after open) just enqueue and resolve later
  enqueue(msg); // fire and forget for contract tests
}

export const wsClient = {
  status(): ConnectionStatus { return statusState; },
  // Optional, idempotent init for future expansion
  init() { /* no-op */ },
  async startGame(gridSize: number, fadeSteps: number) {
    await send({ type: ClientMessageType.START_GAME, payload: { gridSize, fadeSteps } });
  },
  async resetGame() {
    await send({ type: ClientMessageType.RESET_GAME });
  },
  async clickCell(x: number, y: number) {
    await send({ type: ClientMessageType.CLICK_CELL, payload: { x, y } });
  },
  close() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      setStatus('closing');
      try { socket.close(1000, 'client-close'); } catch {}
    }
  },
  getSocket() { return socket; }
};

/**
 * Test hooks for resetting internal state during tests. Since impl is a singleton,
 * every test that relies on state should call this first.
 *
 * This function should not exist in production. Flagged via process.env.NODE_ENV 
 * to allow dead code elimination.
 */
export const __testHooks: undefined | { reset: () => void } =
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'test')
    ? {
        reset: () => {
          try {
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.close(1000, 'test-reset');
            }
          } catch {}
          socket = null;
          openPromise = null;
          if (Array.isArray(queue)) queue.length = 0;
          statusState = 'idle';
          // clientId intentionally preserved; tests clear localStorage when needed.
        }
      }
    : undefined;