# Solana Visualizer Frontend

This is the frontend for the Solana Visualizer tool, which helps visualize relationships between transactions on the Solana blockchain.

## UI Features

The frontend includes the following user interface features:

- **Modern Design**: A clean, dark-themed interface with intuitive controls
- **Interactive Graph**: Visualize Solana transactions and accounts with a draggable, zoomable graph
- **Color-Coded Nodes**: Different types of entities (wallets, programs, tokens) use distinct colors for easy identification
- **Detail Panel**: Click on any node to view detailed information in a side panel
- **Search History**: Quick access to previously searched addresses
- **Responsive Layout**: Adapts to different screen sizes

## Components

The frontend is organized into modular components:

- **Header**: App title and navigation controls
- **NodeInfoPanel**: Detailed view of selected node data
- **CustomNode**: Styled node renderer for React Flow
- **Theme**: Centralized theme configuration for consistent styling

## Development

This project is built with:

- **React**: Frontend library
- **TypeScript**: Type safety
- **React Flow**: Graph visualization
- **Tailwind CSS**: Styling

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Enter a Solana address in the search bar
2. The visualization will display transactions related to that address
3. Click on nodes to explore details
4. Navigate through the graph by dragging, zooming, and panning
5. Click on "Explore Node" to visualize a different address
