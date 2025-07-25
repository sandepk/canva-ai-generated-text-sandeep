import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas'; 
import { Node, DragState } from '../types';
import CanvasNode from './CanvasNode';
import AIAssistant from './AIAssistant';
import Toolbar from './Toolbar';
import { generateText } from '../services/api';
import { Plus } from 'lucide-react';

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
];

const LOCAL_STORAGE_KEY = 'ai-canvas-nodes';

const Canvas: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(() => {
    // Load from localStorage on initial render
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nodes));
  }, [nodes]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    nodeId: null,
  });
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createNode = useCallback((x: number, y: number, text: string = 'New Node') => {
    const newNode: Node = {
      id: generateId(),
      x,
      y,
      text,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: 200,
      height: 100,
    };
    setNodes(prev => [...prev, newNode]);
    return newNode.id;
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<Node>) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, ...updates } : node
    ));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(node => node.id !== id));
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 100; // Center the node
      const y = e.clientY - rect.top - 50;
      createNode(x, y);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = e.clientX - rect.left - node.x;
    const offsetY = e.clientY - rect.top - node.y;

    setDragState({
      isDragging: true,
      dragOffset: { x: offsetX, y: offsetY },
      nodeId,
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - offsetX;
      const y = e.clientY - rect.top - offsetY;
      
      updateNode(nodeId, { x, y });
    };

    const handleMouseUp = () => {
      setDragState({
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        nodeId: null,
      });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleNodeEdit = (nodeId: string) => {
    updateNode(nodeId, { isEditing: true });
  };

  const handleNodeSave = (nodeId: string, text: string) => {
    updateNode(nodeId, { text, isEditing: false });
  };

  const handleAIRequest = (prompt: string, nodeId?: string) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const aiResponse = await generateText(prompt);
        
        if (nodeId) {
          // Update existing node
          updateNode(nodeId, { text: aiResponse });
        } else {
          // Create new node
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            createNode(
              Math.random() * (rect.width - 200),
              Math.random() * (rect.height - 100),
              aiResponse
            );
          }
        }
        resolve();
      } catch (error) {
        console.error('AI Request failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
        
        if (nodeId) {
          updateNode(nodeId, { text: `Error: ${errorMessage}` });
        } else {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            createNode(
              Math.random() * (rect.width - 200),
              Math.random() * (rect.height - 100),
              `Error: ${errorMessage}`
            );
          }
        }
        reject(error);
      }
    });
  };

  const exportToJSON = () => {
    const json = JSON.stringify(nodes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToImage = async () => {
    if (!canvasRef.current) return;
    const canvasElement = canvasRef.current;
    try {
      const canvas = await html2canvas(canvasElement);
      const imgData = canvas.toDataURL('image/png');

      const a = document.createElement('a');
      a.href = imgData;
      a.download = 'canvas.png';
      a.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      <Toolbar 
        onAddNode={() => createNode(100, 100)}
        onToggleAI={() => setShowAIAssistant(!showAIAssistant)}
        showAI={showAIAssistant}
        onExportJSON={exportToJSON}
        onExportImage={exportToImage}
      />

      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        style={{
          backgroundImage: `
            radial-gradient(circle, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        {nodes.map(node => (
          <CanvasNode
            key={node.id}
            node={node}
            isDragging={dragState.isDragging && dragState.nodeId === node.id}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onEdit={() => handleNodeEdit(node.id)}
            onSave={(text) => handleNodeSave(node.id, text)}
            onDelete={() => deleteNode(node.id)}
            onAIUpdate={(prompt) => {
              setSelectedNodeId(node.id);
              setShowAIAssistant(true);
            }}
          />
        ))}

        {/* Add Node Hint */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <Plus className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Click anywhere to add a node</p>
              <p className="text-sm">Or use the toolbar to get started</p>
            </div>
          </div>
        )}
      </div>

      {showAIAssistant && (
        <AIAssistant
          onClose={() => {
            setShowAIAssistant(false);
            setSelectedNodeId(null);
          }}
          onSubmit={(prompt) => handleAIRequest(prompt, selectedNodeId || undefined)}
          selectedNodeId={selectedNodeId}
        />
      )}
    </div>
  );
};

export default Canvas;