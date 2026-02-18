import { Suspense, useState, useCallback, useRef, useEffect, createContext, useContext } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useProgress } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import PlanetModel from "./PlanetModel";
import CameraController from "./CameraController";
import ConstellationLines from "./ConstellationLines";
import NebulaCloud from "./NebulaCloud";
import type { Planet } from "@/services/DataService";

type PerfTier = "high" | "medium" | "low";
const PerfContext = createContext<PerfTier>("high");

interface GalaxySceneProps {
  planets: Planet[];
  onPlanetClick: (planet: Planet) => void;
  selectedPlanet: Planet | null;
  highlightedPlanets?: Set<string>;
  onPlanetHover?: (planetId: string | null) => void;
}

const Sun = () => (
  <mesh>
    <sphereGeometry args={[1.2, 64, 64]} />
    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} toneMapped={false} />
    <pointLight color="#fbbf24" intensity={2} distance={50} />
  </mesh>
);

const FPSMonitor = ({ onTierChange }: { onTierChange: (tier: PerfTier) => void }) => {
  const frames = useRef(0);
  const lastTime = useRef(performance.now());
  const stableCount = useRef(0);
  const currentTier = useRef<PerfTier>("high");

  useFrame(() => {
    frames.current++;
    const now = performance.now();
    const delta = now - lastTime.current;
    if (delta >= 2000) {
      const fps = (frames.current / delta) * 1000;
      frames.current = 0;
      lastTime.current = now;
      let newTier: PerfTier = "high";
      if (fps < 20) newTier = "low";
      else if (fps < 40) newTier = "medium";
      if (newTier !== currentTier.current) {
        stableCount.current++;
        if (stableCount.current >= 2) {
          currentTier.current = newTier;
          onTierChange(newTier);
          stableCount.current = 0;
        }
      } else {
        stableCount.current = 0;
      }
    }
  });
  return null;
};

const DPRController = () => {
  const tier = useContext(PerfContext);
  const { gl } = useThree();
  useEffect(() => {
    const dpr = tier === "high" ? Math.min(window.devicePixelRatio, 2) : tier === "medium" ? 1.5 : 1;
    gl.setPixelRatio(dpr);
  }, [tier, gl]);
  return null;
};

const PostEffects = () => {
  const tier = useContext(PerfContext);
  if (tier === "low") return null;
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.3} intensity={tier === "high" ? 1.5 : 0.8} mipmapBlur />
      <Vignette offset={0.3} darkness={tier === "high" ? 0.7 : 0.4} />
    </EffectComposer>
  );
};

const LoadingBar = () => {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (!active && progress === 0) {
      let p = 0;
      const interval = setInterval(() => {
        p += 15;
        setDisplayProgress(Math.min(p, 100));
        if (p >= 100) { clearInterval(interval); setTimeout(() => setVisible(false), 300); }
      }, 80);
      return () => clearInterval(interval);
    }
    setDisplayProgress(progress);
    if (!active && progress >= 100) setTimeout(() => setVisible(false), 300);
  }, [progress, active]);

  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="w-48 h-1 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${displayProgress}%` }} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground font-mono">{Math.round(displayProgress)}%</p>
    </div>
  );
};

const TIER_LABELS: Record<PerfTier, string> = { high: "✦ High", medium: "◈ Medium", low: "⚡ Low" };
const STAR_COUNTS: Record<PerfTier, number> = { high: 3000, medium: 1500, low: 500 };
const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];

