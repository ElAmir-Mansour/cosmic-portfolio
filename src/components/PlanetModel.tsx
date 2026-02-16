import { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface PlanetModelProps {
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  onClick?: (position: THREE.Vector3) => void;
  name: string;
  modelPath?: string;
}

const GLTFModel = ({ path, size }: { path: string; size: number }) => {
  const { scene } = useGLTF(path);
  const cloned = useMemo(() => {
    const s = scene.clone(true);
    // Normalize scale to fit the planet size
    const box = new THREE.Box3().setFromObject(s);
    const maxDim = Math.max(
      box.max.x - box.min.x,
      box.max.y - box.min.y,
      box.max.z - box.min.z
    );
    const scale = (size * 2) / maxDim;
    s.scale.setScalar(scale);
    return s;
  }, [scene, size]);

  return <primitive object={cloned} />;
};

const SphereFallback = ({ color, size }: { color: string; size: number }) => {
  const emissiveColor = useMemo(() => new THREE.Color(color), [color]);
  return (
    <>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={1.5}
        toneMapped={false}
        roughness={0.3}
        metalness={0.7}
      />
    </>
  );
};

const PlanetModel = ({ color, size, orbitRadius, orbitSpeed, onClick, name, modelPath }: PlanetModelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

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
    if (groupRef.current) {
      onClick?.(groupRef.current.position.clone());
    }
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {modelPath ? (
          <Suspense fallback={<SphereFallback color={color} size={size} />}>
            <GLTFModel path={modelPath} size={size} />
          </Suspense>
        ) : (
          <SphereFallback color={color} size={size} />
        )}
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} scale={1.3}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
};

export default PlanetModel;
