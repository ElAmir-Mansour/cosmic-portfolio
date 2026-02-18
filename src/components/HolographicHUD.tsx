import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import type { Planet } from "@/services/DataService";

interface HolographicHUDProps {
  planet: Planet;
  visible: boolean;
  size: number;
}

const HolographicHUD = ({ planet, visible, size }: HolographicHUDProps) => {
  const skillCount = planet.skills.length;
  const projectCount = planet.projects.length;

  return (
    <Html
      position={[size + 1.2, 0.5, 0]}
      center
      sprite
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.7, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative"
            style={{ width: 180 }}
          >
            {/* Connector line */}
            <div
              className="absolute top-1/2 -left-6 w-6 h-px"
              style={{ background: `${planet.color}66` }}
            />
            <div
              className="absolute top-1/2 -left-7 w-2 h-2 rounded-full -translate-y-1/2"
              style={{ background: planet.color, boxShadow: `0 0 8px ${planet.color}` }}
            />

            {/* HUD Panel */}
            <div
              className="rounded-lg p-3 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${planet.color}12, ${planet.color}08)`,
                border: `1px solid ${planet.color}44`,
                boxShadow: `0 0 20px ${planet.color}22, inset 0 0 20px ${planet.color}08`,
              }}
            >
              {/* Scanline effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${planet.color}06 2px, ${planet.color}06 4px)`,
                }}
              />

              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: planet.color }} />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: planet.color }} />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: planet.color }} />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: planet.color }} />

              {/* Header */}
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: planet.color, boxShadow: `0 0 6px ${planet.color}` }}
                />
                <span
                  className="text-[9px] font-mono uppercase tracking-[0.2em]"
                  style={{ color: planet.color }}
                >
                  SYS.SCAN
                </span>
              </div>

              {/* Name */}
              <p
                className="text-[11px] font-semibold mb-2 relative z-10"
                style={{ color: planet.color, textShadow: `0 0 10px ${planet.color}66` }}
              >
                {planet.name}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 mb-2 relative z-10">
                <StatBlock label="SKILLS" value={skillCount} color={planet.color} />
                <StatBlock label="PROJECTS" value={projectCount} color={planet.color} />
              </div>

              {/* Skill bars */}
              <div className="space-y-1 relative z-10">
                {planet.skills.slice(0, 3).map((skill, i) => (
                  <div key={skill} className="flex items-center gap-1.5">
                    <span className="text-[8px] font-mono w-14 truncate" style={{ color: `${planet.color}cc` }}>
                      {skill}
                    </span>
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${planet.color}20` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${90 - i * 15}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${planet.color}88, ${planet.color})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-2 pt-1.5 border-t relative z-10" style={{ borderColor: `${planet.color}22` }}>
                <span className="text-[7px] font-mono" style={{ color: `${planet.color}88` }}>
                  ▸ CLICK TO EXPLORE
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Html>
  );
};

const StatBlock = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div
    className="rounded p-1.5 text-center"
    style={{ background: `${color}10`, border: `1px solid ${color}22` }}
  >
    <div className="text-[13px] font-bold font-mono" style={{ color, textShadow: `0 0 8px ${color}44` }}>
      {value}
    </div>
    <div className="text-[7px] font-mono uppercase tracking-wider" style={{ color: `${color}99` }}>
      {label}
    </div>
  </div>
);

export default HolographicHUD;
