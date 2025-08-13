import type { RequestEvent } from '@sveltejs/kit';
import type { WebSocket } from 'ws';
import { WumpusGame } from '@shared/game/WumpusGame';
import type { WebSocketMessage, GameState } from '@shared';

// A map to store game instances, associating each with a unique WebSocket connection.
const games = new Map<WebSocket, WumpusGame>();