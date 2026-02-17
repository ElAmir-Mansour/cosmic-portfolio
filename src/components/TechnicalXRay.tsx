import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, ChevronDown, ChevronUp } from "lucide-react";
import type { TechnicalChallenge } from "@/services/DataService";

interface TechnicalXRayProps {
  challenges?: TechnicalChallenge[];
}

const TechnicalXRay = ({ challenges }: TechnicalXRayProps) => {
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
