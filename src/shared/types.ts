export enum ClientMessageType {
    CLICK_CELL = 'click_cell',
    RESET_GAME = 'reset_game',
    START_GAME = 'start_game',
}

export interface ClientMessage {
    type: ClientMessageType;
    payload?: {
        x?: number;
        y?: number;
        gridSize?: number;
        fadeSteps?: number;
    };
}

export interface ErrorInfo {
    error: string;
    message: string | undefined;
}

export interface GameCell {
    value: string;
    color: string;
    showWumpus: boolean;
}

export interface GameState {
    grid: GameCell[][];
    distance: number | undefined;
    found: boolean;
    moves: number;
}

export enum ServerMessageType {
    GAME_ERROR = 'game_error',
    GAME_OVER = 'game_over',
    GAME_STATE = 'game_state'
}

export interface ServerMessage {
    type: ServerMessageType;
    payload: {
        gameState?: GameState;
        errorInfo?: ErrorInfo;
    };
}