import { motion } from "framer-motion";
import type { Planet } from "@/services/DataService";

interface StarMapProps {
  planets: Planet[];
  onPlanetClick?: (planet: Planet) => void;
}

const StarMap = ({ planets, onPlanetClick }: StarMapProps) => {
  return (
    <section className="relative z-10 py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">Star Map</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">Tap a category to explore.</p>
        </motion.div>
        <div className="space-y-4">
          {planets.map((planet, i) => (
            <motion.button
              key={planet.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => onPlanetClick?.(planet)}
              className="w-full flex items-center gap-4 p-5 rounded-xl border border-border text-left transition-all hover:bg-secondary/40 hover:border-primary/30"
              style={{
                boxShadow: `0 0 15px ${planet.color}11`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: planet.color, boxShadow: `0 0 10px ${planet.color}` }}
              />
              <div className="flex-1">
                <span className="font-medium text-foreground">{planet.name}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  {planet.skills.slice(0, 3).join(" · ")}
                </span>
              </div>
              <span className="text-muted-foreground text-sm">→</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StarMap;
