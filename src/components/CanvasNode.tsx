import React, { useState, useRef, useEffect } from "react";
import { Node } from "../types";
import { Edit, Trash2, Bot, GripHorizontal, RotateCcw, RotateCw } from "lucide-react";

interface CanvasNodeProps {
  node: Node;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onEdit: () => void;
  onSave: (text: string) => void;
  onDelete: () => void;
  onAIUpdate: (prompt: string) => void;
  highlighted?: boolean;
  onResize: (width: number, height: number) => void;
  onUndo: () => void;
  onRedo: () => void;
}

const CanvasNode: React.FC<CanvasNodeProps> = ({
  node,
  isDragging,
  onMouseDown,
  onEdit,
  onSave,
  onDelete,
  onAIUpdate,
  highlighted = false,
  onResize,
  onUndo,
  onRedo,
}) => {
  const [editText, setEditText] = useState(node.text);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [resizing, setResizing] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (node.isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [node.isEditing]);

  useEffect(() => {
    setEditText(node.text);
  }, [node.text]);

  // Auto-resize node when text changes (but not during editing or manual resizing)
  useEffect(() => {
    if (!node.isEditing && !resizing) {
      // Only auto-resize if the node hasn't been manually resized recently
      const hasBeenManuallyResized = node.width !== 200; // Check if width was changed from default
      if (!hasBeenManuallyResized) {
        autoResizeNode(node.text, true); // Immediate resize when not editing
      }
    }
  }, [node.text, node.isEditing, resizing, node.width]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editText);
      // Auto-resize after saving
      setTimeout(() => autoResizeNode(editText, true), 100);
    } else if (e.key === "Escape") {
      setEditText(node.text);
      onSave(node.text);
      // Auto-resize after saving
      setTimeout(() => autoResizeNode(node.text, true), 100);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      // Only allow undo if there are text changes to undo
      if (node.undoStack && node.undoStack.length > 0) {
        onUndo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      // Only allow redo if there are text changes to redo
      if (node.redoStack && node.redoStack.length > 0) {
        onRedo();
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Calculate required dimensions based on text content
  const calculateTextDimensions = (text: string) => {
    // Create a temporary div to measure text dimensions
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordBreak = 'break-words';
    tempDiv.style.fontSize = '14px'; // text-sm
    tempDiv.style.fontWeight = '500'; // font-medium
    tempDiv.style.lineHeight = '1.6'; // Consistent with display
    tempDiv.style.padding = '16px'; // p-4
    tempDiv.style.width = `${node.width - 32}px`; // Use current node width minus padding
    tempDiv.style.height = 'auto';
    tempDiv.textContent = text || "Double-click to edit";
    
    // Handle empty text case
    if (!text || text.trim() === '') {
      tempDiv.textContent = "Double-click to edit";
    }
    
    document.body.appendChild(tempDiv);
    
    const rect = tempDiv.getBoundingClientRect();
    const contentHeight = rect.height;
    
    document.body.removeChild(tempDiv);
    
    // Calculate final dimensions - keep width fixed, only adjust height
    const padding = 32; // 16px on each side
    const resizeHandlePadding = 24; // Extra padding for resize handle (6px * 4)
    const width = node.width; // Keep current width
    const height = Math.max(50, contentHeight + padding + resizeHandlePadding);
    
    return { width, height };
  };

  // Auto-resize node based on text content with debouncing
  const autoResizeNode = (text: string, immediate: boolean = false) => {
    // Clear existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    const performResize = () => {
      const { width, height } = calculateTextDimensions(text);
      const currentHeight = node.height;
      const currentWidth = node.width;
      
      // Check if node has been manually resized
      const hasBeenManuallyResized = currentWidth !== 200;
      
      if (hasBeenManuallyResized) {
        // If manually resized, only adjust height to fit content
        const heightDiff = Math.abs(height - currentHeight);
        if (heightDiff > 10) {
          onResize(currentWidth, height); // Keep current width, adjust height
        }
      } else {
        // If not manually resized, allow both width and height adjustments
        const widthDiff = Math.abs(width - currentWidth);
        const heightDiff = Math.abs(height - currentHeight);
        
        if (widthDiff > 10 || heightDiff > 10) {
          onResize(width, height);
        }
      }
    };

    if (immediate) {
      performResize();
    } else {
      // Debounce resize to avoid too frequent updates during typing
      resizeTimeoutRef.current = setTimeout(performResize, 300);
    }
  };

  // Resize logic
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    const startX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const startWidth = node.width;
    const startHeight = node.height;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX = moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const moveY = moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;
      const newWidth = Math.max(150, startWidth + (moveX - startX));
      const newHeight = Math.max(60, startHeight + (moveY - startY));
      onResize(newWidth, newHeight);
    };

    const handleEnd = () => {
      setResizing(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  return (
    <div
      ref={nodeRef}
      data-node="true"
      className={`absolute select-none touch-none group transition-all duration-300 ease-out ${
        isDragging ? "scale-105 z-50" : "hover:scale-105"
      } ${highlighted ? "ring-4 ring-green-400 animate-pulse" : ""} ${
        resizing ? "ring-2 ring-blue-400" : ""
      }`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: node.height,
        height: node.height,
        zIndex: resizing ? 100 : undefined,
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onContextMenu={e => e.stopPropagation()}
    >
      <div
        className="relative w-full h-full rounded-lg border-2 border-white shadow-md transition-all duration-200 cursor-move"
        style={{
          backgroundColor: node.color + "15",
          borderColor: node.color + "40",
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* Drag Handle */}
        <div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ pointerEvents: showActions ? "auto" : "none" }}
        >
          <GripHorizontal className="w-4 h-4 text-gray-400" />
        </div>

        {/* Content */}
        <div className="p-4 w-full h-full overflow-hidden">
          {node.isEditing ? (
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                onSave(editText);
                // Auto-resize after saving
                setTimeout(() => autoResizeNode(editText, true), 100);
              }}
              className="w-full bg-transparent border-none outline-none resize-none text-gray-800 font-medium text-sm leading-relaxed overflow-hidden pr-6 pb-6"
              style={{ minHeight: "60px", lineHeight: '1.6' }}
              placeholder="Type your text here..."
            />
          ) : (
            <div
              className="w-full h-full text-gray-800 font-medium text-sm leading-relaxed whitespace-pre-wrap break-words cursor-text overflow-hidden pr-6 pb-6"
              style={{ lineHeight: '1.6' }}
              onClick={handleDoubleClick}
            >
              {node.text || "Double-click to edit"}
            </div>
          )}
        </div>

        {/* Resize Handle */}
        {showActions && !node.isEditing && (
          <div
            className={`absolute bottom-2 right-2 w-6 h-6 bg-white/95 backdrop-blur-sm border border-gray-300 rounded cursor-nwse-resize flex items-center justify-center z-30 shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 ${
              resizing ? "bg-blue-50 border-blue-300 shadow-lg" : ""
            }`}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Reset to default width and auto-size
              onResize(200, 50);
              setTimeout(() => autoResizeNode(node.text, true), 100);
            }}
            title="Drag to resize, double-click to auto-size"
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 10L10 2" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="2" r="1" fill="#666"/>
            </svg>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUndo();
              }}
              disabled={!node.undoStack || node.undoStack.length === 0}
              className={`p-1.5 rounded-full shadow-lg transition-colors duration-200 ${
                node.undoStack && node.undoStack.length > 0
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={`Undo text change${node.undoStack && node.undoStack.length > 0 ? ` (${node.undoStack.length} available)` : ' (none available)'}`}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRedo();
              }}
              disabled={!node.redoStack || node.redoStack.length === 0}
              className={`p-1.5 rounded-full shadow-lg transition-colors duration-200 ${
                node.redoStack && node.redoStack.length > 0
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={`Redo text change${node.redoStack && node.redoStack.length > 0 ? ` (${node.redoStack.length} available)` : ' (none available)'}`}
            >
              <RotateCw className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAIUpdate("");
              }}
              className="p-1.5 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors duration-200"
              title="Ask AI to update"
            >
              <Bot className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200"
              title="Edit text"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200"
              title="Delete node"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasNode;
