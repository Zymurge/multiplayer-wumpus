export type ClientMessageType = 'start_game' | 'click_cell' | 'reset_game';

export interface ClientMessage {
    type: ClientMessageType;
    payload?: {
        x?: number;
        y?: number;
        gridSize?: number;
        difficulty?: number;
    };
}

export type ServerMessageType = 'game_state' | 'game_error' | 'game_over';

export interface ServerMessage {
    type: ServerMessageType;
    payload: {
        grid?: GameCell[][];
        moves?: number;
        found?: boolean;
        distance?: number;
        error?: string;
        message?: string;
    };
}

export interface GameCell {
    value: string;
    color: string;
    showWumpus: boolean;
}

export interface GameState {
    displayGrid: GameCell[][];
    moves: number;
    gameWon: boolean;
    found: boolean;
    distance: number;
}

export class GameError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'GameError';
    }
}