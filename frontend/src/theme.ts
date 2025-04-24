// Theme configuration for the Solana Visualizer - 90s Terminal Style
const theme = {
  colors: {
    // Base colors
    primary: '#00ff00',     // Bright Green
    primaryHover: '#33ff33',
    secondary: '#ffa500',   // Amber/Orange
    secondaryHover: '#ffbf33',
    danger: '#ff0000',      // Bright Red
    dangerHover: '#ff3333',
    accent: '#00ffff',      // Cyan
    
    // Background colors
    bgDark: '#000000',      // Black bg
    bgMedium: '#111111',    // Dark gray bg (slight contrast)
    bgLight: '#222222',     // Lighter gray bg
    
    // Text colors
    textPrimary: '#00ff00', // Bright Green
    textSecondary: '#cccccc', // Light Gray
    textMuted: '#888888',   // Dark Gray
    textInput: '#ffffff',  // White for input text
    
    // Border colors
    border: '#00ff00',      // Green border
    borderLight: '#33ff33', // Lighter green border
    borderMedium: '#555555', // Gray border
    
    // Node colors (using primary, secondary, accent, muted)
    nodeWallet: '#00ff00',   // Green for wallets
    nodeProgram: '#00ffff',  // Cyan for programs
    nodeToken: '#ffa500',    // Amber for tokens
    nodeDefault: '#888888',  // Gray for others
    
    // Edge colors
    edgeDefault: '#00ff00',  // Green
    edgeHighlight: '#ffa500' // Amber when highlighted
  },
  
  // Border radius - Flat style
  borderRadius: {
    sm: '0px',
    md: '0px',
    lg: '0px',
    xl: '0px',
    full: '0px',
  },
  
  // Shadows - Flat style
  shadows: {
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
  },
  
  // Transitions
  transitions: {
    default: 'all 0.2s ease',
    fast: 'all 0.1s ease',
  }
};

export default theme;

export const darkTheme = {
  name: 'dark',
  colors: {
    primary: '#00ff00',     // Bright Green
    primaryHover: '#33ff33',
    secondary: '#ffa500',   // Amber/Orange
    secondaryHover: '#ffbf33',
    danger: '#ff0000',      // Bright Red
    dangerHover: '#ff3333',
    accent: '#00ffff',      // Cyan
    
    bgDark: '#000000',      // Black bg
    bgMedium: '#111111',    // Dark gray bg
    bgLight: '#222222',     // Lighter gray bg
    
    textPrimary: '#00ff00', // Bright Green
    textSecondary: '#cccccc', // Light Gray
    textMuted: '#888888',   // Dark Gray
    textInput: '#ffffff',  // White for input text
    
    border: '#00ff00',      // Green border
    borderLight: '#33ff33',
    borderMedium: '#555555',
    
    nodeWallet: '#00ff00',   // Green
    nodeProgram: '#00ffff',  // Cyan
    nodeToken: '#ffa500',    // Amber
    nodeDefault: '#888888',  // Gray
    
    edgeDefault: '#00ff00',  // Green
    edgeHighlight: '#ffa500' 
  },
  borderRadius: {
    sm: '0px', md: '0px', lg: '0px', xl: '0px', full: '0px',
  },
  shadows: {
    sm: 'none', md: 'none', lg: 'none', xl: 'none',
  },
  transitions: {
    default: 'all 0.2s ease', fast: 'all 0.1s ease',
  }
};

export const lightTheme = {
  name: 'light',
  colors: {
    primary: '#008000',     // Dark Green
    primaryHover: '#006400',
    secondary: '#cc5500',   // Dark Amber/Orange
    secondaryHover: '#b34700',
    danger: '#cc0000',      // Dark Red
    dangerHover: '#b30000',
    accent: '#008b8b',      // Dark Cyan
    
    bgDark: '#ffffff',      // White bg
    bgMedium: '#f0f0f0',    // Light gray bg
    bgLight: '#e0e0e0',     // Lighter gray bg
    
    textPrimary: '#000000', // Black text
    textSecondary: '#333333', // Dark Gray
    textMuted: '#777777',   // Medium Gray
    textInput: '#000000',  // Black for input text
    
    border: '#008000',      // Dark Green border
    borderLight: '#006400',
    borderMedium: '#aaaaaa',
    
    nodeWallet: '#008000',   // Dark Green
    nodeProgram: '#008b8b',  // Dark Cyan
    nodeToken: '#cc5500',    // Dark Amber
    nodeDefault: '#777777',  // Gray
    
    edgeDefault: '#008000',  // Dark Green
    edgeHighlight: '#cc5500' 
  },
  borderRadius: {
    sm: '0px', md: '0px', lg: '0px', xl: '0px', full: '0px',
  },
  shadows: {
    sm: 'none', md: 'none', lg: 'none', xl: 'none',
  },
  transitions: {
    default: 'all 0.2s ease', fast: 'all 0.1s ease',
  }
}; 