const GalaxyScene = ({ planets, onPlanetClick, selectedPlanet, highlightedPlanets, onPlanetHover }: GalaxySceneProps) => {
  const [followRef, setFollowRef] = useState<React.RefObject<THREE.Group> | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [perfTier, setPerfTier] = useState<PerfTier>("high");
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const controlsRef = useRef<any>(null);
  const planetRefsMap = useRef<Map<string, React.RefObject<THREE.Group>>>(new Map());

  useEffect(() => {
    if (!selectedPlanet) {
      setFollowRef(null);
      setIsAnimating(false);
      if (controlsRef.current) controlsRef.current.enabled = true;
    }
  }, [selectedPlanet]);

  const handlePlanetClick = useCallback(
    (planet: Planet, groupRef: React.RefObject<THREE.Group>) => {
      setFollowRef(groupRef);
      setIsAnimating(true);
      if (controlsRef.current) controlsRef.current.enabled = false;
      onPlanetClick(planet);
    },
    [onPlanetClick]
  );

  const handleReset = useCallback(() => {
    setFollowRef(null);
    setIsAnimating(false);
    if (controlsRef.current) controlsRef.current.enabled = true;
    onPlanetClick(null as any);
  }, [onPlanetClick]);

  const cycleTier = useCallback(() => {
    setPerfTier((prev) => prev === "high" ? "medium" : prev === "medium" ? "low" : "high");
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedMultiplier((prev) => {
      const idx = SPEED_OPTIONS.indexOf(prev);
      return SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    });
  }, []);

  const registerPlanetRef = useCallback((planetId: string, ref: React.RefObject<THREE.Group>) => {
    planetRefsMap.current.set(planetId, ref);
  }, []);

  const starCount = STAR_COUNTS[perfTier];

  return (
    <PerfContext.Provider value={perfTier}>
      <div className="w-full h-full relative">
        <Canvas camera={{ position: [0, 12, 20], fov: 50 }} style={{ background: "hsl(230, 25%, 4%)" }}>
          <Suspense fallback={null}>
            <FPSMonitor onTierChange={setPerfTier} />
            <DPRController />
            <ambientLight intensity={0.1} />
            <Stars radius={100} depth={60} count={starCount} factor={3} saturation={0} fade speed={0.5} />
            <Sun />
            {perfTier !== "low" && <NebulaCloud />}
            {planets.map((planet) => (
              <PlanetModel
                key={planet.id}
                planetId={planet.id}
                planet={planet}
                color={planet.color}
                size={planet.size}
                orbitRadius={planet.orbitRadius}
                orbitSpeed={planet.orbitSpeed}
                name={planet.name}
                icon={planet.icon}
                modelPath={planet.modelPath}
                glowIntensity={planet.glowIntensity}
                emissiveColor={planet.emissiveColor}
                eccentricity={planet.eccentricity}
                axialTilt={planet.axialTilt}
                onClick={(ref) => handlePlanetClick(planet, ref)}
                onRegisterRef={registerPlanetRef}
                onHover={onPlanetHover}
                speedMultiplier={speedMultiplier}
              />
            ))}
            <ConstellationLines planets={planets} planetRefs={planetRefsMap.current} highlightedPlanets={highlightedPlanets} />
            {planets.map((planet) => {
              const ecc = planet.eccentricity || 0;
              const semiMinor = planet.orbitRadius * Math.sqrt(1 - ecc * ecc);
              return (
                <mesh key={`orbit-${planet.id}`} rotation={[-Math.PI / 2, 0, 0]} scale={[1, semiMinor / planet.orbitRadius, 1]}>
                  <ringGeometry args={[planet.orbitRadius - 0.02, planet.orbitRadius + 0.02, 128]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.06} side={2} />
                </mesh>
              );
            })}
            <CameraController targetRef={followRef} targetSize={selectedPlanet?.size} />
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableZoom={true}
              minDistance={8}
              maxDistance={35}
              autoRotate={!isAnimating}
              autoRotateSpeed={0.3}
            />
            <PostEffects />
          </Suspense>
        </Canvas>
        <LoadingBar />
        {isAnimating && (
          <button
            onClick={handleReset}
            className="absolute top-4 left-4 z-30 px-3 py-1.5 text-xs font-medium rounded-md glass text-foreground hover:bg-secondary/50 transition-colors"
          >
            ← Galaxy View
          </button>
        )}
        {/* Orbit Speed Control */}
        <button
          onClick={cycleSpeed}
          className="absolute bottom-4 left-4 z-30 px-3 py-1.5 text-xs font-medium rounded-md glass text-muted-foreground hover:text-foreground transition-colors"
          title={`Speed: ${speedMultiplier}x`}
        >
          ⏱ {speedMultiplier}x
        </button>
        {/* Performance Tier Toggle */}
        <button
          onClick={cycleTier}
          className="absolute bottom-4 right-4 z-30 px-3 py-1.5 text-xs font-medium rounded-md glass text-muted-foreground hover:text-foreground transition-colors"
          title={`Performance: ${perfTier}`}
        >
          {TIER_LABELS[perfTier]}
        </button>
      </div>
    </PerfContext.Provider>
  );
};

export default GalaxyScene;
