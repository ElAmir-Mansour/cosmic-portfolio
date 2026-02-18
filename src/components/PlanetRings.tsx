import { useMemo } from "react";
import * as THREE from "three";

interface PlanetRingsProps {
  size: number;
  color: string;
  axialTilt?: number;
}

const PlanetRings = ({ size, color, axialTilt = 0 }: PlanetRingsProps) => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, `${color}00`);
    grad.addColorStop(0.3, `${color}88`);
    grad.addColorStop(0.5, `${color}cc`);
    grad.addColorStop(0.7, `${color}88`);
    grad.addColorStop(1, `${color}00`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [color]);

  const tiltRad = (axialTilt * Math.PI) / 180;

  return (
    <mesh rotation={[-Math.PI / 2 + tiltRad * 0.3, 0, 0]}>
      <ringGeometry args={[size * 1.5, size * 2.2, 64]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

export default PlanetRings;
