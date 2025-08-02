import React, { useState } from "react";
import { Plus, Bot, FileDown, Image as ImageIcon, ListIcon, Palette } from "lucide-react";

interface ToolbarActionsProps {
  onAddNode: () => void;
  onToggleAI: () => void;
  showAI: boolean;
  onExportJSON: () => void;
  onExportImage: () => void;
  toggleList: () => void;
  showNodeList: boolean;
  selectedColor: string;
  onColorChange: (color: string) => void;
  selectedNodeColor: string;
  onNodeColorChange: (color: string) => void;
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
  showNodeList,
  selectedColor,
  onColorChange,
  selectedNodeColor,
  onNodeColorChange,
  className = "",
  "aria-label": ariaLabel,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNodeColorPicker, setShowNodeColorPicker] = useState(false);
  const isMobile = window.innerWidth < 768;

  return (
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
      title={showNodeList ? "Hide Node List" : "Show Node List"}
      aria-label={`${showNodeList ? 'Hide' : 'Show'} node list`}
    >
      <ListIcon className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">{showNodeList ? "Hide Node List" : "Show Node List"}</span>
        </button>

    {/* Color Pickers - Only show on mobile */}
    {isMobile && (
      <>
        <span className="text-gray-300 hidden sm:inline" aria-hidden="true">/</span>
        
        {/* Text Color Picker Button */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
            title="Select text color for new nodes (existing nodes unchanged)"
            aria-label="Select text color for new nodes (existing nodes unchanged)"
          >
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="hidden sm:inline">Text Color</span>
          </button>

          {/* Text Color Picker Dropdown */}
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
              <div className="grid grid-cols-6 gap-1">
                {[
                  '#000000', '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db',
                  '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a',
                  '#059669', '#0891b2', '#2563eb', '#7c3aed', '#9333ea', '#c026d3',
                  '#db2777', '#e11d48', '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onColorChange(color);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform duration-200 ${
                      selectedColor === color ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Select ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="text-gray-300 hidden sm:inline" aria-hidden="true">/</span>

        {/* Node Background Color Picker Button */}
        <div className="relative">
          <button
            onClick={() => setShowNodeColorPicker(!showNodeColorPicker)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            title="Select node background color for new nodes (existing nodes unchanged)"
            aria-label="Select node background color for new nodes (existing nodes unchanged)"
          >
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: selectedNodeColor }}
            />
            <span className="hidden sm:inline">Node Background</span>
          </button>

          {/* Node Background Color Picker Dropdown */}
          {showNodeColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
              <div className="grid grid-cols-6 gap-1">
                {[
                  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
                  '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E',
                  '#A855F7', '#22C55E', '#EAB308', '#F97316', '#06B6D4', '#8B5CF6',
                  '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EC4899'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onNodeColorChange(color);
                      setShowNodeColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform duration-200 ${
                      selectedNodeColor === color ? 'ring-2 ring-green-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Select ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </div>
  );
};

export default ToolbarActions; 