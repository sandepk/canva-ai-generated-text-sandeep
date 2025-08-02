export interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  textColor?: string; // Custom text color for each node
  width: number;
  height: number;
  shape: 'rectangle' | 'circle'; // Node shape
  style?: 'colored' | 'crystal'; // Node style (colored background or crystal transparent)
  isEditing?: boolean;
  undoStack?: string[];
  redoStack?: string[];
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromPort: 'top' | 'right' | 'bottom' | 'left';
  toPort: 'top' | 'right' | 'bottom' | 'left';
}

export interface DragState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  nodeId: string | null;
}
