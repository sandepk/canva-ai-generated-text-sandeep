import React, { useState } from "react";
import { Palette, Paintbrush, Sparkles, Gem } from "lucide-react";

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

  // Function to close all other dropdowns when one is opened
  const closeOtherDropdowns = (currentDropdown: string) => {
    if (currentDropdown !== 'style') setShowStylePicker(false);
    if (currentDropdown !== 'textColor') setShowTextColorPicker(false);
    if (currentDropdown !== 'nodeColor') setShowNodeColorPicker(false);
  };

  const textColors = [
    '#000000', '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db',
    '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a',
    '#059669', '#0891b2', '#2563eb', '#7c3aed', '#9333ea', '#c026d3',
    '#db2777', '#e11d48', '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db'
  ];

  const nodeColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
    '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E',
    '#A855F7', '#22C55E', '#EAB308', '#F97316', '#06B6D4', '#8B5CF6',
    '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EC4899'
  ];

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
          <div className="absolute left-16 top-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-gray-700">Text Color</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {textColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onColorChange(color);
                    setShowTextColorPicker(false);
                  }}
                  className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform duration-200 ${
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
          <div className="absolute left-16 top-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-700">Node Background</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {nodeColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onNodeColorChange(color);
                    setShowNodeColorPicker(false);
                  }}
                  className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform duration-200 ${
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