import type { WebSocket } from 'ws';
import { WumpusGame } from '@shared/game/WumpusGame.js';

// A map to store game instances, associating each with a unique WebSocket connection.
const games = new Map<WebSocket, WumpusGame>();