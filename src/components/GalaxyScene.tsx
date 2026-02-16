import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import PlanetModel from "./PlanetModel";
import type { Planet } from "@/services/DataService";

interface GalaxySceneProps {
  planets: Planet[];
  onPlanetClick: (planet: Planet) => void;
}

const Sun = () => (
  <mesh>
    <sphereGeometry args={[1.2, 64, 64]} />
    <meshBasicMaterial color="#fbbf24" />
    <pointLight color="#fbbf24" intensity={2} distance={50} />
  </mesh>
);

const GalaxyScene = ({ planets, onPlanetClick }: GalaxySceneProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 12, 20], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} />
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
              onClick={() => onPlanetClick(planet)}
            />
          ))}
          {/* Orbit rings */}
          {planets.map((planet) => (
            <mesh key={`orbit-${planet.id}`} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.orbitRadius - 0.02, planet.orbitRadius + 0.02, 128]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.06} side={2} />
            </mesh>
          ))}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={8}
            maxDistance={35}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GalaxyScene;
