import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PlanetMoonsProps {
  count: number;
  planetSize: number;
  color: string;
}

const PlanetMoons = ({ count, planetSize, color }: PlanetMoonsProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const moonColor = new THREE.Color(color);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((moon, i) => {
      const speed = 0.8 + i * 0.3;
      const radius = planetSize * (1.8 + i * 0.5);
      const t = clock.getElapsedTime() * speed + i * ((Math.PI * 2) / count);
      moon.position.x = Math.cos(t) * radius;
      moon.position.z = Math.sin(t) * radius;
      moon.position.y = Math.sin(t * 0.5) * planetSize * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[planetSize * 0.12, 12, 12]} />
          <meshStandardMaterial
            color={moonColor}
            emissive={moonColor}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};

export default PlanetMoons;
