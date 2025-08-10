import { WebSocketServer, WebSocket } from 'ws';
import { WumpusGame } from './lib/game/WumpusGame.js';

interface WebSocketWithPong extends WebSocket { 
    isAlive?: boolean;
}

function heartbeat(this: WebSocketWithPong) {
    this.isAlive = true;
}

let wss: WebSocketServer;
const games = new Map<WebSocket, WumpusGame>();

export function getWebSocketServer() {
    return wss;
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // Handle WebSocket upgrades
    if (event.request.headers.get('upgrade') === 'websocket') {
        // This is a WebSocket upgrade request
        const response = await resolve(event);
        if (response.status === 101) {
            // The response has been hijacked by the WebSocket upgrade
            return response;
        }
    }

    if (!wss) {
        // Create WebSocket server on the same HTTP server
        const server = event.platform?.server;
        if (!server) {
            throw new Error('No server available in platform');
        }

        wss = new WebSocketServer({ server, path: '/api/game/ws' });

        // Ensure all clients stay connected
        const interval = setInterval(() => {
            wss.clients.forEach((ws) => {
                const wsPong = ws as WebSocketWithPong;
                if (!wsPong.isAlive) return ws.terminate();
                wsPong.isAlive = false;
                ws.ping();
            });
        }, 30000);

        wss.on('close', () => clearInterval(interval));

        wss.on('connection', (ws: WebSocket) => {
            const wsPong = ws as WebSocketWithPong;
            wsPong.isAlive = true;
            wsPong.on('pong', heartbeat);

            // Create a new game instance for this connection
            const game = new WumpusGame(5, 5, 4);
            games.set(ws, game);
            console.log('New WebSocket connection established.');

            // Handle messages from the client
            ws.on('message', (rawData: Buffer) => {
                try {
                    const data = JSON.parse(rawData.toString());
                    const game = games.get(ws);
                    if (!game) {
                        console.error('No game found for this connection');
                        return;
                    }

                    // Handle click events
                    if (data.type === 'click') {
                        const { x, y } = data;
                        if (typeof x !== 'number' || typeof y !== 'number') {
                            console.error('Invalid click coordinates');
                            return;
                        }

                        // Process the click
                        // Apply the click to the game
                        game.setClicked(x, y);

                        // Get the current game state
                        // Get all cells in a 2D array and flatten it
                        const cells = game.getCellsAs2DArray().flat();
                        const cellStates = cells.map(cell => {
                            const revealed = cell.clicked;
                            const isWumpus = revealed && game.wumpus.x === cell.position.x && game.wumpus.y === cell.position.y;
                            return {
                                x: cell.position.x,
                                y: cell.position.y,
                                value: !isWumpus && revealed ? game.last?.dist.toString() ?? '' : '',
                                revealed,
                                isWumpus,
                            };
                        });

                        // Send updated game state to the client
                        const response = {
                            type: 'gameState',
                            cells: cellStates,
                            gameWon: game.last?.dist === 0,
                            found: game.last?.dist === 0,
                        };

                        ws.send(JSON.stringify(response));
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            });

            // Handle client disconnection
            ws.on('close', () => {
                games.delete(ws);
                console.log('Client disconnected');
            });
        });
    }

    const response = await resolve(event);
    return response;
}
