import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Helius, EnrichedTransaction } from 'helius-sdk';
import { PublicKey, ConfirmedSignatureInfo } from '@solana/web3.js';

// Define simplified types matching React Flow structure
interface NodeData { label: string; }
interface Position { x: number; y: number; }
interface BackendNode {
    id: string;
    position: Position;
    data: NodeData;
    type?: string; 
}
interface BackendEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean; // Match frontend defaultEdgeOptions
}

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- Add Global Request Logger --- 
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
    next(); // Pass control to the next middleware/handler
});
// --- End Global Request Logger --- 

// Ensure API key is loaded
const apiKey = process.env.HELIUS_API_KEY;
if (!apiKey) {
  console.error("HELIUS_API_KEY not found in .env file");
  process.exit(1);
}

// Initialize Helius SDK
const helius = new Helius(apiKey);
const HELIUS_RPC_URL = helius.connection.rpcEndpoint; // Get the endpoint URL
console.log(`Backend configured to use Helius RPC endpoint: ${HELIUS_RPC_URL}`);

// Enable CORS for all routes
app.use(cors());

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Solana Visualizer Backend is running!');
});

// Define an async handler middleware type for clarity
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

// Helper function for direct RPC calls with timeout
async function heliusFetch(method: string, params: any[], timeoutMs: number = 20000): Promise<any> {
    console.log(`[${new Date().toISOString()}] Calling RPC method: ${method} with timeout ${timeoutMs}ms`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.log(`[${new Date().toISOString()}] RPC call timeout for method ${method} after ${timeoutMs}ms`);
        controller.abort();
    }, timeoutMs);

    let fetchResponse: globalThis.Response;
    try {
        fetchResponse = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'helius-viz',
                method: method,
                params: params,
            }),
            signal: controller.signal,
        });
    } catch (error) {
         clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
             console.error(`[${new Date().toISOString()}] RPC call aborted due to timeout for method ${method}`);
            throw new Error(`RPC call timed out after ${timeoutMs}ms`);
        } else {
             console.error(`[${new Date().toISOString()}] Fetch error during RPC call for method ${method}:`, error);
             throw error; 
        }
    }

    clearTimeout(timeoutId);

    if (!fetchResponse.ok) { 
        let errorBody = `HTTP error! status: ${fetchResponse.status}`;
        try {
            const errorJson = await fetchResponse.json();
            errorBody = JSON.stringify(errorJson.error || errorJson);
        } catch (e) { /* Ignore parsing error */ }
        console.error(`[${new Date().toISOString()}] RPC call failed for method ${method}: ${errorBody}`);
        throw new Error(`RPC call failed: ${errorBody}`);
    }

    const data = await fetchResponse.json();
    if (data.error) {
        console.error(`[${new Date().toISOString()}] RPC call error for method ${method}: ${JSON.stringify(data.error)}`);
        throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
    }
    console.log(`[${new Date().toISOString()}] RPC call success for method: ${method}`);
    return data.result;
}

