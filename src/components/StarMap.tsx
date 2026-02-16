import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Planet } from "@/services/DataService";

interface StarMapProps {
  planets: Planet[];
}

const StarMap = ({ planets }: StarMapProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">Star Map</h2>
        <p className="text-sm text-muted-foreground text-center mb-10">Tap a category to explore.</p>
        <div className="space-y-4">
          {planets.map((planet) => {
            const isOpen = expanded === planet.id;
            return (
              <motion.div
                key={planet.id}
                layout
                className="rounded-xl border border-border overflow-hidden"
                style={{
                  boxShadow: isOpen ? `0 0 20px ${planet.color}22` : undefined,
                }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : planet.id)}
                  className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-secondary/40"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: planet.color, boxShadow: `0 0 10px ${planet.color}` }}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-foreground">{planet.name}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{planet.skills.slice(0, 3).join(" · ")}</span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="text-muted-foreground text-lg"
                  >
                    ▾
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-sm text-muted-foreground mb-4">{planet.description}</p>
                        <div className="space-y-3">
                          {planet.projects.map((project) => (
                            <a
                              key={project.id}
                              href={project.link}
                              className="block p-3 rounded-lg bg-secondary/30 border border-border transition-colors hover:border-primary/30"
                            >
                              <h4 className="text-sm font-medium text-foreground">{project.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.tags.map((tag) => (
                                  <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded bg-background text-muted-foreground">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StarMap;
