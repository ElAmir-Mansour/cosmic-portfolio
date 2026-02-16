import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import PlanetModel from "./PlanetModel";
import CameraController from "./CameraController";
import type { Planet } from "@/services/DataService";

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

const GalaxyScene = ({ planets, onPlanetClick, selectedPlanet }: GalaxySceneProps) => {
  const [focusTarget, setFocusTarget] = useState<THREE.Vector3 | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!selectedPlanet) {
      setFocusTarget(null);
      setIsAnimating(false);
      if (controlsRef.current) controlsRef.current.enabled = true;
    }
  }, [selectedPlanet]);

  const handlePlanetClick = useCallback(
    (planet: Planet, position: THREE.Vector3) => {
      setFocusTarget(position);
      setIsAnimating(true);
      if (controlsRef.current) controlsRef.current.enabled = false;
      onPlanetClick(planet);
    },
    [onPlanetClick]
  );

  const handleReset = useCallback(() => {
    setFocusTarget(null);
    setIsAnimating(false);
    if (controlsRef.current) controlsRef.current.enabled = true;
    onPlanetClick(null as any);
  }, [onPlanetClick]);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 12, 20], fov: 50 }}
        style={{ background: "#000000" }}
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
              onClick={(pos) => handlePlanetClick(planet, pos)}
            />
          ))}
          {/* Orbit rings */}
          {planets.map((planet) => (
            <mesh key={`orbit-${planet.id}`} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.orbitRadius - 0.02, planet.orbitRadius + 0.02, 128]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.06} side={2} />
            </mesh>
          ))}
          <CameraController target={focusTarget} />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={35}
            autoRotate={!isAnimating}
            autoRotateSpeed={0.3}
          />
          <EffectComposer>
            <Bloom
              luminanceThreshold={1.0}
              luminanceSmoothing={0.3}
              intensity={1.5}
              mipmapBlur
            />
            <Vignette offset={0.3} darkness={0.7} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      {isAnimating && (
        <button
          onClick={handleReset}
          className="absolute top-4 left-4 z-30 px-3 py-1.5 text-xs font-medium rounded-md glass text-foreground hover:bg-secondary/50 transition-colors"
        >
          ← Galaxy View
        </button>
      )}
    </div>
  );
};

export default GalaxyScene;
