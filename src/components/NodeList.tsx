import React from "react";
import { Node } from "../types";

interface NodeListProps {
  nodes: Node[];
  onSelectNode: (id: string) => void;
  highlightedNodeId?: string | null;
}

const NodeList: React.FC<NodeListProps> = ({
  nodes,
  onSelectNode,
  highlightedNodeId,
}) => {
  return (
    <div className="absolute top-[82px] lg:top-[53px] md:top-[73px] right-2 z-40 bg-white shadow-lg rounded-lg p-4 w-64 max-h-[80vh] overflow-y-auto">
      <div className="bg-blue-50 rounded-t-lg px-4 py-2 border-b border-gray-200">
        <h3 className="text-blue-800 text-base font-semibold tracking-wide">
          All Nodes
        </h3>
      </div>
      <ul className="space-y-1">
        {nodes.map((node, index) => (
          <li
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            className={`cursor-pointer text-sm px-2 py-1 rounded transition-colors duration-200
              ${
                node.id === highlightedNodeId
                  ? "bg-yellow-100 text-yellow-700 font-semibold"
                  : index % 2 === 0
                    ? "bg-gray-50 text-gray-800 hover:bg-gray-100 hover:text-blue-600"
                    : "bg-white text-gray-800 hover:bg-gray-100 hover:text-blue-600"
              }`}
          >
            {node.text.slice(0, 20) || "Untitled Node"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NodeList;
