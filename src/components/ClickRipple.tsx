import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ClickRippleProps {
  color: string;
  size: number;
  trigger: number; // increment to trigger
}

const ClickRipple = ({ color, size, trigger }: ClickRippleProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(false);
  const startTime = useRef(0);
  const lastTrigger = useRef(0);

  useFrame(({ clock }) => {
    if (trigger !== lastTrigger.current && trigger > 0) {
      lastTrigger.current = trigger;
      setActive(true);
      startTime.current = clock.getElapsedTime();
    }

    if (!active || !meshRef.current) return;

    const elapsed = clock.getElapsedTime() - startTime.current;
    const duration = 0.8;
    const progress = elapsed / duration;

    if (progress >= 1) {
      setActive(false);
      meshRef.current.scale.setScalar(1);
      return;
    }

    const scale = 1 + progress * 3;
    meshRef.current.scale.setScalar(scale);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.6;
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[size * 0.9, size * 1.1, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export default ClickRipple;
