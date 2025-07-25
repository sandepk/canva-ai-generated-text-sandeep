import React from 'react';
import { Plus, Bot, Layout, FileDown, Image as ImageIcon } from 'lucide-react';

interface ToolbarProps {
  onAddNode: () => void;
  onToggleAI: () => void;
  showAI: boolean;
  onExportJSON: () => void;
  onExportImage: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onToggleAI,
  showAI,
  onExportJSON,
  onExportImage,
}) => {
  return (
    <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
      {/* Canvas Label */}
      <div className="flex items-center gap-1 bg-grey rounded-lg shadow-lg p-1">
        <div className="flex items-center gap-1 px-2 py-1">
          <Layout className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500 font-medium">Sandeep - Canvas</span>
        </div>
      </div>
      {/* Node + AI Controls */}
      <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
        <button
          onClick={onAddNode}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-all duration-200 font-medium text-sm"
          title="Add Node"
        >
          <Plus className="w-4 h-4" />
          Add Node
        </button>

        <div className="w-px h-6 bg-gray-200" />

        <button
          onClick={onToggleAI}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
            showAI
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
          }`}
          title="Toggle AI Assistant"
        >
          <Bot className="w-4 h-4" />
          AI Assistant
        </button>
      </div>

      {/* Export Controls */}
      <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
        <button
          onClick={onExportJSON}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md transition-all duration-200 font-medium text-sm"
          title="Export as JSON"
        >
          <FileDown className="w-4 h-4" />
          Export JSON
        </button>

        <button
          onClick={onExportImage}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-md transition-all duration-200 font-medium text-sm"
          title="Export as Image"
        >
          <ImageIcon className="w-4 h-4" />
          Export Image
        </button>
      </div>

    </div>
  );
};

export default Toolbar;
