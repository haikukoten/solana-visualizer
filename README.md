**[Explaination Video](https://youtu.be/cNOKLyb2zhA)**

# Solana Ecosystem Visualizer

A blockchain visualization tool designed to map interactions within the Solana ecosystem, inspired by tools like BubbleMaps and Breadcrumbs.app.

## Description

This tool provides an intuitive, interactive way to track protocols, wallets, transactions, and interactions on the Solana blockchain. It aims to make on-chain data more digestible, insightful, and accessible for investigators, analysts, and explorers by visualizing the flow of funds and activity.

Currently, it can fetch recent transaction history for a given Solana address using the Helius API and display a graph showing the top cumulative SOL destinations from that address.

## Features

*   **Address Transaction History:** Fetches recent transaction history for a specified Solana address via the Helius API.
*   **Top SOL Destinations View:** Aggregates native SOL transfers from the fetched history and displays a graph of the source address connected to the top 10 destination addresses based on cumulative SOL sent.
*   **Interactive Graph:** Uses `react-flow` for basic graph rendering, allowing panning and zooming.
*   **Monorepo Structure:** Separate frontend and backend applications.

**(Planned / Future Features)**

*   More sophisticated graph layout algorithms (Dagre, ELK).
*   Detailed edge creation logic (visualizing specific program calls, SPL token transfers).
*   Custom node types/styles (wallets vs. programs vs. token accounts).
*   Node expansion on click (fetch history for clicked node).
*   Filtering and search capabilities.
*   Time range selection.
*   Improved UI/UX.
*   Real-time updates via WebSockets.

## Technology Stack

*   **Frontend:**
    *   React
    *   TypeScript
    *   Vite (Build Tool)
    *   React Flow (Graph Visualization)
    *   Tailwind CSS (Styling)
*   **Backend:**
    *   Node.js
    *   Express
    *   TypeScript
    *   Helius SDK
    *   `dotenv` (Environment Variables)
    *   `ts-node` / `nodemon` (Development)

## Project Structure

```
.
├── backend/         # Node.js/Express backend application
│   ├── src/
│   │   └── index.ts # Server entry point & API logic
│   ├── .env         # Environment variables (API key) - MUST BE CREATED
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
├── frontend/        # React/Vite frontend application
│   ├── src/
│   │   └── App.tsx  # Main React component with visualization
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md        # This file
```

## Setup and Installation

**Prerequisites:**

*   Node.js (v18 or later recommended)
*   npm (usually comes with Node.js)
*   Helius API Key (get one from [https://helius.dev/](https://helius.dev/))

**1. Backend Setup:**

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create the environment file
# IMPORTANT: Paste your Helius API key into this file
cp .env.example .env || echo "HELIUS_API_KEY=YOUR_API_KEY_HERE" > .env 
# (or manually create .env and add HELIUS_API_KEY=...)

# Run the backend server (development mode)
# Use ts-node directly if nodemon causes issues
npx ts-node src/index.ts 
# OR (if nodemon installed and working)
# npm run dev 
```
The backend server should start and log that it's listening on port 3001.

**2. Frontend Setup:**

```bash
# Navigate to the frontend directory (from the project root)
cd ../frontend 
# Or open a new terminal in the frontend directory

# Install dependencies
npm install

# Run the frontend development server
npm run dev
```
The frontend development server should start (usually on port 5173) and provide a URL to open in your browser.

## Running the Application

1.  Start the backend server first (see Backend Setup).
2.  Start the frontend server (see Frontend Setup).
3.  Open the frontend URL (e.g., `http://localhost:5173`) in your web browser.

## Usage

1.  Enter a valid Solana address (wallet or program ID) into the input field at the top.
2.  Click the "Visualize" button.
3.  The application will fetch data from the backend (which queries Helius) and display a graph showing the entered address connected to the top 10 addresses it has sent the most cumulative SOL to within the fetched transaction limit.

## License

This project is licensed under the BSD 3-Clause License - see the [LICENSE](LICENSE) file for details. 
