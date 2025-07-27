import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import { Node, DragState } from "../types";
import CanvasNode from "./CanvasNode";
import AIAssistant from "./AIAssistant";
import Toolbar from "./Toolbar";
import { generateText } from "../services/api";
import { Plus, Bot, FileDown, Image as ImageIcon, ListIcon } from "lucide-react";
import NodeList from "./NodeList";

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
];

const LOCAL_STORAGE_KEY = "ai-canvas-nodes";

const Canvas: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [minSize, setMinSize] = useState({ width: 0, height: 0 });


  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(
    null,
  );
  const [showNodeList, setShowNodeList] = useState(false);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    nodeId: null,
  });
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createNode = useCallback(
    (x: number, y: number, text: string = "") => {
      const newNode: Node = {
        id: generateId(),
        x,
        y,
        text,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: 200,
        height: 50,
        isEditing: true,
      };
      setNodes((prev) => [...prev, newNode]);
      return newNode.id;
    },
    [nodes]
  );
  

  const updateNode = useCallback(
    (id: string, updates: Partial<Node>) => {
      setNodes((prev) => {
        return prev.map((node) => (node.id === id ? { ...node, ...updates } : node));
      });
    },
    []
  );
  

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== id));
    },
    []
  );
  
  

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 100;
      const y = e.clientY - rect.top - 50;
      createNode(x, y);
    }
  };

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, nodeId: string) => {
    const target = e.target as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clientX: number, clientY: number;
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;
  
    setDragState({
      isDragging: true,
      dragOffset: { x: offsetX, y: offsetY },
      nodeId,
    });
  


    // Add global event listeners for drag move and end
    const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      let moveX: number, moveY: number;
      if (moveEvent instanceof TouchEvent) {
        moveX = moveEvent.touches[0].clientX;
        moveY = moveEvent.touches[0].clientY;
      } else {
        moveX = moveEvent.clientX;
        moveY = moveEvent.clientY;
      }

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const scrollContainer = scrollContainerRef.current;
      
      if (canvasRect && scrollContainer) {
        const newX = moveX - canvasRect.left + scrollContainer.scrollLeft - offsetX;
        const newY = moveY - canvasRect.top + scrollContainer.scrollTop - offsetY;
        
        updateNode(nodeId, { x: newX, y: newY });
      }
    };

    const handleDragEnd = () => {
      setDragState(prev => ({ ...prev, isDragging: false, nodeId: null }));
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
  };
  

  const handleNodeEdit = (nodeId: string) =>
    updateNode(nodeId, { isEditing: true });
  const handleNodeSave = (nodeId: string, text: string) => {
    // If text is empty or only whitespace, delete the node
    if (!text || text.trim() === '') {
      deleteNode(nodeId);
    } else {
      // Save current text to undo stack before updating (text-only undo/redo)
      const currentNode = nodes.find(n => n.id === nodeId);
      if (currentNode && currentNode.text !== text.trim()) {
        const undoStack = currentNode.undoStack || [];
        const newUndoStack = [...undoStack, currentNode.text];
        updateNode(nodeId, { 
          text: text.trim(), 
          isEditing: false,
          undoStack: newUndoStack.slice(-10), // Keep only last 10 text changes
          redoStack: [] // Clear redo stack when new text change is made
        });
      } else {
        updateNode(nodeId, { text: text.trim(), isEditing: false });
      }
    }
  };

  const handleNodeUndo = (nodeId: string) => {
    const currentNode = nodes.find(n => n.id === nodeId);
    if (currentNode && currentNode.undoStack && currentNode.undoStack.length > 0) {
      const undoStack = [...currentNode.undoStack];
      const previousText = undoStack.pop()!;
      const redoStack = [...(currentNode.redoStack || []), currentNode.text];
      
      updateNode(nodeId, {
        text: previousText,
        undoStack: undoStack,
        redoStack: redoStack.slice(-10) // Keep only last 10 text changes
      });
    }
  };

  const handleNodeRedo = (nodeId: string) => {
    const currentNode = nodes.find(n => n.id === nodeId);
    if (currentNode && currentNode.redoStack && currentNode.redoStack.length > 0) {
      const redoStack = [...currentNode.redoStack];
      const nextText = redoStack.pop()!;
      const undoStack = [...(currentNode.undoStack || []), currentNode.text];
      
      updateNode(nodeId, {
        text: nextText,
        undoStack: undoStack.slice(-10), // Keep only last 10 text changes
        redoStack: redoStack
      });
    }
  };

  // Context menu handlers
  const calculateContextMenuPosition = (x: number, y: number) => {
    const menuWidth = 180;
    const menuHeight = 280; // Approximate height
    const margin = 10;
    
    let adjustedX = x;
    let adjustedY = y;
    
    // Ensure menu doesn't go off the right edge
    if (x + menuWidth > window.innerWidth - margin) {
      adjustedX = window.innerWidth - menuWidth - margin;
    }
    
    // Ensure menu doesn't go off the bottom edge
    if (y + menuHeight > window.innerHeight - margin) {
      adjustedY = window.innerHeight - menuHeight - margin;
    }
    
    // Ensure menu doesn't go off the left edge
    if (x < margin) {
      adjustedX = margin;
    }
    
    // Ensure menu doesn't go off the top edge
    if (y < margin) {
      adjustedY = margin;
    }
    
    return { x: adjustedX, y: adjustedY };
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dragState.isDragging) return;
    const position = calculateContextMenuPosition(e.clientX, e.clientY);
    setContextMenu({ x: position.x, y: position.y, visible: true });
  };

  // Mobile touch handlers for context menu
  const handleTouchStart = (e: React.TouchEvent) => {
    if (dragState.isDragging) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-node]')) return; // Don't show context menu on nodes
    
    const touch = e.touches[0];
    const timeoutId = setTimeout(() => {
      const position = calculateContextMenuPosition(touch.clientX, touch.clientY);
      setContextMenu({ x: position.x, y: position.y, visible: true });
    }, 500); // 500ms long press
    
    // Store timeout ID to clear it if touch ends before timeout
    (e.currentTarget as any)._contextMenuTimeout = timeoutId;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const timeoutId = (e.currentTarget as any)._contextMenuTimeout;
    if (timeoutId) {
      clearTimeout(timeoutId);
      (e.currentTarget as any)._contextMenuTimeout = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const timeoutId = (e.currentTarget as any)._contextMenuTimeout;
    if (timeoutId) {
      clearTimeout(timeoutId);
      (e.currentTarget as any)._contextMenuTimeout = null;
    }
  };

  const handleAIRequest = (prompt: string, nodeId?: string) =>
    new Promise<void>(async (resolve, reject) => {
      try {
        const aiResponse = await generateText(prompt);
        if (nodeId) updateNode(nodeId, { text: aiResponse });
        else {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect)
            createNode(
              Math.random() * (rect.width - 200),
              Math.random() * (rect.height - 100),
              aiResponse,
            );
        }
        resolve();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to generate content";
        if (nodeId) updateNode(nodeId, { text: `Error: ${errorMessage}` });
        else {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect)
            createNode(
              Math.random() * (rect.width - 200),
              Math.random() * (rect.height - 100),
              `Error: ${errorMessage}`,
            );
        }
        reject(error);
      }
    });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    if (!contextMenu.visible) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu((cm) => ({ ...cm, visible: false }));
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        setContextMenu((cm) => ({ ...cm, visible: false }));
      }
    };
    window.addEventListener("keydown", handleEsc);
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu.visible]);
  const exportToJSON = () => {
    const json = JSON.stringify(nodes, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToImage = async () => {
    if (!canvasRef.current) return;
    try {
      const canvas = await html2canvas(canvasRef.current);
      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = "canvas.png";
      a.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      if (nodes.length === 0) {
        canvasRef.current.scrollTop = 0;
        canvasRef.current.scrollLeft = 0;
        canvasRef.current.style.minWidth = "100%";
        canvasRef.current.style.minHeight = "100%";
        setShowNodeList(false);
      }
    }
  }, [nodes.length]);
  useEffect(() => {
    const updateSize = () => {
      const width = Math.max(window.innerWidth * 1.5, 1200);
      const height = Math.max(window.innerHeight * 1.5, 1200);
      setMinSize({ width, height });
    };

    updateSize(); // Initial call
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      <Toolbar
        onAddNode={() => createNode(100, 100)}
        onToggleAI={() => setShowAIAssistant(!showAIAssistant)}
        showAI={showAIAssistant}
        onExportJSON={exportToJSON}
        onExportImage={exportToImage}
        toggleList={() => setShowNodeList(!showNodeList)}
      />

      <div
        ref={scrollContainerRef}
        className={`w-full h-screen ${nodes.length > 0 ? "overflow-auto" : "overflow-hidden"} touch-pan-x touch-pan-y`}
      >
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onContextMenu={handleCanvasContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className={`relative ${nodes.length === 0 ? "w-full h-full" : ""} cursor-crosshair`}
          style={{
            backgroundImage:
              "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            minWidth: nodes.length > 0 ? `${minSize.width}px` : undefined,
            minHeight: nodes.length > 0 ? `${minSize.height}px` : undefined,
          }}
        >
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              isDragging={dragState.isDragging && dragState.nodeId === node.id}
              onMouseDown={(e) => handleStartDrag(e, node.id)}
              onEdit={() => handleNodeEdit(node.id)}
              onSave={(text) => handleNodeSave(node.id, text)}
              onDelete={() => deleteNode(node.id)}
              highlighted={highlightedNodeId === node.id}
              onAIUpdate={(prompt) => {
                setSelectedNodeId(node.id);
                setShowAIAssistant(true);
              }}
              onResize={(width, height) => updateNode(node.id, { width, height })}
              onUndo={() => handleNodeUndo(node.id)}
              onRedo={() => handleNodeRedo(node.id)}
            />
          ))}

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400">
                <Plus className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">
                  Click anywhere to add a node
                </p>
                <p className="text-sm">Or use the toolbar to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAIAssistant && (
        <AIAssistant
          onClose={() => {
            setShowAIAssistant(false);
            setSelectedNodeId(null);
          }}
          onSubmit={(prompt) =>
            handleAIRequest(prompt, selectedNodeId || undefined)
          }
          selectedNodeId={selectedNodeId}
        />
      )}

      {showNodeList && (
        <NodeList
          nodes={nodes}
          highlightedNodeId={highlightedNodeId}
          onSelectNode={(id) => {
            const node = nodes.find((n) => n.id === id);
            const scrollContainer = scrollContainerRef.current;
            if (!node || !scrollContainer) return;
            const nodeCenterX = node.x + node.width / 2;
            const nodeCenterY = node.y + node.height / 2;
            const scrollLeft = nodeCenterX - scrollContainer.clientWidth / 2;
            const scrollTop = nodeCenterY - scrollContainer.clientHeight / 2;
            scrollContainer.scrollTo({
              left: scrollLeft,
              top: scrollTop,
              behavior: "smooth",
            });
            setHighlightedNodeId(id);
            setTimeout(() => setHighlightedNodeId(null), 2000);
          }}
          onRemoveAll={() => {
            setNodes([]);
          }}
          onEditNode={(id) => handleNodeEdit(id)}
          onDeleteNode={(id) => deleteNode(id)}
          onAINode={(id) => {
            setSelectedNodeId(id);
            setShowAIAssistant(true);
          }}
          onClose={() => setShowNodeList(false)}
        />
      )}

      {contextMenu.visible && createPortal(
        <div
          className="context-menu fixed z-50 bg-white border border-gray-300 rounded shadow-lg py-1 px-2 min-w-[180px] pointer-events-auto"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-blue-50 rounded text-gray-800"
            onClick={() => {
              console.log('Add Node Here clicked');
              const canvasRect = canvasRef.current?.getBoundingClientRect();
              const scrollContainer = scrollContainerRef.current;
              let x = 100, y = 100;
              if (canvasRect && scrollContainer) {
                x = contextMenu.x - canvasRect.left + scrollContainer.scrollLeft;
                y = contextMenu.y - canvasRect.top + scrollContainer.scrollTop;
              }
              createNode(x, y);
              setContextMenu((cm) => ({ ...cm, visible: false }));
            }}
          >
            <Plus className="w-4 h-4" /> Add Node Here
          </button>

          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-purple-50 rounded text-gray-800"
            onClick={() => {
              setShowAIAssistant((show) => !show);
              setTimeout(() => setContextMenu((cm) => ({ ...cm, visible: false })), 100);
            }}
          >
            <Bot className="w-4 h-4" /> Toggle AI Assistant
          </button>
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-green-50 rounded text-gray-800"
            onClick={() => {
              exportToJSON();
              setTimeout(() => setContextMenu((cm) => ({ ...cm, visible: false })), 200);
            }}
          >
            <FileDown className="w-4 h-4" /> Export JSON
          </button>
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-yellow-50 rounded text-gray-800"
            onClick={() => {
              exportToImage();
              setTimeout(() => setContextMenu((cm) => ({ ...cm, visible: false })), 200);
            }}
          >
            <ImageIcon className="w-4 h-4" /> Export Image
          </button>
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-red-50 rounded text-gray-800"
            onClick={() => {
              setShowNodeList((show) => !show);
              setTimeout(() => setContextMenu((cm) => ({ ...cm, visible: false })), 100);
            }}
          >
            <ListIcon className="w-4 h-4" /> List Nodes
          </button>
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-gray-200 rounded text-gray-600 mt-2 border-t border-gray-200"
            onClick={() => setContextMenu((cm) => ({ ...cm, visible: false }))}
          >
            Cancel
          </button>
        </div>,
        document.body
      )}
      
    </div>
  );
};

export default Canvas;