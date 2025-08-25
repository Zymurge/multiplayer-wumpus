import { WebSocket } from 'ws';

export interface GameSocket extends WebSocket {
    id: string;
}