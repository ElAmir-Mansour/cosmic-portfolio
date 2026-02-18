import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Code, Brain, GraduationCap } from "lucide-react";

export interface StatItem {
  icon: string;
  value: number;
  suffix: string;
  label: string;
}

interface AboutSectionProps {
  about?: string;
  stats?: StatItem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  shield: Shield,
  brain: Brain,
  "graduation-cap": GraduationCap,
};

const defaultStats: StatItem[] = [
  { icon: "code", value: 10, suffix: "+", label: "Years Engineering" },
  { icon: "shield", value: 8, suffix: "+", label: "Years Military Service" },
  { icon: "brain", value: 3, suffix: "", label: "Research Publications" },
  { icon: "graduation-cap", value: 12, suffix: "", label: "Courses Published" },
];

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const AboutSection = ({ about, stats: propStats }: AboutSectionProps) => {
  const resolvedStats = propStats ?? defaultStats;
  const defaultAbout =
    "A software engineer and NLP researcher with over a decade of experience building production systems across iOS, full-stack web, and machine learning. Shaped by years of military service that instilled discipline, leadership, and a mission-first mindset. Currently focused on applying transformer models to detect early signs of depression from language — research that sits at the intersection of AI and mental health.";

  return (
    <section role="region" aria-label="About" className="relative z-10 py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-4">About Me</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {about || defaultAbout}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {resolvedStats.map((stat, i) => {
            const IconComp = iconMap[stat.icon] || Code;
            return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-xl p-5 text-center"
            >
              <IconComp className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
