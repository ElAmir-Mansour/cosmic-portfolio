import { useRef, useMemo, useState, Suspense, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { Smartphone, Code2, GraduationCap, Brain, Kanban, type LucideIcon } from "lucide-react";
import HolographicHUD from "./HolographicHUD";
import type { Planet } from "@/services/DataService";

const ICON_MAP: Record<string, LucideIcon> = {
  "smartphone": Smartphone,
  "code-2": Code2,
  "graduation-cap": GraduationCap,
  "brain": Brain,
  "kanban": Kanban,
};

interface PlanetModelProps {
  planetId: string;
  planet: Planet;
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  onClick?: (groupRef: React.RefObject<THREE.Group>) => void;
  name: string;
  icon?: string;
  modelPath?: string;
  glowIntensity?: number;
  emissiveColor?: string;
  eccentricity?: number;
  axialTilt?: number;
  onRegisterRef?: (planetId: string, ref: React.RefObject<THREE.Group>) => void;
  onHover?: (planetId: string | null) => void;
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

const PlanetModel = ({
  planetId, planet, color, size, orbitRadius, orbitSpeed, onClick, name, icon, modelPath,
  glowIntensity = 1.5, emissiveColor, eccentricity = 0, axialTilt = 0,
  onRegisterRef, onHover,
}: PlanetModelProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const IconComponent = icon ? ICON_MAP[icon] : null;

  const tiltRad = useMemo(() => (axialTilt * Math.PI) / 180, [axialTilt]);
  const semiMinor = useMemo(() => orbitRadius * Math.sqrt(1 - eccentricity * eccentricity), [orbitRadius, eccentricity]);

  // Register ref for constellation lines
  useEffect(() => {
    onRegisterRef?.(planetId, groupRef as React.RefObject<THREE.Group>);
  }, [planetId, onRegisterRef]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * orbitSpeed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t) * orbitRadius;
      groupRef.current.position.z = Math.sin(t) * semiMinor;
      groupRef.current.position.y = Math.sin(t) * Math.sin(tiltRad) * orbitRadius * 0.1;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z = tiltRad;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (groupRef.current) onClick?.(groupRef as React.RefObject<THREE.Group>);
  };

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            setHovered(true);
            onHover?.(planetId);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
            setHovered(false);
            onHover?.(null);
          }}
        >
          {modelPath ? (
            <Suspense fallback={<SphereFallback color={color} size={size} glowIntensity={glowIntensity} emissiveColor={emissiveColor} />}>
              <GLTFModel path={modelPath} size={size} />
            </Suspense>
          ) : (
            <SphereFallback color={color} size={size} glowIntensity={glowIntensity} emissiveColor={emissiveColor} />
          )}
        </mesh>
        <Atmosphere color={emissiveColor || color} size={size} />
      </Float>
      {/* Outer glow */}
      <mesh scale={1.4}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} />
      </mesh>
      {/* Floating label + icon */}
      <Html
        position={[0, size + 0.6, 0]}
        center
        sprite
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div className="flex flex-col items-center gap-1 whitespace-nowrap">
          {IconComponent && (
            <div
              className="rounded-full p-1.5 backdrop-blur-sm"
              style={{
                background: `${color}22`,
                boxShadow: `0 0 12px ${color}66`,
                border: `1px solid ${color}44`,
              }}
            >
              <IconComponent size={14} color={color} strokeWidth={2.5} />
            </div>
          )}
          <span
            className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full backdrop-blur-sm"
            style={{
              color,
              background: `${color}15`,
              textShadow: `0 0 8px ${color}88`,
              border: `1px solid ${color}33`,
            }}
          >
            {name}
          </span>
        </div>
      </Html>
      {/* Holographic HUD on hover */}
      <HolographicHUD planet={planet} visible={hovered} size={size} />
    </group>
  );
};

export default PlanetModel;
