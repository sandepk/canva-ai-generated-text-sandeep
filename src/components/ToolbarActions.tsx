import React from "react";
import { Plus, Bot, FileDown, Image as ImageIcon, ListIcon } from "lucide-react";

interface ToolbarActionsProps {
  onAddNode: () => void;
  onToggleAI: () => void;
  showAI: boolean;
  onExportJSON: () => void;
  onExportImage: () => void;
  toggleList: () => void;
  className?: string;
  "aria-label"?: string;
}

const ToolbarActions: React.FC<ToolbarActionsProps> = ({
  onAddNode,
  onToggleAI,
  showAI,
  onExportJSON,
  onExportImage,
  toggleList,
  className = "",
  "aria-label": ariaLabel,
}) => (
  <div className={`${className} flex-wrap`} aria-label={ariaLabel}>
    <button
      onClick={onAddNode}
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      title="Add Node"
      aria-label="Add a new node to the canvas"
    >
      <Plus className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">Add Node</span>
    </button>

    <button
      onClick={onToggleAI}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
        showAI
          ? "bg-purple-100 text-purple-700"
          : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
      }`}
      title="Toggle AI Assistant"
      aria-label={`${showAI ? 'Hide' : 'Show'} AI Assistant`}
      aria-pressed={showAI}
    >
      <Bot className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">AI Assistant</span>
    </button>
    <span className="text-gray-300 hidden sm:inline">/</span>
    <button
      onClick={onExportJSON}
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
      title="Export as JSON"
      aria-label="Export canvas data as JSON file"
    >
      <FileDown className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">Export JSON</span>
    </button>
    <span className="text-gray-300 hidden sm:inline" aria-hidden="true">/</span>
    <button
      onClick={onExportImage}
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-md transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
      title="Export as Image"
      aria-label="Export canvas as PNG image"
    >
      <ImageIcon className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">Export Image</span>
    </button>
    <span className="text-gray-300 hidden sm:inline" aria-hidden="true">/</span>
    <button
      onClick={toggleList}
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
      title="List Nodes"
      aria-label="Toggle node list visibility"
    >
      <ListIcon className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">List Node</span>
    </button>
  </div>
);

export default ToolbarActions; 