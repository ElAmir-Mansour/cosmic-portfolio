import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Youtube, Globe, TrendingUp } from "lucide-react";
import type { Planet, ImpactMetric, LearningPath } from "@/services/DataService";

const ICON_MAP: Record<string, React.ElementType> = {
  youtube: Youtube,
  globe: Globe,
  graduation: GraduationCap,
  trending: TrendingUp,
};

interface InstructionalFootprintProps {
  planet: Planet;
}

const InstructionalFootprint = React.forwardRef<HTMLDivElement, InstructionalFootprintProps>(({ planet }, ref) => {
  const metrics = planet.impactMetrics;
  const paths = planet.learningPaths;

  if ((!metrics || metrics.length === 0) && (!paths || paths.length === 0)) return null;

  return (
    <div className="space-y-5">
      {/* Command Center */}
      {metrics && metrics.length > 0 && (
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Impact Command Center
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => {
              const Icon = ICON_MAP[metric.icon] || Globe;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-secondary/50 border border-border text-center"
                >
                  <Icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-foreground">{metric.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {metric.sublabel}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Learning Paths */}
      {paths && paths.length > 0 && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Learning Paths
            </span>
          </div>
          <div className="space-y-3">
            {paths.map((path, i) => (
              <div key={path.level} className="relative pl-4">
                {i < paths.length - 1 && (
                  <div className="absolute left-[5px] top-5 bottom-0 w-px bg-border" />
                )}
                <div className="absolute left-0 top-1.5 w-[10px] h-[10px] rounded-full border-2 border-primary bg-background" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">{path.title}</span>
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-primary/20 text-primary font-medium">
                      {path.level}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {path.topics.map((topic) => (
                      <span key={topic} className="px-2 py-0.5 text-[10px] rounded bg-secondary text-muted-foreground">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
InstructionalFootprint.displayName = "InstructionalFootprint";

export default InstructionalFootprint;
