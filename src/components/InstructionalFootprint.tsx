import { motion } from "framer-motion";
import { GraduationCap, Youtube, Globe, TrendingUp } from "lucide-react";
import type { Planet } from "@/services/DataService";

interface LearningPath {
  level: string;
  title: string;
  topics: string[];
}

const LEARNING_PATHS: LearningPath[] = [
  {
    level: "Beginner",
    title: "Foundations of Software Engineering",
    topics: ["Programming Fundamentals", "Data Structures", "Version Control (Git)", "Basic Web Development"],
  },
  {
    level: "Intermediate",
    title: "Building Real Applications",
    topics: ["API Design", "Database Modeling", "Authentication Patterns", "Testing Strategies"],
  },
  {
    level: "Advanced",
    title: "Architecture and Scale",
    topics: ["System Design", "Microservices", "CI/CD Pipelines", "Performance Optimization"],
  },
];

const IMPACT_METRICS = [
  { icon: Youtube, label: "YouTube Reach", value: "15K+", sublabel: "Subscribers" },
  { icon: Globe, label: "Udemy Students", value: "3,200+", sublabel: "Enrolled" },
  { icon: GraduationCap, label: "Courses Published", value: "12", sublabel: "Active" },
  { icon: TrendingUp, label: "Completion Rate", value: "78%", sublabel: "Above Average" },
];

const InstructionalFootprint = ({ planet }: { planet: Planet }) => {
  return (
    <div className="space-y-5">
      {/* Command Center */}
      <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Impact Command Center
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {IMPACT_METRICS.map((metric) => {
            const Icon = metric.icon;
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

      {/* Learning Paths / Syllabi */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Learning Paths
          </span>
        </div>
        <div className="space-y-3">
          {LEARNING_PATHS.map((path, i) => (
            <div key={path.level} className="relative pl-4">
              {/* Vertical connector */}
              {i < LEARNING_PATHS.length - 1 && (
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
                    <span
                      key={topic}
                      className="px-2 py-0.5 text-[10px] rounded bg-secondary text-muted-foreground"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructionalFootprint;
