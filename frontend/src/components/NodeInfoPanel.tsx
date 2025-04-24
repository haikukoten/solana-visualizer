import * as React from 'react';
import { Node } from 'reactflow';
import { useTheme } from '../context/ThemeContext';

interface NodeInfoPanelProps {
  node: Node;
  onClose: () => void;
  onExploreNode: (nodeId: string) => void;
}

function getNodeTypeColor(theme: any, type: string): string {
  const typeStr = type.toLowerCase();
  if (typeStr.includes('wallet')) return theme.colors.nodeWallet;
  if (typeStr.includes('program')) return theme.colors.nodeProgram;
  if (typeStr.includes('token')) return theme.colors.nodeToken;
  return theme.colors.nodeDefault;
}

const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({ node, onClose, onExploreNode }) => {
  const { theme } = useTheme();

  return (
    <div 
      className="w-96 border-l p-3 font-mono flex flex-col gap-3"
      style={{ 
        backgroundColor: theme.colors.bgMedium, 
        borderColor: theme.colors.border, 
        color: theme.colors.textPrimary 
      }}
    >
      <div className="flex justify-between items-center border-b pb-1" style={{ borderColor: theme.colors.borderMedium }}>
        <h3 className="text-lg">NODE_DETAILS</h3>
        <button 
          onClick={onClose}
          className="px-1 border border-transparent hover:border-current"
          style={{ color: theme.colors.danger }}
          aria-label="Close panel"
          title="Close (X)"
        >
          [X]
        </button>
      </div>
      
      <div className="space-y-3 overflow-y-auto flex-grow">
        <InfoSection theme={theme} title="ID">
          <div className="text-base break-all" style={{ color: theme.colors.textSecondary }}>{node.id}</div>
        </InfoSection>
        
        <InfoSection theme={theme} title="LABEL">
          <div className="font-medium text-base" style={{ color: theme.colors.textSecondary }}>{node.data?.label || '(none)'}</div>
        </InfoSection>
        
        {node.data?.type && (
          <InfoSection theme={theme} title="TYPE">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 inline-block border"
                style={{ 
                  borderColor: getNodeTypeColor(theme, node.data.type),
                  backgroundColor: getNodeTypeColor(theme, node.data.type) 
                }}
              />
              <span style={{ color: theme.colors.textSecondary }} className="text-base">{node.data.type}</span>
            </div>
          </InfoSection>
        )}
        
        {node.data?.details && (
          <InfoSection theme={theme} title="DETAILS">
            <details className="mt-1">
              <summary 
                className="cursor-pointer text-sm hover:underline"
                style={{ color: theme.colors.accent }}
              >
                [Show_Raw_Data]
              </summary>
              <pre 
                className="text-sm overflow-x-auto mt-1 p-2 border"
                style={{ backgroundColor: theme.colors.bgDark, borderColor: theme.colors.borderMedium, color: theme.colors.textSecondary }}
              >
                {JSON.stringify(node.data.details, null, 2)}
              </pre>
            </details>
          </InfoSection>
        )}
        
        <div className="flex gap-3 pt-3 border-t" style={{ borderColor: theme.colors.borderMedium }}>
          <TerminalButton 
            theme={theme}
            text="[View_Explorer]"
            onClick={() => {
              window.open(`https://explorer.solana.com/address/${node.id}`, '_blank');
            }}
            className="flex-grow"
            style={{ color: theme.colors.accent }}
          />
          <TerminalButton 
            theme={theme}
            text="[Explore_Node]"
            onClick={() => onExploreNode(node.id)}
            style={{ color: theme.colors.secondary }}
          />
        </div>
      </div>
    </div>
  );
};

interface InfoSectionProps {
    title: string;
    children: React.ReactNode;
    theme: any;
}
const InfoSection: React.FC<InfoSectionProps> = ({ title, children, theme }) => (
  <div className="border p-2" style={{ borderColor: theme.colors.borderMedium }}>
    <div className="text-sm uppercase pb-1 border-b mb-2" style={{ color: theme.colors.textMuted, borderColor: theme.colors.borderMedium }}>{title}</div>
    {children}
  </div>
);

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    theme: any;
}
const TerminalButton: React.FC<TerminalButtonProps> = ({ text, theme, className = '', ...props }) => (
  <button
    {...props}
    className={`px-2 py-1 border border-transparent hover:border-current ${className}`}
    style={{ 
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.bgLight, 
        color: theme.colors.primary, 
        ...props.style
    }}
  >
    {text}
  </button>
);

export default NodeInfoPanel; 