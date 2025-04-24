import * as React from 'react';
// import theme from '../theme'; // Remove static theme import
import { useTheme } from '../context/ThemeContext'; // Import useTheme hook

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { theme, toggleTheme, mode } = useTheme(); // Get theme and toggle function

  return (
    <header 
      className="flex items-center justify-between p-3 border-b font-mono"
      style={{ 
        backgroundColor: theme.colors.bgMedium,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary 
      }}
    >
      <div className="flex items-baseline gap-4"> 
        <div 
          className="text-3xl flex items-center"
          style={{ color: theme.colors.primary }} 
        >
          <span className="mr-2">[#]</span>
          {title}
        </div>
        {subtitle && (
          <div style={{ color: theme.colors.textMuted }} className="text-base">
            {subtitle}
          </div>
        )}
      </div>
      {/* Add Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="px-2 py-1 border hover:opacity-80"
        style={{ 
          borderColor: theme.colors.border, 
          backgroundColor: theme.colors.bgLight, 
          color: theme.colors.accent 
        }}
        title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
      >
        {mode === 'light' ? '[Dark]' : '[Light]'}
      </button>
    </header>
  );
};

export default Header; 