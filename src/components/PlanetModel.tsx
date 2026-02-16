import { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";

interface PlanetModelProps {
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  onClick?: (position: THREE.Vector3) => void;
  name: string;
  modelPath?: string;
  glowIntensity?: number;
  emissiveColor?: string;
}

const GLTFModel = ({ path, size }: { path: string; size: number }) => {
  const { scene } = useGLTF(path);
  const cloned = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const maxDim = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
    const scale = (size * 2) / maxDim;
    s.scale.setScalar(scale);
    return s;
  }, [scene, size]);
  return <primitive object={cloned} />;
};

const SphereFallback = ({ color, size, glowIntensity = 1.5, emissiveColor }: { color: string; size: number; glowIntensity?: number; emissiveColor?: string }) => {
  const emissive = useMemo(() => new THREE.Color(emissiveColor || color), [emissiveColor, color]);
  return (
    <>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={glowIntensity}
        toneMapped={false}
        roughness={0.3}
        metalness={0.7}
      />
    </>
  );
};

/* Atmosphere rim-light shell using a simple transparent gradient approach */
const Atmosphere = ({ color, size }: { color: string; size: number }) => {
  const atmosphereColor = useMemo(() => new THREE.Color(color), [color]);
  return (
    <mesh scale={1.25}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial
        color={atmosphereColor}
        transparent
        opacity={0.12}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};

const PlanetModel = ({ color, size, orbitRadius, orbitSpeed, onClick, name, modelPath, glowIntensity = 1.5, emissiveColor }: PlanetModelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * orbitSpeed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t) * orbitRadius;
      groupRef.current.position.z = Math.sin(t) * orbitRadius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (groupRef.current) onClick?.(groupRef.current.position.clone());
  };

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          {modelPath ? (
            <Suspense fallback={<SphereFallback color={color} size={size} glowIntensity={glowIntensity} emissiveColor={emissiveColor} />}>
              <GLTFModel path={modelPath} size={size} />
            </Suspense>
          ) : (
            <SphereFallback color={color} size={size} glowIntensity={glowIntensity} emissiveColor={emissiveColor} />
          )}
        </mesh>

        {/* Atmosphere rim-light */}
        <Atmosphere color={emissiveColor || color} size={size} />
      </Float>

      {/* Outer glow */}
      <mesh scale={1.4}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} />
      </mesh>
    </group>
  );
};

export default PlanetModel;
