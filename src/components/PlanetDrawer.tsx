import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Planet } from "@/services/DataService";
import NLPSandbox from "./NLPSandbox";

interface PlanetDrawerProps {
  planet: Planet | null;
  onClose: () => void;
}

const PlanetDrawer = ({ planet, onClose }: PlanetDrawerProps) => {
  return (
    <AnimatePresence>
      {planet && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/40"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md glass overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: planet.color, boxShadow: `0 0 12px ${planet.color}` }}
                  />
                  <h2 className="text-xl font-semibold text-foreground">{planet.name}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-muted-foreground text-sm mb-6">{planet.description}</p>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {planet.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Projects</h3>
                <div className="space-y-4">
                  {planet.projects.map((project) => (
                    <a
                      key={project.id}
                      href={project.link}
                      className="block p-4 rounded-lg bg-secondary/50 border border-border transition-colors hover:border-primary/30"
                    >
                      <h4 className="font-medium text-foreground mb-1">{project.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded bg-background text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
              </div>

              {/* NLP Sandbox for NLP Research planet */}
              {planet.id === "nlp" && <NLPSandbox />}
            </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default PlanetDrawer;
