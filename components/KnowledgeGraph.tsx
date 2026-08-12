"use client";

import ReactFlow, {
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";

const nodes = [
  {
    id: "1",
    position: { x: 250, y: 0 },
    data: { label: "AI Company Brain" },
  },
  {
    id: "2",
    position: { x: 100, y: 120 },
    data: { label: "Healthcare" },
  },
  {
    id: "3",
    position: { x: 400, y: 120 },
    data: { label: "Operating System" },
  },
  {
    id: "4",
    position: { x: 20, y: 240 },
    data: { label: "Doctors" },
  },
  {
    id: "5",
    position: { x: 180, y: 240 },
    data: { label: "Hospitals" },
  },
  {
    id: "6",
    position: { x: 320, y: 240 },
    data: { label: "Linux" },
  },
  {
    id: "7",
    position: { x: 500, y: 240 },
    data: { label: "Windows" },
  },
];

const edges = [
  { id: "e1", source: "1", target: "2" },
  { id: "e2", source: "1", target: "3" },
  { id: "e3", source: "2", target: "4" },
  { id: "e4", source: "2", target: "5" },
  { id: "e5", source: "3", target: "6" },
  { id: "e6", source: "3", target: "7" },
];
export default function KnowledgeGraph() {
  return (
    <div className="bg-white rounded-xl shadow p-6 h-[500px] mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Knowledge Graph
      </h2>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}