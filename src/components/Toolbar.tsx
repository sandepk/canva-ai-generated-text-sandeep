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
    <div className="top-4 left-4 z-40 flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white/80 backdrop-blur-md rounded-xl p-2 shadow-sm max-w-[calc(100%-0rem)]">
      {/* Canvas Label */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
        <Layout className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500 font-medium">
          Sandeep - Canvas
        </span>
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
        className="hidden sm:flex flex-wrap sm:flex-nowrap items-center gap-1 text-sm"
      />
    </div>
  );
};

export default Toolbar;
