/**
 * Centralized color palette for the Hunt the Wumpus game
 * All colors used throughout the application should be defined here
 */

export const COLORS = {
  // Game colors
  wumpus: '#FFD700',           // Gold for wumpus
  unclicked: '#C0C0C0',           // Dark gray for unclicked cells
  gridBackground: '#606060',      // Gray for grid background
  
  // UI colors
  success: '#4CAF50',          // Green for success states
  successHover: '#45a049',     // Darker green for hover
  border: '#999999',              // Gray for borders
  borderHighlight: '#ffff00',     // White for highlighted borders
  
  // Text colors
  textPrimary: '#333',         // Dark gray for primary text
  textSuccess: '#4CAF50',      // Green for success text
  textError: '#b71f3b',        // Red for error text
  textEmphasis: '#0b460b',     // Dark green for emphasis
  
  // Background colors
  overlay: '#2a5050',          // Reddish overlay background
  gameBorder: '#66d169',       // Light green for game borders
  hexBorder: '#137141',        // Dark green for hex cell borders
  
  // Wumpus sprite colors
  wumpusBody: '#4a0e4e',       // Purple for wumpus body
  wumpusHead: '#5a1e5e',       // Lighter purple for head
  wumpusStroke: '#2a0a2e',     // Dark purple for outlines
  wumpusEyes: '#ff4444',       // Red for eyes and mouth
  wumpusFangs: '#ffffff',      // White for fangs
  
  // Default fallbacks
  defaultHexBackground: '#AA4040',  // Default hex cell color
  defaultCellBackground: '#606060',    // Default grid cell color
} as const;

/**
 * Type for accessing color keys
 */
export type ColorKey = keyof typeof COLORS;

/**
 * Get a color value by key with fallback
 */
export function getColor(key: ColorKey, fallback?: string): string {
  return COLORS[key] ?? fallback ?? '#000000';
}

/**
 * Color theme variants that can be passed as props
 */
export interface ColorTheme {
  wumpus?: string;
  unclicked?: string;
  gridBackground?: string;
  success?: string;
  textPrimary?: string;
}

/**
 * Merge theme overrides with default colors
 */
export function mergeTheme(overrides: ColorTheme = {}) {
  return { ...COLORS, ...overrides } as const;
}
