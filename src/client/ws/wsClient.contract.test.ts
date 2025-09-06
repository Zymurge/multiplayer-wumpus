// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { wsClient, __testHooks } from './wsClient.ts';
import { gameStore } from '../components/gameStore.ts';

// Mock WebSocket for testing
// Inspired by: https://stackoverflow.com/questions/39200594/how-to-mock-websocket-in-jest-tests
// and

// We TDD the desired contract. Implementation will be updated to satisfy these tests.
// Contract expectations:
// wsClient API: init, startGame, resetGame, clickCell, close, status, on, off, getSocket
// - Lazy connection (first outbound call)
// - clientId persisted in localStorage and attached to every outbound message payload
// - Queues messages until OPEN, then flushes in order
// - status() reflects lifecycle transitions
// - Incoming GAME_STATE updates gameStore

type Listener = (...args: any[]) => void;

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];
  private listeners: Record<string, Listener[]> = {};

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, cb: Listener) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(cb);
  }
  removeEventListener(type: string, cb: Listener) {
    this.listeners[type] = (this.listeners[type] || []).filter(l => l !== cb);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close(code = 1000, reason = 'normal') {
    this.readyState = MockWebSocket.CLOSED;
    this.emit('close', { code, reason });
  }
  // helpers for tests
  open() {
    this.readyState = MockWebSocket.OPEN;
    this.emit('open');
  }
  message(data: any) {
    this.emit('message', { data });
  }
  error(err?: any) {
    this.emit('error', err || new Error('ws error'));
  }
  emit(type: string, evt: any = {}) {
    (this.listeners[type] || []).forEach(l => l(evt));
  }
}

// Utility to parse last JSON payload and return object
function parsePayload(json: string) {
  return JSON.parse(json);
}

describe('wsClient contract (TDD)', () => {
  beforeEach(() => {
    // Reset internal wsClient singleton state via test hook (no module reload needed)
    __testHooks?.reset();
    MockWebSocket.instances = [];
    // Replace global WebSocket constructor with mock before any connection attempts
    // @ts-ignore
    global.WebSocket = MockWebSocket;
    // Clear persisted client id / state for tests that rely on fresh storage
    localStorage.clear();
  });

  it('lazy connects on first outbound (startGame) and sends payload with persistent clientId', async () => {
  const status = (wsClient as any).status?.bind(wsClient);
    expect(typeof status).toBe('function');
    expect(status()).toBe('idle');
    const startPromise = wsClient.startGame(5, 4); // triggers connect
    expect(status()).toBe('connecting');
    const ws = MockWebSocket.instances[0];
    expect(ws).toBeTruthy();
    // No send yet (queueing until open)
    expect(ws.sent.length).toBe(0);
    // Simulate open
    ws.open();
    await startPromise;
    expect(status()).toBe('open');
    expect(ws.sent.length).toBe(1);
    const msg1 = parsePayload(ws.sent[0]);
    expect(msg1.payload.gridSize).toBe(5);
    expect(msg1.payload.fadeSteps).toBe(4);
    // clientId persisted
  const storedId = localStorage.getItem('wumpus:cid');
  expect(storedId).toBeTruthy();
  // UUID v4 pattern (relaxed) or fallback random id of >= 6 chars
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  expect(storedId && (uuidRegex.test(storedId) || storedId.length >= 6)).toBe(true);
  expect(msg1.payload.clientId).toBe(storedId);
    // Second message retains same clientId
    await wsClient.clickCell(0, 0);
    expect(ws.sent.length).toBe(2);
    const msg2 = parsePayload(ws.sent[1]);
    expect(msg2.payload.clientId).toBe(storedId);
  });

  it('handles init in an idempotent way', async () => {
    const status = (wsClient as any).status?.bind(wsClient);
    expect(typeof status).toBe('function');
    expect(status()).toBe('idle');
    await (wsClient as any).init?.(); // optional init
    expect(status()).toBe('idle');
    await (wsClient as any).init?.(); // optional init again
    expect(status()).toBe('idle');
  });

  it('queues messages sent during connecting and flushes in order on open', async () => {
    const p1 = wsClient.startGame(3, 2); // triggers connect
    const p2 = wsClient.clickCell(1, 1); // queued
    const p3 = wsClient.resetGame(); // queued
    const ws = MockWebSocket.instances[0];
    expect(ws.sent.length).toBe(0); // still connecting
    ws.open();
    await Promise.all([p1, p2, p3]);
    // Expect three messages flushed in same order
    expect(ws.sent.length).toBe(3);
    const types = ws.sent.map(s => parsePayload(s).type);
    expect(types).toEqual(['start_game', 'click_cell', 'reset_game']);
  });

it('status reflects lifecycle and reconnect preserves same clientId while creating new WebSocket', async () => {
    const status = (wsClient as any).status?.bind(wsClient);
    expect(typeof status).toBe('function');
    wsClient.startGame(4, 1);
    const ws = MockWebSocket.instances[0];
    // Debug logs
    // @ts-ignore
    console.log('After startGame status=', status(), 'readyState=', ws?.readyState);
    expect(status()).toBe('connecting');
    ws.open();
    // @ts-ignore
    console.log('After open status=', status(), 'readyState=', ws.readyState);
    expect(status()).toBe('open');
    const firstId = localStorage.getItem('wumpus:cid');
    ws.close(1000, 'normal');
    // @ts-ignore
    console.log('After close status=', status(), 'readyState=', ws.readyState);
    expect(status()).toBe('closed');
    await wsClient.clickCell(0,0);
    const ws2 = MockWebSocket.instances[1];
    // @ts-ignore
    console.log('After clickCell new socket count=', MockWebSocket.instances.length, 'status=', status(), 'ws2Ready=', ws2?.readyState);
    expect(ws2).toBeTruthy();
    expect(ws2).not.toBe(ws);
    const secondId = localStorage.getItem('wumpus:cid');
    expect(secondId).toBe(firstId);
});

it('incoming GAME_STATE updates store', async () => {
    const states: any[] = [];
    const unsub = gameStore.subscribe((v: any) => { 
        if (v.state) states.push(v.state); 
    });
    const startPromise = wsClient.startGame(2,1);
    const ws = MockWebSocket.instances[0];
    ws.open();
    await startPromise;
    const gameState = { grid: [[{ value:'', color:'red', showWumpus:false }]], distance:1, found:false, moves:0 };
    ws.message(JSON.stringify({ type:'game_state', payload:{ gameState } }));
        expect(states.length).toBe(1);
        expect(states[0].grid[0][0].color).toBe('red');
        unsub();
    });
});
