import { WebSocket } from 'ws';

export class GameError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'GameError';
    }
}
export interface GameSocket extends WebSocket {
    id: string;
}