import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, ChevronDown, ChevronUp } from "lucide-react";

interface Challenge {
  question: string;
  decision: string;
  reasoning: string;
}

interface TechnicalXRayProps {
  projectId: string;
}

// Decision logs per project (keyed by project ID)
const DECISION_LOGS: Record<string, Challenge[]> = {
  "ios-1": [
    {
      question: "Why SwiftUI over UIKit?",
      decision: "SwiftUI with UIKit bridges for complex views",
      reasoning:
        "SwiftUI provides declarative UI composition that speeds up iteration. UIKit bridges were used for the custom workout animation layer where SwiftUI's Canvas API lacked fine-grained control over frame timing.",
    },
    {
      question: "How was HealthKit data synchronized?",
      decision: "Background fetch with CoreData buffer",
      reasoning:
        "HealthKit queries are expensive. A CoreData intermediate cache reduces HealthKit calls to scheduled background fetches, keeping the UI responsive while maintaining data freshness within 15-minute intervals.",
    },
  ],
  "fs-1": [
    {
      question: "Why Go instead of Node.js for the backend?",
      decision: "Go with goroutines for concurrent order processing",
      reasoning:
        "The marketplace required handling 500+ concurrent checkout sessions. Go's goroutine model provided predictable memory usage under load, unlike Node.js's event loop which showed GC pauses at high concurrency during load testing.",
    },
    {
      question: "How was inventory consistency maintained?",
      decision: "PostgreSQL advisory locks with optimistic concurrency",
      reasoning:
        "Traditional row-level locks caused deadlocks during flash sales. Advisory locks on product IDs combined with version-based optimistic concurrency eliminated deadlocks while maintaining strong consistency.",
    },
  ],
  "fs-2": [
    {
      question: "Real-time updates: WebSocket vs SSE?",
      decision: "WebSocket with automatic reconnection",
      reasoning:
        "Server-Sent Events would have simplified the server, but the dashboard requires bidirectional communication for triggering deployments and sending commands to containers. WebSocket with exponential backoff reconnection provided the reliability needed.",
    },
  ],
  "nlp-1": [
    {
      question: "BERT vs RoBERTa for sentiment classification?",
      decision: "RoBERTa with domain-adaptive pre-training",
      reasoning:
        "RoBERTa's dynamic masking and larger batch training showed 3% higher F1 on our mental health text corpus. Domain-adaptive pre-training on unlabeled forum data before fine-tuning further improved recall for subtle negative sentiment by 8%.",
    },
    {
      question: "How were attention weights validated?",
      decision: "Comparison with human annotator agreement scores",
      reasoning:
        "Attention weights were compared against expert annotations of depression markers. Cohen's kappa between model attention and human annotations reached 0.72, confirming the model attends to clinically relevant linguistic features.",
    },
  ],
  "pm-1": [
    {
      question: "How was resistance to agile managed?",
      decision: "Incremental adoption with pilot teams",
      reasoning:
        "Rather than a full organizational switch, two pilot teams adopted Scrum for one quarter. Their 40% improvement in delivery predictability created internal demand, making the broader rollout collaborative rather than top-down.",
    },
  ],
};

const TechnicalXRay = ({ projectId }: TechnicalXRayProps) => {
  const challenges = DECISION_LOGS[projectId];
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!challenges || challenges.length === 0) return null;

  return (
    <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          Technical Decisions
        </span>
      </div>
      <div className="space-y-2">
        {challenges.map((ch, i) => {
          const isOpen = expandedIdx === i;
          return (
            <div key={i} className="rounded bg-secondary/30 border border-border overflow-hidden">
              <button
                onClick={() => setExpandedIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-3 py-2 text-left"
              >
                <span className="text-xs font-medium text-foreground">{ch.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1.5">
                      <p className="text-xs text-primary font-medium">{ch.decision}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {ch.reasoning}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TechnicalXRay;
