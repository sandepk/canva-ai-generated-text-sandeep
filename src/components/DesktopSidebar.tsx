import React, { useState } from "react";
import { Palette, Paintbrush, Sparkles, Gem, ChevronLeft, ChevronRight } from "lucide-react";

interface DesktopSidebarProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  selectedNodeColor: string;
  onNodeColorChange: (color: string) => void;
  nodeStyle: 'colored' | 'crystal';
  onNodeStyleChange: (style: 'colored' | 'crystal') => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  selectedColor,
  onColorChange,
  selectedNodeColor,
  onNodeColorChange,
  nodeStyle,
  onNodeStyleChange,
}) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showNodeColorPicker, setShowNodeColorPicker] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [textColorPage, setTextColorPage] = useState(0);
  const [nodeColorPage, setNodeColorPage] = useState(0);

  // Color arrays - defined before pagination functions
  const textColors = [
    // Blacks & Grays
    '#000000', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6',
    // Reds
    '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2',
    // Oranges
    '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5',
    // Yellows
    '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7',
    // Greens
    '#65a30d', '#84cc16', '#a3e635', '#bef264', '#d9f99d', '#ecfccb',
    '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7',
    // Teals
    '#059669', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4',
    // Blues
    '#0891b2', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe',
    '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe',
    // Purples
    '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe',
    '#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff',
    // Pinks
    '#c026d3', '#d946ef', '#e879f9', '#f0abfc', '#f5d0fe', '#fae8ff',
    '#db2777', '#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3',
    // Whites
    '#ffffff', '#fafafa', '#f5f5f5', '#f0f0f0', '#e5e5e5', '#d4d4d4'
  ];

  const nodeColors = [
    // Sticky Note Colors
    '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706',
    // Pastel Colors
    '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c',
    '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c',
    '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d',
    '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8',
    '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
    '#f0abfc', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7c3aed',
    // Vibrant Colors
    '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444',
    '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b',
    '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e',
    '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9',
    '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7',
    '#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899',
    // Neutral Colors
    '#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373',
    '#525252', '#404040', '#262626', '#171717', '#0a0a0a', '#000000'
  ];

  // Function to close all other dropdowns when one is opened
  const closeOtherDropdowns = (currentDropdown: string) => {
    if (currentDropdown !== 'style') setShowStylePicker(false);
    if (currentDropdown !== 'textColor') {
      setShowTextColorPicker(false);
      setTextColorPage(0);
    }
    if (currentDropdown !== 'nodeColor') {
      setShowNodeColorPicker(false);
      setNodeColorPage(0);
    }
  };

  // Pagination functions
  const colorsPerPage = 32; // 8 columns x 4 rows
  const totalTextColorPages = Math.ceil(textColors.length / colorsPerPage);
  const totalNodeColorPages = Math.ceil(nodeColors.length / colorsPerPage);

  const getTextColorPage = (page: number) => {
    const start = page * colorsPerPage;
    return textColors.slice(start, start + colorsPerPage);
  };

  const getNodeColorPage = (page: number) => {
    const start = page * colorsPerPage;
    return nodeColors.slice(start, start + colorsPerPage);
  };

    return (
    <div className="fixed left-0 top-0 h-full w-16 bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 shadow-2xl z-40 flex flex-col items-center justify-center space-y-6">
      {/* Node Style Picker */}
      <div className="relative group">
        <button
          onClick={() => {
            closeOtherDropdowns('style');
            setShowStylePicker(!showStylePicker);
          }}
          className={`w-12 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group-hover:rotate-12 ${
            nodeStyle === 'crystal' 
              ? 'bg-gradient-to-br from-cyan-400 to-blue-500' 
              : 'bg-gradient-to-br from-orange-400 to-red-500'
          }`}
          title={`Node Style: ${nodeStyle === 'crystal' ? 'Crystal' : 'Colored'}`}
        >
          <div className="relative">
            {nodeStyle === 'crystal' ? (
              <div className="w-6 h-6 border-2 border-white/80 rounded-md bg-transparent backdrop-blur-sm"></div>
            ) : (
              <div className="w-6 h-6 bg-yellow-100 rounded-md shadow-sm border border-amber-300 transform -rotate-1"></div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-white flex items-center justify-center">
              <div className={`w-1.5 h-1.5 rounded-full ${
                nodeStyle === 'crystal' ? 'bg-cyan-400' : 'bg-orange-400'
              }`}></div>
            </div>
          </div>
        </button>

        {/* Style Picker Dropdown */}
        {showStylePicker && (
          <div className="absolute left-16 top-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">Node Style</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onNodeStyleChange('colored');
                  setShowStylePicker(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  nodeStyle === 'colored' 
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' 
                    : 'border-gray-300 hover:border-orange-300'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
                  <div className="w-5 h-5 bg-yellow-100 rounded-md shadow-sm border border-amber-300 transform -rotate-1"></div>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Colored</div>
                  <div className="text-xs text-gray-500">Solid color background</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  onNodeStyleChange('crystal');
                  setShowStylePicker(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  nodeStyle === 'crystal' 
                    ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200' 
                    : 'border-gray-300 hover:border-cyan-300'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                  <div className="w-5 h-5 border-2 border-white/60 rounded-md bg-transparent relative z-10"></div>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Crystal</div>
                  <div className="text-xs text-gray-500">Transparent with border</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Text Color Picker */}
      <div className="relative group">
        <button
          onClick={() => {
            closeOtherDropdowns('textColor');
            setShowTextColorPicker(!showTextColorPicker);
          }}
          className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group-hover:rotate-12"
          title="Text Color for New Nodes"
        >
          <div className="relative">
            <Palette className="w-6 h-6 text-white" />
            <div 
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: selectedColor }}
            />
          </div>
        </button>

        {/* Text Color Dropdown */}
        {showTextColorPicker && (
          <div className="absolute left-16 top-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-gray-700">Text Color</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTextColorPage(Math.max(0, textColorPage - 1))}
                  disabled={textColorPage === 0}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    textColorPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 px-2">
                  {textColorPage + 1} / {totalTextColorPages}
                </span>
                <button
                  onClick={() => setTextColorPage(Math.min(totalTextColorPages - 1, textColorPage + 1))}
                  disabled={textColorPage === totalTextColorPages - 1}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    textColorPage === totalTextColorPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1.5 h-32 overflow-hidden">
              {getTextColorPage(textColorPage).map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onColorChange(color);
                    setShowTextColorPicker(false);
                  }}
                  className={`w-6 h-6 rounded-md border-2 hover:scale-110 transition-transform duration-200 ${
                    selectedColor === color ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Select ${color}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Node Background Color Picker */}
      <div className="relative group">
        <button
          onClick={() => {
            closeOtherDropdowns('nodeColor');
            setShowNodeColorPicker(!showNodeColorPicker);
          }}
          className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group-hover:-rotate-12"
          title="Node Background Color for New Nodes"
        >
          <div className="relative">
            <Paintbrush className="w-6 h-6 text-white" />
            <div 
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: selectedNodeColor }}
            />
          </div>
        </button>

        {/* Node Color Dropdown */}
        {showNodeColorPicker && (
          <div className="absolute left-16 top-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-gray-700">Node Background</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setNodeColorPage(Math.max(0, nodeColorPage - 1))}
                  disabled={nodeColorPage === 0}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    nodeColorPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 px-2">
                  {nodeColorPage + 1} / {totalNodeColorPages}
                </span>
                <button
                  onClick={() => setNodeColorPage(Math.min(totalNodeColorPages - 1, nodeColorPage + 1))}
                  disabled={nodeColorPage === totalNodeColorPages - 1}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    nodeColorPage === totalNodeColorPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1.5 h-32 overflow-hidden">
              {getNodeColorPage(nodeColorPage).map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onNodeColorChange(color);
                    setShowNodeColorPicker(false);
                  }}
                  className={`w-6 h-6 rounded-md border-2 hover:scale-110 transition-transform duration-200 ${
                    selectedNodeColor === color ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Select ${color}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col space-y-4">
        <div className="w-8 h-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-60"></div>
        <div className="w-6 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-60"></div>
        <div className="w-4 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-60"></div>
      </div>
    </div>
  );
};

export default DesktopSidebar; 