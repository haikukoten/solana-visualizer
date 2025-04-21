import React, { useCallback, useState, FormEvent } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

// Define API URL (adjust if your backend runs on a different port/host)
const API_URL = 'http://localhost:3001/api/graph-data';

// Default options for React Flow
const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

function FlowVisualizer() { // Renamed component for clarity
  // State for React Flow
  const [nodes, setNodes] = useState<Node[]>([]); // Start with empty nodes
  const [edges, setEdges] = useState<Edge[]>([]); // Start with empty edges

  // State for UI
  const [addressInput, setAddressInput] = useState<string>(''); // Input field state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // React Flow specific callbacks
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Function to fetch graph data from backend
  const fetchGraphData = useCallback(async (address: string) => {
    if (!address) return; // Don't fetch if address is empty

    setIsLoading(true);
    setError(null);
    console.log(`Fetching data for address: ${address}`);

    try {
      const response = await fetch(`${API_URL}?address=${encodeURIComponent(address)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      console.log("Data received from backend:", data);

      // Ensure data has nodes and edges arrays
      if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error("Invalid data format received from backend");
      }

      // Set nodes and edges (React Flow will automatically re-layout)
      setNodes(data.nodes);
      setEdges(data.edges);

    } catch (err) {
      console.error("Failed to fetch graph data:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setNodes([]); // Clear graph on error
      setEdges([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array: function doesn't depend on component state/props

  // Handle form submission
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault(); // Prevent default form submission page reload
    fetchGraphData(addressInput);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 text-white">
      {/* Input Form Area */}
      <div className="p-4 bg-gray-800 shadow-md z-10">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <label htmlFor="solanaAddress" className="font-semibold">Solana Address:</label>
          <input
            id="solanaAddress"
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Enter Solana address (e.g., wallet, program)"
            className="flex-grow p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button 
            type="submit"
            disabled={isLoading || !addressInput}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Loading...' : 'Visualize'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">Error: {error}</p>}
      </div>

      {/* React Flow Area */}
      <div className="flex-grow relative"> {/* Use flex-grow to take remaining space */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
          className="bg-gray-900" // Ensure flow background matches container
        >
          <Controls />
          <MiniMap nodeColor={(n) => n.type === 'input' ? '#00ff00' : '#ff007f'} nodeStrokeWidth={3} zoomable pannable />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#444" />
        </ReactFlow>
        {/* Optional: Absolute positioned loading overlay */}
        {isLoading && (
             <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-20">
                 <p className="text-xl font-semibold">Loading Transactions...</p>
             </div>
        )}
      </div>
    </div>
  );
}

export default FlowVisualizer;
