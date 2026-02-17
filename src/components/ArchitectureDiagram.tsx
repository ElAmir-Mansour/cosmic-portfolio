import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, X, Code2 } from "lucide-react";
import type { CodeSnippet } from "@/services/DataService";

interface ArchitectureDiagramProps {
  definition: string;
  title?: string;
  codeSnippets?: CodeSnippet[];
}

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

// Lightweight syntax highlighting via regex
function highlightCode(code: string, language: string): string {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const keywords: Record<string, string[]> = {
    swift: ["import", "class", "struct", "func", "var", "let", "return", "if", "else", "for", "in", "self", "guard", "private", "public", "override", "init", "protocol", "extension", "some", "true", "false"],
    go: ["package", "import", "func", "var", "const", "return", "if", "else", "for", "range", "type", "struct", "interface", "defer", "go", "chan", "select", "case", "nil", "true", "false", "err"],
    python: ["import", "from", "class", "def", "return", "if", "else", "elif", "for", "in", "self", "with", "as", "try", "except", "raise", "None", "True", "False", "yield", "lambda", "not", "and", "or"],
    typescript: ["import", "export", "const", "let", "var", "function", "return", "if", "else", "for", "of", "in", "class", "interface", "type", "async", "await", "new", "this", "true", "false", "null", "undefined"],
  };

  const langKeywords = keywords[language] || keywords.typescript || [];

  let result = escaped;

  // Strings
  result = result.replace(/(["'`])(?:(?!\1).)*?\1/g, '<span class="text-emerald-400">$&</span>');

  // Comments
  result = result.replace(/(\/\/.*$|#.*$)/gm, '<span class="text-muted-foreground/60">$&</span>');

  // Keywords
  if (langKeywords.length > 0) {
    const kwPattern = new RegExp(`\\b(${langKeywords.join("|")})\\b`, "g");
    result = result.replace(kwPattern, '<span class="text-primary font-semibold">$&</span>');
  }

  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-400">$&</span>');

  return result;
}

const ArchitectureDiagram = ({ definition, title, codeSnippets }: ArchitectureDiagramProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { nodes, edges } = parseMermaid(definition);

  if (nodes.length === 0) return null;

  const snippetMap = new Map<string, CodeSnippet>();
  codeSnippets?.forEach((s) => snippetMap.set(s.nodeId, s));

  const selectedSnippet = selectedNodeId ? snippetMap.get(selectedNodeId) : null;

  const nodeWidth = 120;
  const nodeHeight = 40;
  const gapX = 60;
  const gapY = 60;

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
  const svgHeight = Math.ceil(nodes.length / cols) * (nodeHeight + gapY) + 20;

  const handleNodeClick = (nodeId: string) => {
    if (!snippetMap.has(nodeId)) return;
    setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
  };

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
            onClick={() => { setExpanded(false); setSelectedNodeId(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass rounded-xl p-6 border border-border max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">{title || "Architecture"}</h3>
                <button onClick={() => { setExpanded(false); setSelectedNodeId(null); }} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {codeSnippets && codeSnippets.length > 0 && (
                <p className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1">
                  <Code2 className="w-3 h-3" /> Click highlighted nodes to view code
                </p>
              )}

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
                  const hasSnippet = snippetMap.has(node.id);
                  const isSelected = selectedNodeId === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => handleNodeClick(node.id)}
                      style={{ cursor: hasSnippet ? "pointer" : "default" }}
                    >
                      <rect
                        x={pos.x - nodeWidth / 2}
                        y={pos.y - nodeHeight / 2}
                        width={nodeWidth}
                        height={nodeHeight}
                        rx="8"
                        fill="hsla(230, 25%, 12%, 0.9)"
                        stroke={isSelected ? "hsl(215, 80%, 60%)" : hasSnippet ? "hsl(215, 70%, 55%)" : "hsl(215, 60%, 50%)"}
                        strokeWidth={isSelected ? "2" : "1"}
                        opacity={isSelected ? 1 : undefined}
                      >
                        {hasSnippet && (
                          <animate
                            attributeName="stroke-opacity"
                            values="1;0.5;1"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        )}
                      </rect>
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
                      {/* Code indicator dot */}
                      {hasSnippet && (
                        <circle
                          cx={pos.x + nodeWidth / 2 - 8}
                          cy={pos.y - nodeHeight / 2 + 8}
                          r="3"
                          fill="hsl(215, 80%, 60%)"
                        >
                          <animate
                            attributeName="opacity"
                            values="1;0.4;1"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Code Panel */}
              <AnimatePresence mode="wait">
                {selectedSnippet && (
                  <motion.div
                    key={selectedSnippet.nodeId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="rounded-lg border border-border bg-background overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30">
                        <span className="text-xs font-mono text-foreground">{selectedSnippet.filename}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                          {selectedSnippet.language}
                        </span>
                      </div>
                      <pre className="p-3 overflow-x-auto text-xs leading-relaxed">
                        <code
                          className="font-mono text-foreground/90"
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(selectedSnippet.code, selectedSnippet.language),
                          }}
                        />
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ArchitectureDiagram;
