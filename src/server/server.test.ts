import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import ws, { WebSocket, WebSocketServer } from 'ws';
import { ClientMessageType, ServerMessageType } from '@shared/types.js';
import { gameServer } from './server.js';

describe('WebSocket Server', () => {
    let ws: WebSocket;
    const PORT = 3000;
    const WS_URL = `ws://localhost:${PORT}/api/game/ws`;

    // beforeAll(async () => {
    //     //gameServer.listen(PORT);
    // });

    afterAll(async () => {
        gameServer.close();
    });

    beforeEach(async () => {
        // Create client connection
        ws = new WebSocket(WS_URL);
        await new Promise(resolve => ws.on('open', resolve));
    });

    afterEach(async () => {
        ws.close();
    });

    describe('it handles edge cases', () => {
        it('should return error on unknown message types', async () => {
            const message = {
                type: 'UNKNOWN_TYPE',
                payload: {}
            };
            
            ws.send(JSON.stringify(message));
            
            const response = await new Promise(resolve => {
                ws.once('message', data => {
                    resolve(JSON.parse(data.toString()));
                });
            });
            
            expect(response).toEqual({
                type: ServerMessageType.GAME_ERROR,
                payload: {
                    errorInfo: {
                        error: 'INVALID_MESSAGE',
                        message: 'Unknown message type: UNKNOWN_TYPE'
                    }
                }
            });
        });

        it('should return error on invalid JSON messages', async () => {
            ws.send('invalid json');
            
            const response = await new Promise<any>(resolve => {
                ws.once('message', data => {
                    resolve(JSON.parse(data.toString()));
                });
            });
            
            expect(response.type).toBe(ServerMessageType.GAME_ERROR);
        });

        it('should return error on start game with missing parameters', async () => {
            const message = {
                type: ClientMessageType.START_GAME,
                payload: {}
            };
            
            ws.send(JSON.stringify(message));
            
            const response = await new Promise<any>(resolve => {
                ws.once('message', data => {
                    resolve(JSON.parse(data.toString()));
                });
            });
            
            expect(response.type).toBe(ServerMessageType.GAME_ERROR);
            expect(response.payload.errorInfo.error).toBe('INVALID_PARAMETERS');
            expect(response.payload.errorInfo.message).toBe('Required parameters wrong type or missing');
        });
    });
});