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
import ToolbarActions from "./ToolbarActions";

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
    <div className="fixed top-4 left-4 z-40 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200 max-w-[calc(100vw-2rem)]">
      <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
          <svg 
            className="w-5 h-5 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-700 font-semibold text-sm leading-tight">
            Canvas Studio
          </span>
          <span className="text-gray-500 text-xs leading-tight">
            Statisfy demo
          </span>
        </div>
      </div>

      {/* Toolbar Buttons */}
      <ToolbarActions
        onAddNode={onAddNode}
        onToggleAI={onToggleAI}
        showAI={showAI}
        onExportJSON={onExportJSON}
        onExportImage={onExportImage}
        toggleList={toggleList}
        onUndo={onUndo}
        onRedo={onRedo}
        className="flex flex-wrap items-center gap-1 text-xs sm:text-sm"
      />
    </div>
  );
};

export default Toolbar;
