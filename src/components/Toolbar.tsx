import React from "react";
import {
  Plus,
  Bot,
  Layout,
  FileDown,
  Image as ImageIcon,
  ListIcon,
  RotateCcw, // Undo
  RotateCw, // Redo
} from "lucide-react";

interface ToolbarProps {
  onAddNode: () => void;
  onToggleAI: () => void;
  showAI: boolean;
  onExportJSON: () => void;
  onExportImage: () => void;
  toggleList: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onToggleAI,
  showAI,
  onExportJSON,
  onExportImage,
  toggleList,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="top-4 left-4 z-40 flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white/80 backdrop-blur-md rounded-xl p-2 shadow-sm max-w-[calc(100%-0rem)]">
      {/* Canvas Label */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
        <Layout className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500 font-medium">
          Sandeep - Canvas
        </span>
      </div>

      {/* Toolbar Buttons */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 text-sm">
        {/* Add Node */}
        <button
          onClick={onAddNode}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-all duration-200 font-medium"
          title="Add Node"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Node</span>
        </button>

        <span className="text-gray-300 hidden sm:inline">/</span>

        {/* Undo */}
        <button
          onClick={onUndo}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-md transition-all duration-200 font-medium"
          title="Undo"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-md transition-all duration-200 font-medium"
          title="Redo"
        >
          <RotateCw className="w-4 h-4" />
          <span className="hidden sm:inline">Redo</span>
        </button>

        <span className="text-gray-300 hidden sm:inline">/</span>

        {/* Toggle AI Assistant */}
        <button
          onClick={onToggleAI}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 font-medium ${
            showAI
              ? "bg-purple-100 text-purple-700"
              : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          }`}
          title="Toggle AI Assistant"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        <span className="text-gray-300 hidden sm:inline">/</span>

        {/* Export JSON */}
        <button
          onClick={onExportJSON}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md transition-all duration-200 font-medium"
          title="Export as JSON"
        >
          <FileDown className="w-4 h-4" />
          <span className="hidden sm:inline">Export JSON</span>
        </button>

        <span className="text-gray-300 hidden sm:inline">/</span>

        {/* Export Image */}
        <button
          onClick={onExportImage}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-md transition-all duration-200 font-medium"
          title="Export as Image"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Export Image</span>
        </button>

        <span className="text-gray-300 hidden sm:inline">/</span>

        {/* Toggle Node List */}
        <button
          onClick={toggleList}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-200 font-medium"
          title="List Nodes"
        >
          <ListIcon className="w-4 h-4" />
          <span className="hidden sm:inline">List Node</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
