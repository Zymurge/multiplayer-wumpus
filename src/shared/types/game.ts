export const ClientMessageType = {
    CLICK_CELL: 'click_cell' as const,
    RESET_GAME: 'reset_game' as const,
    START_GAME: 'start_game' as const,
} as const;

export type ClientMessageType = (typeof ClientMessageType)[keyof typeof ClientMessageType];

export interface ClientMessage {
    type: ClientMessageType;
    payload?: {
        x?: number;
        y?: number;
        gridSize?: number;
        difficulty?: number;
    };
}

export const ServerMessageType = {
    GAME_ERROR: 'game_error' as const,
    GAME_OVER: 'game_over' as const,
    GAME_STATE: 'game_state' as const,
} as const;

export type ServerMessageType = (typeof ServerMessageType)[keyof typeof ServerMessageType];

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