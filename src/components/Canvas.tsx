import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas";
import { Node, DragState, Connection } from "../types";
import CanvasNode from "./CanvasNode";
import AIAssistant from "./AIAssistant";
import Toolbar from "./Toolbar";
import DesktopSidebar from "./DesktopSidebar";
import { generateText } from "../services/api";
import { Plus, Bot, FileDown, Image as ImageIcon, ListIcon, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(
    null,
  );
  const [showNodeList, setShowNodeList] = useState(false);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    nodeId: null,
  });
  const [dragCollision, setDragCollision] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });
  const [showContextSidebar, setShowContextSidebar] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000'); // Global text color for new nodes (black)
  const [selectedNodeColor, setSelectedNodeColor] = useState('#fef3c7'); // Global node background color for new nodes (yellow)
  const [selectedShape, setSelectedShape] = useState<'rectangle' | 'circle'>('rectangle'); // Global shape for new nodes
  const [nodeStyle, setNodeStyle] = useState<'colored' | 'crystal'>('colored'); // Global node style for new nodes
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingNode, setConnectingNode] = useState<{ nodeId: string; port: 'top' | 'right' | 'bottom' | 'left' } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Connection functions
  const handleConnectionStart = (nodeId: string, port: 'top' | 'right' | 'bottom' | 'left') => {
    setConnectingNode({ nodeId, port });
  };

  const handleConnectionEnd = (nodeId: string, port: 'top' | 'right' | 'bottom' | 'left') => {
    if (connectingNode && connectingNode.nodeId !== nodeId) {
      const newConnection: Connection = {
        id: generateId(),
        fromNodeId: connectingNode.nodeId,
        toNodeId: nodeId,
        fromPort: connectingNode.port,
        toPort: port,
      };
      setConnections(prev => [...prev, newConnection]);
    }
    setConnectingNode(null);
  };

  const deleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  // Check if a position overlaps with existing nodes
  const checkCollision = useCallback((x: number, y: number, width: number, height: number, excludeId?: string) => {
    return nodes.some(node => {
      if (excludeId && node.id === excludeId) return false;
      
      // Check for rectangle overlap
      const overlap = !(x + width < node.x || node.x + node.width < x || 
                       y + height < node.y || node.y + node.height < y);
      
      return overlap;
    });
  }, [nodes]);

  // Find a non-overlapping position for a new node
  const findNonOverlappingPosition = useCallback((x: number, y: number, width: number, height: number) => {
    let newX = x;
    let newY = y;
    let attempts = 0;
    const maxAttempts = 50;
    
    while (checkCollision(newX, newY, width, height) && attempts < maxAttempts) {
      // Try different positions in a spiral pattern
      const angle = attempts * Math.PI / 4;
      const radius = Math.sqrt(attempts) * 20;
      newX = x + Math.cos(angle) * radius;
      newY = y + Math.sin(angle) * radius;
      attempts++;
    }
    
    return { x: newX, y: newY };
  }, [checkCollision]);

  const createNode = useCallback(
    (x: number, y: number, text: string = "") => {
      // Calculate minimal initial height for empty node
      const fontSize = isMobile ? 16 : 14;
      const lineHeight = fontSize * 1.6;
      const padding = 16; // 8px on each side - reduced padding
      const initialHeight = lineHeight + padding;
      const nodeWidth = isMobile ? 160 : 200;
      
      // Find non-overlapping position
      const position = findNonOverlappingPosition(x, y, nodeWidth, initialHeight);
      
      const newNode: Node = {
        id: generateId(),
        x: position.x,
        y: position.y,
        text,
        color: selectedNodeColor, // Use selected node background color for new nodes
        textColor: selectedColor, // Use selected text color for new nodes
        width: nodeWidth, // Smaller default width on mobile
        height: initialHeight, // Use calculated initial height
        shape: selectedShape, // Use selected shape for new nodes
        style: nodeStyle, // Use selected node style for new nodes
        isEditing: true,
      };
      setNodes((prev) => [...prev, newNode]);
      return newNode.id;
    },
    [nodes, isMobile, selectedColor, selectedNodeColor, selectedShape, nodeStyle, findNonOverlappingPosition]
  );

  const createNodeWithText = useCallback(
    (text: string) => {
      // Create node at center of viewport (optimized for mobile)
      const centerX = window.innerWidth / 2 - (isMobile ? 90 : 100);
      const centerY = (window.innerHeight / 2) - 25 + (isMobile ? 50 : 0); // Offset for mobile
      
      // Calculate text dimensions to auto-size the node based on actual content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.whiteSpace = 'pre-wrap';
      tempDiv.style.wordBreak = 'break-words';
      tempDiv.style.fontSize = isMobile ? '16px' : '14px';
      tempDiv.style.fontWeight = '500';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      tempDiv.style.padding = '16px';
      tempDiv.style.width = '300px'; // Start with a reasonable width
      tempDiv.style.height = 'auto';
      tempDiv.textContent = text || "Double-click to edit";
      
      document.body.appendChild(tempDiv);
      const rect = tempDiv.getBoundingClientRect();
      const contentWidth = rect.width;
      const contentHeight = rect.height;
      document.body.removeChild(tempDiv);
      
      // Calculate node dimensions with padding
      const padding = isMobile ? 8 : 12;
      const minWidth = isMobile ? 160 : 200;
      const maxWidth = Math.min(window.innerWidth - (isMobile ? 32 : 100), isMobile ? 400 : 600);
      
      // Use actual content dimensions - no fixed minimum height
      const nodeWidth = Math.max(minWidth, Math.min(contentWidth + padding * 2, maxWidth));
      const nodeHeight = contentHeight + padding * 2;
      
      // Find non-overlapping position
      const position = findNonOverlappingPosition(centerX, centerY, nodeWidth, nodeHeight);
      
      // Create node with calculated dimensions
      const newNode: Node = {
        id: generateId(),
        x: position.x,
        y: position.y,
        text,
        color: selectedNodeColor, // Use selected node background color for new nodes
        textColor: selectedColor, // Use selected text color for new nodes
        width: nodeWidth,
        height: nodeHeight,
        shape: selectedShape, // Use selected shape for new nodes
        style: nodeStyle, // Use selected node style for new nodes
        isEditing: true,
      };
      
      setNodes((prev) => [...prev, newNode]);
      return newNode.id;
    },
    [createNode, isMobile, selectedColor, selectedNodeColor, selectedShape, nodeStyle]
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

  const scrollToNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    const scrollContainer = scrollContainerRef.current;
    
    if (!node || !scrollContainer) return;
    
    // Calculate the center of the node
    const nodeCenterX = node.x + node.width / 2;
    const nodeCenterY = node.y + node.height / 2;
    
    // Calculate the scroll position to center the node
    const scrollLeft = nodeCenterX - scrollContainer.clientWidth / 2;
    const scrollTop = nodeCenterY - scrollContainer.clientHeight / 2;
    
    // Smooth scroll to the node
    scrollContainer.scrollTo({
      left: Math.max(0, scrollLeft),
      top: Math.max(0, scrollTop),
      behavior: 'smooth'
    });
    
    // Highlight the node briefly
    setHighlightedNodeId(nodeId);
    setTimeout(() => setHighlightedNodeId(null), 2000);
  };

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, nodeId: string) => {
    const target = e.target as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const scrollContainer = scrollContainerRef.current;
    
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
    
    // Calculate offset relative to the node's actual position in the canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect || !scrollContainer) return;
    
    // Get the current node to calculate proper offset
    const currentNode = nodes.find(n => n.id === nodeId);
    if (!currentNode) return;
    
    // Calculate offset from the node's actual position to the click point
    const nodeScreenX = currentNode.x + canvasRect.left - scrollContainer.scrollLeft;
    const nodeScreenY = currentNode.y + canvasRect.top - scrollContainer.scrollTop;
    const offsetX = clientX - nodeScreenX;
    const offsetY = clientY - nodeScreenY;
  
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
        // Calculate new position based on mouse/touch position and offset
        const newX = moveX - canvasRect.left + scrollContainer.scrollLeft - offsetX;
        const newY = moveY - canvasRect.top + scrollContainer.scrollTop - offsetY;
        
        // Ensure the node doesn't go outside reasonable bounds
        const minX = -currentNode.width + 50; // Allow some overflow for dragging
        const minY = -currentNode.height + 50;
        const maxX = Math.max(window.innerWidth, scrollContainer.scrollWidth) - 50;
        const maxY = Math.max(window.innerHeight, scrollContainer.scrollHeight) - 50;
        
        const clampedX = Math.max(minX, Math.min(newX, maxX));
        const clampedY = Math.max(minY, Math.min(newY, maxY));
        
        // Check for collisions with other nodes
        const wouldCollide = checkCollision(clampedX, clampedY, currentNode.width, currentNode.height, nodeId);
        
        setDragCollision(wouldCollide);
        
        // Always update position during drag, but mark collision state
        updateNode(nodeId, { x: clampedX, y: clampedY });
      }
    };

    const handleDragEnd = () => {
      // If there's a collision when drag ends, find a safe position
      if (dragCollision && dragState.nodeId) {
        const currentNode = nodes.find(n => n.id === dragState.nodeId);
        if (currentNode) {
          const safePosition = findNonOverlappingPosition(currentNode.x, currentNode.y, currentNode.width, currentNode.height);
          updateNode(dragState.nodeId, { x: safePosition.x, y: safePosition.y });
        }
      }
      
      setDragState(prev => ({ ...prev, isDragging: false, nodeId: null }));
      setDragCollision(false);
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



  // Mobile navigation functions
  const handleMobileNavLeft = () => {
    if (scrollContainerRef.current) {
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const scrollAmount = window.innerWidth * 0.8; // Scroll 80% of viewport width
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, currentScroll - scrollAmount),
        behavior: 'smooth'
      });
    }
  };

  const handleMobileNavRight = () => {
    if (scrollContainerRef.current) {
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const scrollAmount = window.innerWidth * 0.8; // Scroll 80% of viewport width
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: Math.min(maxScroll, currentScroll + scrollAmount),
        behavior: 'smooth'
      });
    }
  };

  // Context menu handlers
  const calculateContextMenuPosition = (x: number, y: number) => {
    const menuWidth = 180;
    const menuHeight = 280; // Approximate height
    const margin = 10;
    
    // Check if it's mobile (screen width less than 768px)
    const isMobile = window.innerWidth < 768;
    
    let adjustedX = x;
    let adjustedY = y;
    
    if (isMobile) {
      // For mobile, position at bottom left
      adjustedX = margin;
      adjustedY = window.innerHeight - menuHeight - margin;
    } else {
      // For desktop, use the original positioning logic
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
    }
    
    return { x: adjustedX, y: adjustedY };
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dragState.isDragging) return;
    
    // Check if it's mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setShowContextSidebar(true);
    } else {
      const position = calculateContextMenuPosition(e.clientX, e.clientY);
      setContextMenu({ x: position.x, y: position.y, visible: true });
    }
  };

  // Mobile touch handlers for context menu
  const handleTouchStart = (e: React.TouchEvent) => {
    if (dragState.isDragging) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-node]')) return; // Don't show context menu on nodes
    
    // Only handle single touch for context menu, allow multi-touch for scrolling
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const timeoutId = setTimeout(() => {
        setShowContextSidebar(true);
      }, 500); // 500ms long press
      
      // Store timeout ID to clear it if touch ends before timeout
      (e.currentTarget as any)._contextMenuTimeout = timeoutId;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const timeoutId = (e.currentTarget as any)._contextMenuTimeout;
    if (timeoutId) {
      clearTimeout(timeoutId);
      (e.currentTarget as any)._contextMenuTimeout = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Allow multi-touch scrolling to work normally
    if (e.touches.length > 1) {
      return; // Don't interfere with multi-touch gestures
    }
    
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
    if (!contextMenu.visible && !showContextSidebar) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu((cm) => ({ ...cm, visible: false }));
        setShowContextSidebar(false);
      }
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
  }, [contextMenu.visible, showContextSidebar]);

  // Keyboard navigation for scrolling to nodes
  useEffect(() => {
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      // Ctrl/Cmd + G to scroll to first node
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        if (nodes.length > 0) {
          scrollToNode(nodes[0].id);
        }
      }
      
      // Ctrl/Cmd + Shift + G to scroll to last node
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        if (nodes.length > 0) {
          scrollToNode(nodes[nodes.length - 1].id);
        }
      }
    };

    document.addEventListener("keydown", handleKeyboardNavigation);
    return () => {
      document.removeEventListener("keydown", handleKeyboardNavigation);
    };
  }, [nodes]);
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
      // Calculate the bounds of all nodes to determine the full canvas area
      let minX = 0, minY = 0, maxX = window.innerWidth, maxY = window.innerHeight;
      
      if (nodes.length > 0) {
        minX = Math.min(...nodes.map(node => node.x));
        minY = Math.min(...nodes.map(node => node.y));
        maxX = Math.max(...nodes.map(node => node.x + node.width));
        maxY = Math.max(...nodes.map(node => node.y + node.height));
      }
      
      // Add padding around the nodes
      const padding = 100;
      const canvasWidth = Math.max(maxX - minX + padding * 2, window.innerWidth);
      const canvasHeight = Math.max(maxY - minY + padding * 2, window.innerHeight);
      
      // Create a temporary container with the full canvas area
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = `${canvasWidth}px`;
      tempContainer.style.height = `${canvasHeight}px`;
      tempContainer.style.backgroundImage = "radial-gradient(circle, #e5e7eb 1px, transparent 1px)";
      tempContainer.style.backgroundSize = "20px 20px";
      tempContainer.style.backgroundColor = '#f9fafb';
      tempContainer.style.overflow = 'hidden';
      tempContainer.style.zIndex = '0';
      
      // Clone the actual rendered nodes from the UI to preserve exact styling
      const actualCanvas = canvasRef.current;
      const actualNodes = actualCanvas.querySelectorAll('[data-node-id]');
      
      actualNodes.forEach((actualNode) => {
        const nodeId = actualNode.getAttribute('data-node-id');
        const node = nodes.find(n => n.id === nodeId);
        
        if (node) {
          // Clone the actual rendered node to preserve exact styling
          const clonedNode = actualNode.cloneNode(true) as HTMLElement;
          
          // Position the cloned node in the export container
          clonedNode.style.position = 'absolute';
          clonedNode.style.left = `${node.x - minX + padding}px`;
          clonedNode.style.top = `${node.y - minY + padding}px`;
          clonedNode.style.transform = 'none'; // Remove any transforms
          clonedNode.style.zIndex = '1';
          
          // Ensure the node is visible and properly styled
          clonedNode.style.display = 'block';
          clonedNode.style.visibility = 'visible';
          clonedNode.style.opacity = '1';
          
          // Remove any interactive elements that shouldn't be in the export
          const actionButtons = clonedNode.querySelectorAll('.node-actions, [data-action]');
          actionButtons.forEach(btn => btn.remove());
          
          tempContainer.appendChild(clonedNode);
        }
      });
      
      // If no actual nodes found, fall back to creating them from data
      if (tempContainer.children.length === 0) {
        nodes.forEach(node => {
          const nodeElement = document.createElement('div');
          nodeElement.style.position = 'absolute';
          nodeElement.style.left = `${node.x - minX + padding}px`;
          nodeElement.style.top = `${node.y - minY + padding}px`;
          nodeElement.style.width = `${node.width}px`;
          nodeElement.style.height = `${node.height}px`;
          nodeElement.style.backgroundColor = node.color;
          nodeElement.style.borderRadius = '8px';
          nodeElement.style.padding = '12px';
          nodeElement.style.fontSize = '14px';
          nodeElement.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          nodeElement.style.color = '#1f2937';
          nodeElement.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          nodeElement.style.border = '1px solid rgba(0, 0, 0, 0.1)';
          nodeElement.style.whiteSpace = 'pre-wrap';
          nodeElement.style.wordBreak = 'break-word';
          nodeElement.style.overflow = 'hidden';
          nodeElement.style.display = 'block';
          nodeElement.style.zIndex = '1';
          nodeElement.textContent = node.text;
          
          tempContainer.appendChild(nodeElement);
        });
      }
      
      document.body.appendChild(tempContainer);
      
      // Capture the full canvas area
      const canvas = await html2canvas(tempContainer, {
        width: canvasWidth,
        height: canvasHeight,
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9fafb',
        logging: false,
        removeContainer: false,
        foreignObjectRendering: false,
        imageTimeout: 0
      });
      
      // Clean up
      document.body.removeChild(tempContainer);
      
      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = "canvas.png";
      a.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    }
  };

  // Render connection lines
  const renderConnections = () => {
    return null; // Temporarily disabled to fix issues
  };

  useEffect(() => {
    if (nodes.length === 0) {
      setShowNodeList(false);
    }
  }, [nodes.length]);
  useEffect(() => {
    const updateSize = () => {
      // Calculate the bounds of all nodes to determine canvas size
      let canvasWidth = window.innerWidth;
      let canvasHeight = window.innerHeight;
      
      if (nodes.length > 0) {
        const minX = Math.min(...nodes.map(node => node.x));
        const minY = Math.min(...nodes.map(node => node.y));
        const maxX = Math.max(...nodes.map(node => node.x + node.width));
        const maxY = Math.max(...nodes.map(node => node.y + node.height));
        
        // Add padding around nodes (increased viewport area for mobile)
        const padding = window.innerWidth < 768 ? 400 : 200;
        canvasWidth = Math.max(canvasWidth, maxX - minX + padding * 2);
        canvasHeight = Math.max(canvasHeight, maxY - minY + padding * 2);
      }
      
      setMinSize({ width: canvasWidth, height: canvasHeight });
    };

    updateSize(); // Initial call
    window.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, [nodes]);

  // Track mobile/desktop state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Desktop Sidebar - Only show on desktop */}
      {!isMobile && (
        <DesktopSidebar
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          selectedNodeColor={selectedNodeColor}
          onNodeColorChange={setSelectedNodeColor}
          nodeStyle={nodeStyle}
          onNodeStyleChange={setNodeStyle}
        />
      )}

      <Toolbar
        onAddNode={() => createNode(100, 100)}
        onToggleAI={() => setShowAIAssistant(!showAIAssistant)}
        showAI={showAIAssistant}
        onExportJSON={exportToJSON}
        onExportImage={exportToImage}
        toggleList={() => setShowNodeList(!showNodeList)}
        showNodeList={showNodeList}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        selectedNodeColor={selectedNodeColor}
        onNodeColorChange={setSelectedNodeColor}
      />

      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-auto canvas-scroll"
        style={{ 
          height: isMobile ? 'calc(100vh - 90px)' : 'calc(100vh - 40px)', // Increased height for mobile
          paddingTop: isMobile ? '90px' : '80px', // Reduced padding for mobile to increase viewport
          paddingLeft: isMobile ? '0' : '64px', // Add left padding for desktop sidebar
          minHeight: isMobile ? 'calc(100vh - 90px)' : 'calc(100vh - 40px)',
          minWidth: isMobile ? '200vw' : '100%', // Extra width for mobile scrolling
          WebkitOverflowScrolling: 'touch',
          overflowX: 'auto',
          overflowY: 'auto'
        }}
        onWheel={(e) => {
          // Ensure wheel events work for scrolling
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          // Allow touch events to propagate for scrolling
          if (e.touches.length > 1) {
            e.stopPropagation();
          }
        }}
      >
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onContextMenu={handleCanvasContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className="relative cursor-crosshair"
          style={{
            width: minSize.width,
            height: minSize.height,
            minHeight: isMobile ? '150vh' : '100vh', // Increased minimum height for mobile
            backgroundImage:
              "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            // Ensure canvas doesn't interfere with scrolling
            pointerEvents: 'auto',
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
              dragCollision={dragCollision && dragState.nodeId === node.id}
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

      {/* Render Connections */}
      {renderConnections()}

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
          onSelectNode={scrollToNode}
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

      {/* Mobile Navigation Arrows */}
      {isMobile && (
        <>
          {/* Left Arrow */}
          <button
            onClick={handleMobileNavLeft}
            className="fixed left-2 top-1/2 transform -translate-y-1/2 z-40 bg-white/90 backdrop-blur-lg rounded-full p-3 shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-200"
            style={{ top: 'calc(50% + 2rem)' }} // Offset for toolbar
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleMobileNavRight}
            className="fixed right-2 top-1/2 transform -translate-y-1/2 z-40 bg-white/90 backdrop-blur-lg rounded-full p-3 shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-200"
            style={{ top: 'calc(50% + 2rem)' }} // Offset for toolbar
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </>
      )}

      {/* Desktop Context Menu */}
      {contextMenu.visible && createPortal(
        <div
          className="context-menu fixed z-50 bg-white border border-gray-300 rounded shadow-lg py-1 px-2 min-w-[180px] pointer-events-auto sm:min-w-[180px] min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-blue-50 rounded text-gray-800 sm:py-1 py-2"
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
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-purple-50 rounded text-gray-800 sm:py-1 py-2"
            onClick={() => {
              setShowAIAssistant((show) => !show);
              setTimeout(() => setContextMenu((cm) => ({ ...cm, visible: false })), 100);
            }}
          >
            <Bot className="w-4 h-4" /> Toggle AI Assistant
          </button>
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-green-50 rounded text-gray-800 sm:py-1 py-2"
            onClick={() => {
              exportToJSON();
              setTimeout(() => setContextMenu((cm) => ({ ...cm, visible: false })), 200);
            }}
          >
            <FileDown className="w-4 h-4" /> Export JSON
          </button>
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-yellow-50 rounded text-gray-800 sm:py-1 py-2"
            onClick={() => {
              exportToImage();
              setTimeout(() => setContextMenu((cm) => ({ ...cm, visible: false })), 200);
            }}
          >
            <ImageIcon className="w-4 h-4" /> Export Image
          </button>
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-red-50 rounded text-gray-800 sm:py-1 py-2"
            onClick={() => {
              setShowNodeList(true);
              setTimeout(() => setContextMenu((cm) => ({ ...cm, visible: false })), 100);
            }}
          >
            <ListIcon className="w-4 h-4" /> List Nodes
          </button>
          <button
            className="w-full flex items-center gap-2 text-left px-2 py-1 hover:bg-gray-200 rounded text-gray-600 mt-2 border-t border-gray-200 sm:py-1 py-2"
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