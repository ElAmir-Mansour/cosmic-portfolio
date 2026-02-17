import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FlaskConical, CheckCircle2, Clock } from "lucide-react";
import type { ResearchMilestone } from "@/services/DataService";

interface ResearchChronicleProps {
  abstract?: string;
  milestones?: ResearchMilestone[];
}

const STATUS_ICONS = {
  completed: CheckCircle2,
  "in-progress": Clock,
  upcoming: Clock,
};

const STATUS_COLORS = {
  completed: "text-[hsl(142,70%,49%)]",
  "in-progress": "text-primary",
  upcoming: "text-muted-foreground/40",
};

const ResearchChronicle = ({ abstract, milestones }: ResearchChronicleProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!abstract && (!milestones || milestones.length === 0)) return null;

  return (
    <div className="mt-6 space-y-6">
      {/* Live Abstract */}
      {abstract && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Research Abstract
            </h3>
          </div>
          {abstract.split("\n\n").map((para, i) => (
            <p key={i} className={`text-sm text-muted-foreground leading-relaxed ${i > 0 ? "mt-2" : ""}`}>
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Timeline */}
      {milestones && milestones.length > 0 && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Research Timeline
            </h3>
          </div>
          <div className="relative pl-6">
            <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border" />
            {milestones.map((ms) => {
              const Icon = STATUS_ICONS[ms.status];
              const isExpanded = expandedId === ms.id;
              return (
                <div key={ms.id} className="relative mb-4 last:mb-0">
                  <div className="absolute -left-6 top-0.5">
                    <Icon className={`w-[18px] h-[18px] ${STATUS_COLORS[ms.status]}`} />
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ms.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{ms.title}</span>
                      <span className="text-[10px] text-muted-foreground">{ms.date}</span>
                      {ms.status === "in-progress" && (
                        <span className="px-1.5 py-0.5 text-[9px] rounded bg-primary/20 text-primary font-medium">
                          Current
                        </span>
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-muted-foreground leading-relaxed mt-1 overflow-hidden"
                      >
                        {ms.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchChronicle;