const getGraphDataHandler: AsyncHandler = async (req, res, next) => {
  const address = req.query.address as string;
  // Fetch more transactions to get a better cumulative picture, but be mindful of limits
  const limit = parseInt(req.query.limit as string) || 50; // Increase limit, e.g., to 50
  const topN = 10; // Number of top destinations to show
  const timeoutMs = 30000; // Increase timeout slightly for potentially more data

  if (!address) {
    return res.status(400).json({ error: 'Address query parameter is required' });
  }
  // Validate Key
  try { new PublicKey(address); } catch (e) { return res.status(400).json({ error: `Invalid address: ${address}` }); }

  const controller = new AbortController(); 
  const overallTimeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Helper function to handle SDK calls with timeout
  const sdkCallWithTimeout = <T>(sdkPromise: Promise<T>): Promise<T> => {
     return new Promise(async (resolve, reject) => {
        const onAbort = () => { reject(new Error('SDK call aborted due to overall timeout')); };
        if (controller.signal.aborted) { return reject(new Error('Operation aborted before SDK call')); }
        controller.signal.addEventListener('abort', onAbort);
        try { resolve(await sdkPromise); } catch (error) { reject(error); }
        finally { controller.signal.removeEventListener('abort', onAbort); }
    });
  };

  try {
    // Step 1: Get Signatures (as before)
    console.log(`[${new Date().toISOString()}] Step 1: Getting signatures for ${address} via SDK (limit: ${limit})...`);
    const signaturesResult: ConfirmedSignatureInfo[] = await sdkCallWithTimeout(
        helius.connection.getSignaturesForAddress(new PublicKey(address), { limit: limit })
    );
    console.log(`[${new Date().toISOString()}] SDK getSignaturesForAddress call completed.`);

    if (!signaturesResult || signaturesResult.length === 0) {
        clearTimeout(overallTimeoutId);
        return res.json({ nodes: [], edges: [] });
    }
    const signatures = signaturesResult.map(sigInfo => sigInfo.signature);
    console.log(`[${new Date().toISOString()}] Found ${signatures.length} signatures.`);

    // Step 2: Parse Transactions (as before)
    console.log(`[${new Date().toISOString()}] Step 2: Calling helius.parseTransactions via SDK...`);
    const parsedTransactions: EnrichedTransaction[] = await sdkCallWithTimeout(
        helius.parseTransactions({ transactions: signatures })
    );
    clearTimeout(overallTimeoutId); 
    console.log(`[${new Date().toISOString()}] Successfully parsed ${parsedTransactions.length} transactions via Helius SDK.`);

    if (!Array.isArray(parsedTransactions)) {
        throw new Error("Invalid data format received from Helius SDK parseTransactions");
    }

    // --- Step 3: Aggregate Cumulative SOL Transfers --- 
    console.log(`[${new Date().toISOString()}] Step 3: Aggregating cumulative SOL transfers from ${address}...`);
    const cumulativeSOL: Map<string, number> = new Map(); // Map<destinationAddress, totalLamportsSent>

    parsedTransactions.forEach((tx) => {
        tx.nativeTransfers?.forEach(nt => {
            // Check if transfer is FROM the queried address and has amount
            if (nt.fromUserAccount === address && nt.toUserAccount && nt.amount) {
                const currentTotal = cumulativeSOL.get(nt.toUserAccount) || 0;
                cumulativeSOL.set(nt.toUserAccount, currentTotal + nt.amount);
            }
        });
    });

    // --- Step 4: Sort and Filter Top N --- 
    const sortedTransfers = Array.from(cumulativeSOL.entries())
        .map(([destAddress, lamports]) => ({ address: destAddress, totalSOL: lamports / 1e9 })) // Convert lamports to SOL
        .sort((a, b) => b.totalSOL - a.totalSOL) // Sort descending by SOL amount
        .slice(0, topN); // Get the top N results

    console.log(`[${new Date().toISOString()}] Found top ${sortedTransfers.length} cumulative SOL destinations.`);

    // --- Step 5: Generate Nodes & Edges for Top N --- 
    const nodes: BackendNode[] = [];
    const edges: BackendEdge[] = [];
    const nodeIds = new Set<string>();

    // Add the source node
    nodes.push({ 
        id: address, 
        position: { x: 100, y: 400 }, // Center the source node
        data: { label: `🔍 ${address.substring(0, 4)}...${address.substring(address.length - 4)}` },
        type: 'input' 
    });
    nodeIds.add(address);

    // Add nodes and edges for top destinations
    sortedTransfers.forEach((transfer, index) => {
        const destAddress = transfer.address;
        if (!nodeIds.has(destAddress)) {
             nodes.push({ 
                id: destAddress, 
                // Arrange destination nodes somewhat logically (e.g., spread out)
                position: { x: 600, y: 100 + index * (600 / Math.max(1, topN-1)) }, 
                data: { label: `${destAddress.substring(0, 4)}...${destAddress.substring(destAddress.length - 4)}` } 
             });
             nodeIds.add(destAddress);
        }
        // Add edge from source to this destination
        edges.push({
            id: `edge-${address}-${destAddress}`,
            source: address,
            target: destAddress,
            label: `${transfer.totalSOL.toLocaleString(undefined, {maximumFractionDigits: 4})} SOL`,
            animated: true
        });
    });

    console.log(`[${new Date().toISOString()}] Generated ${nodes.length} nodes and ${edges.length} edges for top ${topN} view.`);
    res.json({ nodes, edges });

  } catch (error) {
    clearTimeout(overallTimeoutId);
     if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
        console.error(`[${new Date().toISOString()}] Request timed out or aborted for address ${address}`);
        return res.status(504).json({ error: 'Request timed out or aborted' });
     } else {
        console.error(`[${new Date().toISOString()}] Error in getGraphDataHandler for address ${address}:`, error);
        if (error instanceof Error && error.message.includes('403')) {
            return res.status(403).json({ error: 'Forbidden. Check Helius API key permissions.'});
        }
        next(error); 
     }
  }
};

// API route using the typed async handler
app.get('/api/graph-data', getGraphDataHandler);

// Basic Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[${new Date().toISOString()}] Final Error Handler:`, err.stack);
    res.status(500).json({ error: err.message || 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
}); 