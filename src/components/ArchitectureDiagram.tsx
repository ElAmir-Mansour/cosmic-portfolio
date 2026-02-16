import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, X } from "lucide-react";

interface ArchitectureDiagramProps {
  definition: string;
  title?: string;
}

// Simple Mermaid-like renderer for flowcharts
// Parses: A[Label] --> B[Label] syntax into nodes and edges
interface Node {
  id: string;
  label: string;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
}

function parseMermaid(def: string): { nodes: Node[]; edges: Edge[] } {
  const nodes = new Map<string, string>();
  const edges: Edge[] = [];

  const lines = def.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("graph") || line.startsWith("flowchart")) continue;

    // Match: A[Label] -->|edge label| B[Label] or A[Label] --> B[Label]
    const edgeMatch = line.match(
      /(\w+)(?:\[([^\]]*)\])?\s*-->(?:\|([^|]*)\|)?\s*(\w+)(?:\[([^\]]*)\])?/
    );
    if (edgeMatch) {
      const [, fromId, fromLabel, edgeLabel, toId, toLabel] = edgeMatch;
      if (fromLabel) nodes.set(fromId, fromLabel);
      else if (!nodes.has(fromId)) nodes.set(fromId, fromId);
      if (toLabel) nodes.set(toId, toLabel);
      else if (!nodes.has(toId)) nodes.set(toId, toId);
      edges.push({ from: fromId, to: toId, label: edgeLabel });
      continue;
    }

    // Single node: A[Label]
    const nodeMatch = line.match(/(\w+)\[([^\]]*)\]/);
    if (nodeMatch) {
      nodes.set(nodeMatch[1], nodeMatch[2]);
    }
  }

  return {
    nodes: Array.from(nodes.entries()).map(([id, label]) => ({ id, label })),
    edges,
  };
}

const ArchitectureDiagram = ({ definition, title }: ArchitectureDiagramProps) => {
  const [expanded, setExpanded] = useState(false);
  const { nodes, edges } = parseMermaid(definition);

  if (nodes.length === 0) return null;

  // Layout: simple horizontal flow
  const nodeWidth = 120;
  const nodeHeight = 40;
  const gapX = 60;
  const gapY = 60;

  // Arrange nodes in rows of 3
  const cols = Math.min(3, nodes.length);
  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.set(node.id, {
      x: col * (nodeWidth + gapX) + nodeWidth / 2,
      y: row * (nodeHeight + gapY) + nodeHeight / 2,
    });
  });

  const svgWidth = cols * (nodeWidth + gapX);
  const svgHeight = (Math.ceil(nodes.length / cols)) * (nodeHeight + gapY) + 20;

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1.5 mt-2 text-xs text-primary hover:underline"
      >
        <GitBranch className="w-3 h-3" /> View Architecture
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass rounded-xl p-6 border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">{title || "Architecture"}</h3>
                <button onClick={() => setExpanded(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full"
                style={{ maxHeight: "400px" }}
              >
                {/* Edges */}
                {edges.map((edge, i) => {
                  const from = positions.get(edge.from);
                  const to = positions.get(edge.to);
                  if (!from || !to) return null;
                  const midX = (from.x + to.x) / 2;
                  const midY = (from.y + to.y) / 2;
                  return (
                    <g key={`edge-${i}`}>
                      <line
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke="hsl(215, 20%, 40%)" strokeWidth="1.5"
                        markerEnd="url(#arrow)"
                      />
                      {edge.label && (
                        <text x={midX} y={midY - 6} textAnchor="middle" fill="hsl(215, 20%, 55%)" fontSize="9" fontFamily="monospace">
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Arrowhead marker */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(215, 20%, 40%)" />
                  </marker>
                </defs>

                {/* Nodes */}
                {nodes.map((node) => {
                  const pos = positions.get(node.id)!;
                  return (
                    <g key={node.id}>
                      <rect
                        x={pos.x - nodeWidth / 2}
                        y={pos.y - nodeHeight / 2}
                        width={nodeWidth}
                        height={nodeHeight}
                        rx="8"
                        fill="hsla(230, 25%, 12%, 0.9)"
                        stroke="hsl(215, 60%, 50%)"
                        strokeWidth="1"
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 4}
                        textAnchor="middle"
                        fill="hsl(215, 80%, 70%)"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="500"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ArchitectureDiagram;
