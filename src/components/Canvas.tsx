import React, { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { Node, DragState } from "../types";
import CanvasNode from "./CanvasNode";
import AIAssistant from "./AIAssistant";
import Toolbar from "./Toolbar";
import { generateText } from "../services/api";
import { Plus } from "lucide-react";
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
  const [undoStack, setUndoStack] = useState<Node[][]>([]);
  const [redoStack, setRedoStack] = useState<Node[][]>([]);

  const pushToUndoStack = useCallback((prevNodes: Node[]) => {
    setUndoStack((stack) => [...stack, prevNodes]);
    setRedoStack([]);
  }, []);

  const undo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setUndoStack((stack) => stack.slice(0, -1)); // removes the last recent item
      setRedoStack((stack) => [...stack, nodes]);
      setNodes(lastState);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setRedoStack((stack) => stack.slice(0, -1));
      setUndoStack((stack) => [...stack, nodes]);
      setNodes(nextState);
    }
  };

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
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createNode = useCallback(
    (x: number, y: number, text: string = "New Node") => {
      pushToUndoStack(nodes);
      const newNode: Node = {
        id: generateId(),
        x,
        y,
        text,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: 200,
        height: 50,
      };
      setNodes((prev) => [...prev, newNode]);
      return newNode.id;
    },
    [nodes, pushToUndoStack],
  );

  const updateNode = useCallback(
    (id: string, updates: Partial<Node>) => {
      pushToUndoStack(nodes);
      setNodes((prev) =>
        prev.map((node) => (node.id === id ? { ...node, ...updates } : node)),
      );
    },
    [nodes, pushToUndoStack],
  );

  const deleteNode = useCallback(
    (id: string) => {
      pushToUndoStack(nodes);
      setNodes((prev) => prev.filter((node) => node.id !== id));
    },
    [nodes, pushToUndoStack],
  );

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 100;
      const y = e.clientY - rect.top - 50;
      createNode(x, y);
    }
  };

  const handleStartDrag = (
    e: React.MouseEvent | React.TouchEvent,
    nodeId: string,
  ) => {
    e.preventDefault();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const offsetX = clientX - rect.left - node.x;
    const offsetY = clientY - rect.top - node.y;

    setDragState({
      isDragging: true,
      dragOffset: { x: offsetX, y: offsetY },
      nodeId,
    });

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!canvasRef.current) return;
      const moveX =
        moveEvent instanceof TouchEvent
          ? moveEvent.touches[0].clientX
          : (moveEvent as MouseEvent).clientX;
      const moveY =
        moveEvent instanceof TouchEvent
          ? moveEvent.touches[0].clientY
          : (moveEvent as MouseEvent).clientY;
      const x = moveX - rect.left - offsetX;
      const y = moveY - rect.top - offsetY;
      updateNode(nodeId, { x, y });
    };

    const handleEnd = () => {
      setDragState({
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        nodeId: null,
      });
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleEnd);
  };

  const handleNodeEdit = (nodeId: string) =>
    updateNode(nodeId, { isEditing: true });
  const handleNodeSave = (nodeId: string, text: string) =>
    updateNode(nodeId, { text, isEditing: false });

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
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y or Cmd+Y
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoStack, redoStack, nodes]);
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
        onUndo={undo}
        onRedo={redo}
      />

      <div
        ref={scrollContainerRef}
        className={`w-full h-screen ${nodes.length > 0 ? "overflow-auto" : "overflow-hidden"} touch-pan-x touch-pan-y`}
      >
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
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
        />
      )}
    </div>
  );
};

export default Canvas;
