import { useState, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import Starfield from "@/components/Starfield";
import PlanetDrawer from "@/components/PlanetDrawer";
import StarMap from "@/components/StarMap";
import ContactSection from "@/components/ContactSection";
import SpatialAudio from "@/components/SpatialAudio";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAllContent, type Planet, type ContentData } from "@/services/DataService";
import { Volume2, VolumeX } from "lucide-react";

const GalaxyScene = lazy(() => import("@/components/GalaxyScene"));

const GalaxyLoader = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-muted-foreground animate-pulse">Loading Galaxy…</p>
  </div>
);

const Index = () => {
  const [content, setContent] = useState<ContentData | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);
  const galaxyOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);

  useEffect(() => {
    getAllContent().then(setContent).catch(console.error);
  }, []);

  // Compute highlighted planets based on selected planet's shared technologies
  const highlightedPlanets = useMemo(() => {
    if (!selectedPlanet || !content) return undefined;
    const selectedTags = new Set([
      ...selectedPlanet.skills,
      ...selectedPlanet.projects.flatMap((p) => p.tags),
    ]);
    const highlighted = new Set<string>([selectedPlanet.id]);
    content.planets.forEach((p) => {
      if (p.id === selectedPlanet.id) return;
      const tags = [...p.skills, ...p.projects.flatMap((pr) => pr.tags)];
      if (tags.some((t) => selectedTags.has(t))) highlighted.add(p.id);
    });
    return highlighted.size > 1 ? highlighted : undefined;
  }, [selectedPlanet, content]);

  const handlePlanetHover = useCallback((planetId: string | null) => {
    setHoveredPlanetId(planetId);
  }, []);

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Starfield />
      <Navbar />
      <SpatialAudio enabled={audioEnabled} />

      {/* Hero Section */}
      <div ref={containerRef} className="relative" style={{ height: isMobile ? "auto" : "200vh" }}>
        <motion.section
          style={isMobile ? {} : { opacity: heroOpacity, scale: heroScale }}
          className="sticky top-0 flex items-center justify-center min-h-screen z-10 px-6"
        >
          <div className="text-center max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-sm uppercase tracking-[0.3em] text-primary mb-4"
            >
              NLP Researcher · Software Engineer · Instructional Designer
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight"
            >
              {content.profile.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed"
            >
              Researching how transformer models can detect early signs of depression from language.
              Building the software, courses, and tools that turn complex ideas into real impact.
              Shaped by 10+ years of engineering and leadership forged through military service.
            </motion.p>
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-12 text-xs text-muted-foreground animate-float"
              >
                Scroll to explore the galaxy ↓
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Galaxy (Desktop only) */}
        {!isMobile && (
          <motion.div
            style={{ opacity: galaxyOpacity }}
            className="sticky top-0 h-screen z-20"
            id="explore"
          >
            <Suspense fallback={<GalaxyLoader />}>
              <GalaxyScene
                planets={content.planets}
                onPlanetClick={setSelectedPlanet}
                selectedPlanet={selectedPlanet}
                highlightedPlanets={highlightedPlanets}
                onPlanetHover={handlePlanetHover}
              />
            </Suspense>
          </motion.div>
        )}
      </div>

      {/* Mobile: 2D Star Map */}
      {isMobile && (
        <div id="explore">
          <StarMap planets={content.planets} />
        </div>
      )}

      {/* Contact */}
      <ContactSection profile={content.profile} />

      {/* Planet Drawer */}
      <PlanetDrawer planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />

      {/* Audio Toggle */}
      <button
        onClick={() => setAudioEnabled((prev) => !prev)}
        className="fixed bottom-4 left-4 z-30 p-2 rounded-md glass text-muted-foreground hover:text-foreground transition-colors"
        title={audioEnabled ? "Mute ambient audio" : "Enable ambient audio"}
      >
        {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default Index;
