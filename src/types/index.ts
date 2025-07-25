export interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  width: number;
  height: number;
  isEditing?: boolean;
}

export interface DragState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  nodeId: string | null;
}