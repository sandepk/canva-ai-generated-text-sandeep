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
  dragCollision?: boolean;
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
  dragCollision = false,
}) => {
  const [editText, setEditText] = useState(node.text);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [resizing, setResizing] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Detect mobile mode
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (node.isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [node.isEditing]);

  useEffect(() => {
    setEditText(node.text);
  }, [node.text]);

  // Auto-resize node when text changes (optimized for mobile)
  useEffect(() => {
    if (!node.isEditing && !resizing) {
      // On mobile, always auto-resize to fit content exactly
      if (isMobile) {
        autoResizeNode(node.text, true);
      } else {
        // On desktop, only auto-resize if the node hasn't been manually resized recently
        const hasBeenManuallyResized = node.width !== 200;
        if (!hasBeenManuallyResized) {
          autoResizeNode(node.text, true);
        }
      }
    }
  }, [node.text, node.isEditing, resizing, node.width, isMobile]);

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
      // Auto-resize after saving (immediate on mobile)
      setTimeout(() => autoResizeNode(editText, isMobile), isMobile ? 0 : 100);
    } else if (e.key === "Escape") {
      setEditText(node.text);
      onSave(node.text);
      // Auto-resize after saving (immediate on mobile)
      setTimeout(() => autoResizeNode(node.text, isMobile), isMobile ? 0 : 100);
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
      
      // On mobile, immediately resize the node to match textarea height
      if (isMobile) {
        const newHeight = textareaRef.current.scrollHeight + 32; // Add padding
        if (Math.abs(newHeight - node.height) > 5) {
          onResize(node.width, newHeight);
        }
      }
    }
  };

  // Calculate required dimensions based on text content (optimized for mobile)
  const calculateTextDimensions = (text: string) => {
    // Create a temporary div to measure text dimensions
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordBreak = 'break-words';
    tempDiv.style.fontSize = isMobile ? '16px' : '14px'; // Use mobile font size
    tempDiv.style.fontWeight = '500'; // font-medium
    tempDiv.style.lineHeight = '1.6'; // Consistent with display
    tempDiv.style.padding = '8px'; // p-2 - reduced padding
    tempDiv.style.width = `${node.width - 16}px`; // Use current node width minus padding
    tempDiv.style.height = 'auto';
    tempDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    tempDiv.textContent = text || "Double-click to edit";
    
    // Handle empty text case
    if (!text || text.trim() === '') {
      tempDiv.textContent = "Double-click to edit";
    }
    
    document.body.appendChild(tempDiv);
    
    const rect = tempDiv.getBoundingClientRect();
    const contentHeight = rect.height;
    
    document.body.removeChild(tempDiv);
    
    // Calculate final dimensions - only adjust height, keep width constant
    const padding = 16; // 8px on each side - reduced padding
    
    // Keep the current width unchanged
    const width = node.width;
    const height = contentHeight + padding;
    
    return { width, height };
  };

  // Auto-resize node based on text content (optimized for mobile)
  const autoResizeNode = (text: string, immediate: boolean = false) => {
    // Clear existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    const performResize = () => {
      const { width, height } = calculateTextDimensions(text);
      const currentHeight = node.height;
      const currentWidth = node.width;
      
      // Only adjust height, keep width constant
      const heightDiff = Math.abs(height - currentHeight);
      
      if (isMobile) {
        // On mobile, resize height if there's a significant difference
        if (heightDiff > 5) { // Smaller threshold for mobile
          onResize(currentWidth, height);
        }
      } else {
        // On desktop, resize height if there's a significant difference
        if (heightDiff > 10) {
          onResize(currentWidth, height);
        }
      }
    };

    if (immediate || isMobile) {
      performResize();
    } else {
      // Debounce resize to avoid too frequent updates during typing (desktop only)
      resizeTimeoutRef.current = setTimeout(performResize, 100); // Reduced debounce time
    }
  };



  // Resize logic (disabled on mobile for better UX)
    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile) return; // Disable manual resizing on mobile
    
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
      
      // Calculate new dimensions based on mouse movement
      let newWidth = Math.max(120, startWidth + (moveX - startX));
      let newHeight = Math.max(20, startHeight + (moveY - startY));
      
      // For manual resizing, allow the user to control the width freely
      // Only apply minimum constraints, not text-based constraints
      const padding = 16; // 8px on each side
      const minWidth = 120; // Minimum width for usability
      const maxWidth = 800; // Maximum width to prevent excessive resizing
      
      // Apply width constraints
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      // Calculate height based on text content fitting in the new width
      const fontSize = isMobile ? 16 : 14;
      const lineHeight = fontSize * 1.6;
      const textLength = node.text.length;
      
      // Calculate how many lines the text will take in the new width
      const availableWidth = newWidth - padding * 2;
      const avgCharWidth = fontSize * 0.6;
      const charsPerLine = Math.floor(availableWidth / avgCharWidth);
      
      if (charsPerLine > 0) {
        const lines = Math.ceil(textLength / charsPerLine);
        const contentHeight = lines * lineHeight;
        const minTextHeight = Math.max(20, contentHeight + padding * 2);
        newHeight = Math.max(newHeight, minTextHeight);
      }
      
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
      data-node-id={node.id}
      className={`absolute select-none touch-none group ${
        isMobile 
          ? "" // No animations on mobile for better performance
          : `transition-all duration-300 ease-out ${isDragging ? "scale-105 z-50" : "hover:scale-105"}`
      } ${highlighted ? "ring-4 ring-green-400 animate-pulse" : ""} ${
        resizing ? "ring-2 ring-blue-400" : ""
      }`}
                      style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                  zIndex: resizing ? 100 : undefined,
                }}
      onMouseEnter={() => !isMobile && setShowActions(true)}
      onMouseLeave={() => !isMobile && setShowActions(false)}
      onContextMenu={e => e.stopPropagation()}
    >
                        <div
                    className={`relative w-full h-full border-2 shadow-md ${
                      isMobile ? "" : "transition-all duration-200"
                    } cursor-move ${
                      node.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                    } ${dragCollision && isDragging ? 'ring-4 ring-red-500 animate-pulse' : ''}`}
                    style={{
                      backgroundColor: dragCollision && isDragging 
                        ? 'rgba(239, 68, 68, 0.15)' 
                        : node.style === 'crystal' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : node.style === 'colored'
                        ? node.color
                        : '#fef3c7',
                      borderColor: dragCollision && isDragging 
                        ? '#ef4444' 
                        : node.style === 'crystal' 
                        ? node.color + "40"
                        : node.style === 'colored'
                        ? node.color
                        : '#f59e0b',
                      backdropFilter: node.style === 'crystal' ? 'blur(10px)' : 'none',
                      boxShadow: node.style === 'crystal'
                        ? '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : node.style === 'colored'
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        : '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                      transform: node.style === 'crystal' || node.style === 'colored' ? undefined : 'rotate(-1deg)',
                    }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* Drag Handle - Hidden on mobile */}
        {!isMobile && (
          <div
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ pointerEvents: showActions ? "auto" : "none" }}
          >
            <GripHorizontal className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Content */}
        <div className="p-2 w-full h-full overflow-hidden">
          {node.isEditing ? (
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                adjustTextareaHeight();
                // Auto-resize height on text change with debouncing
                setTimeout(() => autoResizeNode(e.target.value, false), 50);
              }}
              onKeyDown={handleKeyDown}
              onBlur={(e) => {
                onSave(editText);
                // Auto-resize after saving (immediate on mobile)
                setTimeout(() => autoResizeNode(editText, isMobile), isMobile ? 0 : 100);
                // When not focused, keep placeholder on one line
                if (!e.target.value) {
                  e.target.style.whiteSpace = 'nowrap';
                }
              }}
              className="w-full bg-transparent border-none outline-none resize-none font-medium text-sm leading-relaxed overflow-hidden pr-6 pb-6"
              style={{ 
                lineHeight: '1.6',
                fontSize: isMobile ? '16px' : '14px', // Larger font on mobile for better readability
                whiteSpace: 'pre-wrap', // Allow content wrapping
                color: node.textColor || '#000000' // Use node's text color or default to black
              }}
              placeholder="Type your text here..."
            />
          ) : (
            <div
              className="w-full h-full font-medium text-sm leading-relaxed whitespace-pre-wrap break-words cursor-text overflow-hidden pr-6 pb-6"
              style={{ 
                lineHeight: '1.6',
                fontSize: isMobile ? '16px' : '14px', // Larger font on mobile
                color: node.textColor || '#000000' // Use node's text color or default to black
              }}
              onClick={handleDoubleClick}
            >
              {node.text || "Double-click to edit"}
            </div>
          )}
        </div>

        {/* Resize Handle - Hidden on mobile */}
        {!isMobile && showActions && !node.isEditing && (
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



        {/* Action Buttons - Always visible on mobile when editing */}
        {(showActions || (isMobile && node.isEditing)) && (
          <div className={`absolute -top-2 -right-2 flex gap-1 ${
            isMobile 
              ? "opacity-100" // Always visible on mobile when editing
              : "opacity-100 transition-all duration-200"
          }`}>
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
