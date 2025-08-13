export interface WebSocketMessage {
    type: string;
    x?: number;
    y?: number;
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