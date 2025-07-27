import React from "react";
import {
  Plus,
  Bot,
  Layout,
  FileDown,
  Image as ImageIcon,
  ListIcon,
} from "lucide-react";
import ToolbarActions from "./ToolbarActions";
import { useViewportHeight } from "../hooks/useViewportHeight";

interface ToolbarProps {
  onAddNode: () => void;
  onToggleAI: () => void;
  showAI: boolean;
  onExportJSON: () => void;
  onExportImage: () => void;
  toggleList: () => void;
  showNodeList: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onToggleAI,
  showAI,
  onExportJSON,
  onExportImage,
  toggleList,
  showNodeList,
}) => {
  const viewportHeight = useViewportHeight();
  
  // Detect if virtual keyboard is open (viewport height significantly reduced)
  // Made less aggressive to ensure toolbar stays visible
  const isKeyboardOpen = window.innerWidth < 768 && viewportHeight < window.innerHeight * 0.6;
  
  // Fallback: ensure toolbar is always visible on mobile
  const isMobile = window.innerWidth < 768;
  
  return (
          <div 
        className={`fixed left-2 sm:left-4 z-50 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-lg rounded-xl p-2 sm:p-3 shadow-xl border border-gray-200 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] transition-all duration-300 ${
          isKeyboardOpen && !isMobile ? 'bottom-4 top-auto' : 'top-0'
        }`}
        style={{
          top: window.innerWidth >= 768 ? '1rem' : (isKeyboardOpen && !isMobile ? 'auto' : Math.max(8, Math.min(viewportHeight * 0.02, 16)) + 'px'),
          bottom: isKeyboardOpen && !isMobile ? '1rem' : 'auto',
          position: 'fixed',
          transform: 'translateZ(0)', // Force hardware acceleration on iOS
          willChange: 'transform', // Optimize for animations
          zIndex: 50 // Lower than context sidebar but still above other elements
        }}
        role="toolbar"
        aria-label="Canvas Studio toolbar with quick actions"
      >
      <a 
        href="https://www.statisfy.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm flex-shrink-0 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
        style={{ 
          minWidth: 'fit-content',
          zIndex: 51,
          position: 'relative'
        }}
        aria-label="Visit Statisfy website - Opens in new tab"
        role="link"
        tabIndex={0}
      >
        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg" aria-hidden="true">
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="img"
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
          <span className="text-gray-700 font-semibold text-xs sm:text-sm leading-tight">
            Canvas Studio
          </span>
          <span className="text-gray-500 text-xs leading-tight hidden sm:block">
            Statisfy demo
          </span>
        </div>
      </a>



      {/* Toolbar Buttons */}
      <ToolbarActions
        onAddNode={onAddNode}
        onToggleAI={onToggleAI}
        showAI={showAI}
        onExportJSON={onExportJSON}
        onExportImage={onExportImage}
        toggleList={toggleList}
        showNodeList={showNodeList}
        className="flex flex-wrap items-center gap-0.5 sm:gap-1 text-xs sm:text-sm"
        aria-label="Toolbar action buttons"
      />
    </div>
  );
};

export default Toolbar;
