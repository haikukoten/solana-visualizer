import React from 'react';
import { useTheme } from '../context/ThemeContext'; // Assuming theme context is used for styling

interface HistoryPanelProps {
  history: string[];
  onLoad: (address: string) => void;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, onClose }) => {
  const { theme } = useTheme();

  return (
    <div 
      className="absolute top-0 right-0 h-full w-64 border-l z-20 flex flex-col" // Positioned on the right
      style={{ backgroundColor: theme.colors.bgMedium, borderColor: theme.colors.border }}
    >
      {/* Header */}
      <div 
        className="p-2 border-b flex justify-between items-center" 
        style={{ borderColor: theme.colors.borderMedium }}
      >
        <span style={{ color: theme.colors.textMuted }}>-- HISTORY --</span>
        <button 
          onClick={onClose} 
          className="px-2 py-0 border text-sm"
          style={{ 
              borderColor: theme.colors.border, 
              backgroundColor: theme.colors.bgLight,
              color: theme.colors.textSecondary 
            }}
          title="Close Panel (Esc)"
        >
          X
        </button>
      </div>
      
      {/* List */}
      {history.length > 0 ? (
        <ul className="flex-grow overflow-y-auto">
          {history.map((address, index) => (
            <li key={index}>
              <button
                onClick={() => onLoad(address)}
                className="w-full text-left p-2 hover:bg-green-900 truncate block"
                style={{ color: theme.colors.textSecondary }}
              >
                {address}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center" style={{ color: theme.colors.textMuted }}>
          No history yet.
        </div>
      )}
    </div>
  );
};

export default HistoryPanel; 