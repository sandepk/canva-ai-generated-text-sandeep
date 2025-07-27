import React from "react";
import { Plus, Bot, FileDown, Image as ImageIcon, ListIcon, X } from "lucide-react";

interface ContextSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onToggleAI: () => void;
  onExportJSON: () => void;
  onExportImage: () => void;
  onToggleNodeList: () => void;
  showNodeList: boolean;
}

const ContextSidebar: React.FC<ContextSidebarProps> = ({
  isVisible,
  onClose,
  onToggleAI,
  onExportJSON,
  onExportImage,
  onToggleNodeList,
  showNodeList,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Canvas Menu</h2>
              <p className="text-sm text-gray-600">Quick actions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* AI Assistant */}
          <button
            onClick={() => {
              onToggleAI();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-semibold">AI Assistant</div>
              <div className="text-sm text-purple-100">Generate content with AI</div>
            </div>
          </button>

          {/* Node List */}
          <button
            onClick={() => {
              if (!showNodeList) {
                onToggleNodeList();
              }
              onClose();
            }}
            className={`w-full flex items-center gap-3 p-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] ${
              showNodeList
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              showNodeList ? "bg-white/20" : "bg-gray-300"
            }`}>
              <ListIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Node List</div>
              <div className={`text-sm ${showNodeList ? "text-green-100" : "text-gray-500"}`}>
                {showNodeList ? "Currently visible" : "View all nodes"}
              </div>
            </div>
          </button>

          {/* Export Options */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Export</h3>
            
            <button
              onClick={() => {
                onExportJSON();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-lg hover:from-green-200 hover:to-green-300 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <FileDown className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">Export JSON</div>
                <div className="text-xs text-green-600">Download as JSON file</div>
              </div>
            </button>

            <button
              onClick={() => {
                onExportImage();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-lg hover:from-yellow-200 hover:to-yellow-300 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">Export Image</div>
                <div className="text-xs text-yellow-600">Download as PNG image</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>Long press anywhere on canvas to open this menu</p>
            <div className="flex flex-col items-center space-y-1">
              <p className="text-xs text-gray-400 font-medium">
                Sandeep K Gupta | SDE 2 | IIT Kanpur
              </p>
              <a 
                href="https://www.statisfy.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 rounded-xl shadow-lg border border-purple-300 transform hover:scale-105 transition-all duration-200 cursor-pointer hover:shadow-xl"
              >
                Statisfy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextSidebar; 