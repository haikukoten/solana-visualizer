import * as React from 'react';
import { useCallback, useState, FormEvent } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  FitViewOptions,
  DefaultEdgeOptions,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  useReactFlow,
  NodeMouseHandler,
  MarkerType,
  ProOptions,
  Viewport,
  NodeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './components/CustomNode';
import NodeInfoPanel from './components/NodeInfoPanel';
import Header from './components/Header';
import { useTheme } from './context/ThemeContext';
import HistoryPanel from './components/HistoryPanel';

// Define nodeTypes outside the component to prevent recreation on renders
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// --- HELPER FUNCTIONS & COMPONENTS ---

// Helper function to get node color (now accepts theme)
function getNodeColor(theme: any, type?: string): string {
  if (!type) return theme.colors.nodeDefault;
  const typeStr = type.toLowerCase();
  if (typeStr.includes('wallet')) return theme.colors.nodeWallet;
  if (typeStr.includes('program')) return theme.colors.nodeProgram;
  if (typeStr.includes('token')) return theme.colors.nodeToken;
  return theme.colors.nodeDefault;
}

// Reusable Terminal Button Component (now accepts theme)
interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  theme: any;
}

const TerminalButton: React.FC<TerminalButtonProps> = ({ text, theme, ...props }) => (
  <button
    {...props}
    className={`px-2 py-0 border hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed ${props.className || ''}`}
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

// --- MAIN COMPONENT ---

// Define API URL (adjust if your backend runs on a different port/host)
const API_URL = 'http://localhost:3001/api/graph-data';

// React Flow options
const fitViewOptions: FitViewOptions = {
  padding: 0.4, // Adjusted padding
};

// Default options for edges - apply globally
const defaultEdgeOptions: DefaultEdgeOptions = {
  markerEnd: { type: MarkerType.Arrow, color: '#3B82F6', width: 15, height: 15 }, // Slightly larger arrow
  animated: false, // Turn off animation for cleaner look like breadcrumbs
  style: { 
    strokeWidth: 1.5, // Thinner line
    stroke: '#3B82F6', 
  },
  labelStyle: { 
    fontSize: 9, // Smaller font size like breadcrumbs
    fill: '#E5E7EB', // Lighter grey/white text
    fontWeight: 500,
    fontFamily: 'monospace',
  }, 
  labelBgStyle: { 
    fill: '#1F2937', // Dark background
    fillOpacity: 0.6, 
    padding: '1px 3px' // Reduced padding
  }, 
  labelShowBg: true,
  // Attempt to move label slightly along the path (adjust as needed)
  // labelY: -10, // Negative Y moves it "up" relative to the edge center
};

function SolanaVisualizer() {
  const { theme } = useTheme();

  // React Flow state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { fitView } = useReactFlow();

  // UI state
  const [addressInput, setAddressInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Callbacks
  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect: OnConnect = useCallback((connection) => setEdges((eds) => addEdge({ 
      ...connection, 
    }, eds)), 
    [setEdges]
  );
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => setSelectedNode(node), []);

  // Fetch data
  const fetchGraphData = useCallback(async (address: string) => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    setSelectedNode(null);
    console.log(`Fetching data for address: ${address}`);
    try {
      const response = await fetch(`${API_URL}?address=${encodeURIComponent(address)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error("Invalid data format");
      }
      const customNodes = data.nodes.map((node: Node) => ({ 
          ...node, 
          // Ensure nodes have a default position if none is provided
          position: node.position || { x: Math.random() * 200, y: Math.random() * 200 }, 
          type: 'custom', 
          data: { 
              ...node.data, 
              label: node.data?.label || 'Unknown', 
              type: node.data?.type || 'Default',
              onExplore: handleExploreNode
          } 
      }));
      
      const processedEdges = data.edges.map((edge: Edge) => {
        // Log the raw edge object received from the backend
        console.log("Raw Edge Object:", JSON.stringify(edge));

        // Directly use the label provided by the backend if it exists
        const labelText = typeof edge.label === 'string' ? edge.label : '';

        // DEBUG: Force a label to see if it renders at all
        // const labelText = edge.label || '[Test Label]';

        return {
          ...edge, // Spread the original edge properties (id, source, target)
          label: labelText, // Assign the label
          // All styling should be handled by defaultEdgeOptions
          // No need to spread edge.data if it's not expected or used for labels
        };
      });
      setNodes(customNodes);
      setEdges(processedEdges);
      if (!searchHistory.includes(address)) {
        setSearchHistory((prev) => [address, ...prev].slice(0, 5));
      }
      setTimeout(() => fitView(fitViewOptions), 100);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setNodes([]);
      setEdges([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchHistory, fitView]);

  // Handlers
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    fetchGraphData(addressInput);
  };
  const handleClearGraph = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  };
  const loadFromHistory = (address: string) => {
    setAddressInput(address);
    fetchGraphData(address);
    setIsHistoryOpen(false);
  };
  
  // Fixed node exploration - ensure address is set and properly fetched
  const handleExploreNode = (nodeId: string) => {
    if (!nodeId) return;
    
    console.log(`Exploring node: ${nodeId}`);
    // Update the address input so the user knows what's being explored
    setAddressInput(nodeId);
    // Fetch data for this node with a small delay to ensure UI state is updated
    setTimeout(() => {
      fetchGraphData(nodeId);
      // Close any open panels
      setSelectedNode(null);
    }, 100);
  };

  return (
    <div 
      className="w-screen h-screen flex flex-col font-mono"
      style={{ backgroundColor: theme.colors.bgDark, color: theme.colors.textPrimary }}
    >
      <Header title="SOLANA_VISUALIZER" subtitle="-- Transaction Graph Explorer --" />

      {/* Input Form Area */}
      <div
        className="p-3 border-b shadow-none z-10"
        style={{ backgroundColor: theme.colors.bgMedium, borderColor: theme.colors.border }}
      >
        <form onSubmit={handleSubmit} className="flex gap-3 items-center">
          <label htmlFor="solanaAddress" className="whitespace-nowrap">Address:</label>
          <div className="relative flex-grow flex-shrink min-w-0 max-w-md">
            <input
              id="solanaAddress"
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="solana_address>"
              className="w-full px-2 py-0 leading-tight"
              style={{ color: theme.colors.textInput, backgroundColor: theme.colors.bgLight, borderColor: theme.colors.borderMedium }}
              required
            />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <TerminalButton 
              theme={theme}
              text={isLoading ? "Loading..." : "[Visualize]"}
              onClick={handleSubmit}
              disabled={isLoading || !addressInput}
              className={isLoading ? 'opacity-50 cursor-wait' : ''}
              style={{ backgroundColor: isLoading ? theme.colors.bgLight : theme.colors.primary, color: theme.colors.bgDark }}
            />
            <TerminalButton 
              theme={theme}
              text="[H]" 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title="History"
              style={{ backgroundColor: theme.colors.bgLight, color: theme.colors.accent }}
            />
            {(nodes.length > 0 || edges.length > 0) && (
              <TerminalButton 
                theme={theme}
                text="[X]" 
                onClick={handleClearGraph}
                title="Clear Graph"
                style={{ backgroundColor: theme.colors.danger, color: theme.colors.bgDark }}
              />
            )}
          </div>
        </form>
        {error && (
          <div 
            className="mt-2 p-1 border flex items-center gap-2 text-sm"
            style={{ borderColor: theme.colors.danger, color: theme.colors.danger }}
          >
            <span>ERROR:</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Content Area - Adjusted for potential side panel */}
      <div className="flex-grow flex relative">
        {/* React Flow Canvas */}
        <div className="flex-grow relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={fitViewOptions}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            proOptions={{ hideAttribution: true }}
            style={{ backgroundColor: theme.colors.bgDark }}
            minZoom={0.1}
            maxZoom={2}
            nodesDraggable={true}
            elementsSelectable={true}
          >
            <Controls 
              showInteractive={false}
              style={{ 
                backgroundColor: theme.colors.bgMedium,
                borderColor: theme.colors.border,
                borderWidth: '1px',
                borderRadius: '0px',
                padding: '3px',
                bottom: '10px',
                left: '10px'
              }}
              className="[&>button]:p-0 [&>button]:w-8 [&>button]:h-8 [&>button]:border [&>button]:border-green-500 [&>button]:bg-black [&>button]:text-green-500 hover:[&>button]:bg-green-900"
            />
            <MiniMap 
              nodeColor={(n: Node) => {
                if (n.id === selectedNode?.id) return theme.colors.textSecondary;
                return getNodeColor(theme, n.data?.type); 
              }} 
              nodeStrokeWidth={0} 
              nodeBorderRadius={0}
              zoomable 
              pannable 
              maskColor={theme.colors.bgMedium + 'cc'}
              style={{ 
                backgroundColor: theme.colors.bgMedium,
                borderColor: theme.colors.border,
                borderWidth: '1px',
                borderRadius: '0px',
                width: '200px',
                height: '130px'
              }}
            />
            <Background 
              variant={BackgroundVariant.Lines}
              gap={30} 
              size={1} 
              color={theme.colors.bgLight}
            />
          </ReactFlow>
          
          {/* Empty state - Terminal Style */}
          {nodes.length === 0 && !isLoading && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
              style={{ color: theme.colors.textMuted }}
            >
              <pre className="text-2xl mb-4">
                {
`   ____        __       __
  / __/__ ___ / /____ _/ /____ ___
 _\\ \\/ -_) -_) __/ _ \`/ __/ -_) _ \\
/___/\\__/\\__/\\__/\\_,_/\\__/\\__/_//_/
`
                }
              </pre>
              <h3 className="text-xl mb-2">-- NO DATA LOADED --</h3>
              <p>
                Enter a Solana address above and press [Visualize]
              </p>
            </div>
          )}
          
          {/* Loading overlay */}
          {isLoading && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center z-20"
              style={{ backgroundColor: `${theme.colors.bgDark}e6` }}
            >
              <div className="text-2xl animate-pulse">
                LOADING...
              </div>
              <p style={{ color: theme.colors.textMuted }} className="mt-2 text-sm">
                Fetching transaction data...
              </p>
            </div>
          )}
        </div>
        
        {/* Info Panel */}
        {selectedNode && (
          <NodeInfoPanel 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
            onExploreNode={handleExploreNode}
          />
        )}

        {/* History Panel - Conditionally rendered side panel */}
        {isHistoryOpen && (
            <HistoryPanel 
                history={searchHistory} 
                onLoad={loadFromHistory} 
                onClose={() => setIsHistoryOpen(false)} 
            />
        )}
      </div>
    </div>
  );
}

export default SolanaVisualizer;
