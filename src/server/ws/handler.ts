import type { RequestEvent } from '@sveltejs/kit';
import type { WebSocket } from 'ws';
import { WumpusGame } from '../../shared/game/WumpusGame.js';
import type { WebSocketMessage, GameState } from '../../shared/types/game.ts';

// A map to store game instances, associating each with a unique WebSocket connection.
const games = new Map<WebSocket, WumpusGame>();