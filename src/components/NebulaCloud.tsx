import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NEBULA_CONFIGS = [
  { position: [30, -10, -40] as const, color: "#8B5CF6", scale: 25 },
  { position: [-35, 15, -50] as const, color: "#007AFF", scale: 30 },
  { position: [15, 20, -60] as const, color: "#10B981", scale: 20 },
];

const NebulaBlob = ({ position, color, scale }: { position: readonly [number, number, number]; color: string; scale: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotSpeed = useMemo(() => 0.01 + Math.random() * 0.01, []);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotSpeed * 0.3;
      meshRef.current.rotation.y += rotSpeed;
    }
  });

  return (
    <mesh ref={meshRef} position={[position[0], position[1], position[2]]} scale={scale}>
      <icosahedronGeometry args={[1, 3]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.04}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const NebulaCloud = () => (
  <>
    {NEBULA_CONFIGS.map((cfg, i) => (
      <NebulaBlob key={i} {...cfg} />
    ))}
  </>
);

export default NebulaCloud;
