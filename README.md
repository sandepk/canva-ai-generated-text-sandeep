# Collaborative Visual Canvas with AI Assistant

A modern, interactive canvas application where users can create, edit, and manage text-based nodes with AI assistance.

## Features

- **Interactive Canvas**: Click anywhere to create new nodes
- **Drag & Drop**: Freely move nodes around the canvas
- **Text Editing**: Double-click nodes to edit text content
- **AI Assistant**: Generate new content or update existing nodes
- **Visual Feedback**: Smooth animations and hover effects
- **Responsive Design**: Works on all screen sizes
- **CanvasToImage**: html2canvas to convert html to image
- **LocalStorage**: Persistent for Local storage

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating Nodes

- Click anywhere on the canvas to create a new node
- Use the "Add Node" button in the toolbar
- Ask the AI assistant to generate content

### Editing Nodes

- Double-click any node to edit its text
- Press Enter to save, Escape to cancel
- Use the edit button that appears on hover

### AI Assistant

- Click the "AI Assistant" button to open the AI panel
- Generate new nodes with custom prompts
- Update existing nodes by clicking the AI button on any node
- Use quick suggestions for common tasks

### Moving Nodes

- Click and drag any node to move it around the canvas
- Nodes will show visual feedback during dragging

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx          # Main canvas component
│   ├── CanvasNode.tsx      # Individual node component
│   ├── AIAssistant.tsx     # AI assistant panel
│   └── Toolbar.tsx         # Top toolbar
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Root application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons
- **Express.js** - Backend server
- **OpenAI API** - AI text generation
- **CORS** - Cross-origin resource sharing

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Backend:

cd server
npm install
node server.js

## Frontend:

npm install
npm run dev
