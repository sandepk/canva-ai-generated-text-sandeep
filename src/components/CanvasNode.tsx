import React, { useState, useRef, useEffect } from "react";
import { Node } from "../types";
import { Edit, Trash2, Bot, GripHorizontal } from "lucide-react";

interface CanvasNodeProps {
  node: Node;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onEdit: () => void;
  onSave: (text: string) => void;
  onDelete: () => void;
  onAIUpdate: (prompt: string) => void;
  highlighted?: boolean;
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
}) => {
  const [editText, setEditText] = useState(node.text);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (node.isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [node.isEditing]);

  useEffect(() => {
    setEditText(node.text);
  }, [node.text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editText);
    } else if (e.key === "Escape") {
      setEditText(node.text);
      onSave(node.text);
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

  return (
    <div
      className={`absolute select-none touch-none group transition-all duration-200 ${
        isDragging ? "scale-105 z-50" : "hover:scale-105"
      } ${highlighted ? "ring-4 ring-green-400 animate-pulse" : ""}`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: node.height,
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
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
        <div className="p-4 w-full h-full">
          {node.isEditing ? (
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => onSave(editText)}
              className="w-full bg-transparent border-none outline-none resize-none text-gray-800 font-medium text-sm leading-relaxed"
              style={{ minHeight: "60px" }}
              placeholder="Enter your text..."
            />
          ) : (
            <div
              className="w-full h-full text-gray-800 font-medium text-sm leading-relaxed whitespace-pre-wrap break-words cursor-text"
              onClick={handleDoubleClick}
            >
              {node.text || "Double-click to edit"}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && !node.isEditing && (
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
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
