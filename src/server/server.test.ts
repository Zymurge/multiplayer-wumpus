// @vitest-environment node
// @vitest-execute serial

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { WebSocket } from 'ws';
import { ClientMessageType, ServerMessageType } from '@shared/types.js';
import { logger } from '@shared/logger.js';
import { gameServer, startServer } from './server.js';

describe('WebSocket Server', () => {
    let ws: WebSocket;
    const PORT = 3000;
    const WS_URL = `ws://localhost:${PORT}/api/game/ws`;

    let errorSpy: ReturnType<typeof vi.spyOn>;
    let infoSpy: ReturnType<typeof vi.spyOn>;

    beforeAll(() => {
        // Spy on logger.error and logger.info globally, suppress output but allow validation
        errorSpy = vi.spyOn(logger, 'error').mockImplementation((..._args: any[]) => logger);
        infoSpy = vi.spyOn(logger, 'info').mockImplementation((..._args: any[]) => logger);
        startServer()
        .then(() => {
            expect(infoSpy).toHaveBeenNthCalledWith(1, expect.stringMatching(/Server listening on http:\/\/localhost:\/*/));
            expect(infoSpy).toHaveBeenNthCalledWith(2, expect.stringMatching(/WebSocket endpoint at ws:\/\/localhost:\/*/));
            infoSpy.mockClear(); // Clear calls for the test validations
        });
    });

    afterAll(async () => {
        gameServer.close();
        gameServer.close();
        errorSpy.mockRestore();
        infoSpy.mockRestore();
    });

    beforeEach(async () => {
        // Create client connection
        ws = new WebSocket(WS_URL);
        await new Promise(resolve => ws.on('open', resolve));
        // Validate logging for new connection
        expect(infoSpy).toHaveBeenCalled();
        const callArgs = infoSpy.mock.calls[0];
        expect(callArgs[0]).toMatch(/New WebSocket connection/);
        infoSpy.mockClear(); // Clear calls for next validation
    });

    afterEach(async () => {
        ws.close();
        // Wait for the close event to complete before validating async effects
        await new Promise(resolve => ws.on('close', resolve));
        // Validate logging for connection close
        expect(infoSpy).toHaveBeenCalled();
        const callArgs = infoSpy.mock.calls[0];
        expect(callArgs[0]).toMatch(/Client disconnected. Game removed./);
        infoSpy.mockClear(); // Clear calls for next validation
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

        it('should return error on invalid JSON messages and log error', async () => {
            ws.send('invalid json');
            
            const response = await new Promise<any>(resolve => {
                ws.once('message', data => {
                    resolve(JSON.parse(data.toString()));
                });
            });

            // Validate error response to client
            expect(response.type).toBe(ServerMessageType.GAME_ERROR);

            // Validate error logged server side
            expect(errorSpy).toHaveBeenCalled();
            const callArgs = errorSpy.mock.calls[0];
            expect(callArgs[0]).toMatch(/Failed to process message/);
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