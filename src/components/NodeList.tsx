import React, { useState } from "react";
import { Node } from "../types";
import { Trash2, Edit, Bot } from "lucide-react";

interface NodeListProps {
  nodes: Node[];
  onSelectNode: (id: string) => void;
  highlightedNodeId?: string | null;
  onRemoveAll?: () => void;
  onEditNode?: (id: string) => void;
  onDeleteNode?: (id: string) => void;
  onAINode?: (id: string) => void;
  onClose?: () => void;
}

const NodeList: React.FC<NodeListProps> = ({
  nodes,
  onSelectNode,
  highlightedNodeId,
  onRemoveAll,
  onEditNode,
  onDeleteNode,
  onAINode,
  onClose,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  return (
    <div className="absolute z-40 bg-white shadow-lg rounded-lg w-64 sm:w-72 sm:top-28 sm:right-4 top-auto bottom-6 right-2 h-[40vh] sm:h-[65vh] flex flex-col">
      {/* Fixed Header */}
      <div className="bg-blue-50 rounded-t-lg px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-blue-800 text-base font-semibold tracking-wide">
            All Nodes ({nodes.length})
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all duration-200 hover:scale-110"
              title="Close node list"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {nodes.length === 0 && (
          <p className="text-gray-500 text-xs">No nodes to display</p>
        )}
        {onRemoveAll && nodes.length > 0 && (
          <div className="flex items-center gap-1">
            {showClearConfirm ? (
              <>
                <button
                  onClick={() => {
                    onRemoveAll();
                    setShowClearConfirm(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-medium transition-colors duration-200"
                  title="Confirm clear all"
                >
                  <Trash2 className="w-3 h-3" />
                  Confirm
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-50 rounded text-xs font-medium transition-colors duration-200"
                  title="Cancel"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-medium transition-colors duration-200"
                title="Remove all nodes"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>
        )}
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <ul className="space-y-1">
        {nodes.map((node, index) => (
          <li
            key={node.id}
            className={`group flex items-center justify-between text-sm px-2 py-1 rounded transition-colors duration-200
              ${
                node.id === highlightedNodeId
                  ? "bg-yellow-100 text-yellow-700 font-semibold"
                  : index % 2 === 0
                    ? "bg-gray-50 text-gray-800 hover:bg-gray-100"
                    : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
          >
            <div 
              className="flex-1 cursor-pointer truncate pr-2"
              onClick={() => onSelectNode(node.id)}
              title={node.text || "Untitled Node"}
            >
              {node.text || "Untitled Node"}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 transition-opacity duration-200">
              {onAINode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAINode(node.id);
                  }}
                  className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors duration-200"
                  title="Ask AI to update"
                >
                  <Bot className="w-3 h-3" />
                </button>
              )}
              {onEditNode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNode(node.id);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                  title="Edit node"
                >
                  <Edit className="w-3 h-3" />
                </button>
              )}
              {onDeleteNode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNode(node.id);
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                  title="Delete node"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </li>
        ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NodeList;
