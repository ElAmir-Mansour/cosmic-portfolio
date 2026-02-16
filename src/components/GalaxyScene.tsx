import { Suspense, useState, useCallback, useRef, useEffect, createContext, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, useProgress } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import PlanetModel from "./PlanetModel";
import CameraController from "./CameraController";
import type { Planet } from "@/services/DataService";

// Low power context
const LowPowerContext = createContext(false);
export const useLowPower = () => useContext(LowPowerContext);

interface GalaxySceneProps {
  planets: Planet[];
  onPlanetClick: (planet: Planet) => void;
  selectedPlanet: Planet | null;
}

const Sun = () => (
  <mesh>
    <sphereGeometry args={[1.2, 64, 64]} />
    <meshStandardMaterial
      color="#fbbf24"
      emissive="#fbbf24"
      emissiveIntensity={2}
      toneMapped={false}
    />
    <pointLight color="#fbbf24" intensity={2} distance={50} />
  </mesh>
);

const PostEffects = () => {
  const lowPower = useContext(LowPowerContext);
  if (lowPower) return null;
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.3} intensity={1.5} mipmapBlur />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  );
};

const LoadingBar = () => {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    // If no assets to load, simulate a quick ramp-up then hide
    if (!active && progress === 0) {
      let p = 0;
      const interval = setInterval(() => {
        p += 15;
        setDisplayProgress(Math.min(p, 100));
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setVisible(false), 300);
        }
      }, 80);
      return () => clearInterval(interval);
    }
    // Real asset loading
    setDisplayProgress(progress);
    if (!active && progress >= 100) {
      setTimeout(() => setVisible(false), 300);
    }
  }, [progress, active]);

  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="w-48 h-1 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground font-mono">{Math.round(displayProgress)}%</p>
    </div>
  );
};

const GalaxyScene = ({ planets, onPlanetClick, selectedPlanet }: GalaxySceneProps) => {
  const [followRef, setFollowRef] = useState<React.RefObject<THREE.Group> | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const controlsRef = useRef<any>(null);

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

  return (
    <LowPowerContext.Provider value={lowPower}>
      <div className="w-full h-full relative">
        <Canvas
          camera={{ position: [0, 12, 20], fov: 50 }}
          style={{ background: "hsl(230, 25%, 4%)" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.1} />
            <Stars radius={100} depth={60} count={3000} factor={3} saturation={0} fade speed={0.5} />
            <Sun />
            {planets.map((planet) => (
              <PlanetModel
                key={planet.id}
                color={planet.color}
                size={planet.size}
                orbitRadius={planet.orbitRadius}
                orbitSpeed={planet.orbitSpeed}
                name={planet.name}
                modelPath={planet.modelPath}
                glowIntensity={planet.glowIntensity}
                emissiveColor={planet.emissiveColor}
                onClick={(ref) => handlePlanetClick(planet, ref)}
              />
            ))}
            {/* Orbit rings */}
            {planets.map((planet) => (
              <mesh key={`orbit-${planet.id}`} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[planet.orbitRadius - 0.02, planet.orbitRadius + 0.02, 128]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.06} side={2} />
              </mesh>
            ))}
            <CameraController targetRef={followRef} />
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
        {/* Low Power Toggle */}
        <button
          onClick={() => setLowPower(!lowPower)}
          className="absolute bottom-4 right-4 z-30 px-3 py-1.5 text-xs font-medium rounded-md glass text-muted-foreground hover:text-foreground transition-colors"
          title={lowPower ? "Effects off" : "Effects on"}
        >
          {lowPower ? "⚡ Low Power" : "✦ Full FX"}
        </button>
      </div>
    </LowPowerContext.Provider>
  );
};

export default GalaxyScene;
