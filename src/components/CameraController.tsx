import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraControllerProps {
  targetRef: React.RefObject<THREE.Group> | null;
  targetSize?: number;
  onArrived?: () => void;
  onSurfaceReached?: () => void;
}

const DEFAULT_POS = new THREE.Vector3(0, 12, 20);
const DEFAULT_LOOK = new THREE.Vector3(0, 0, 0);
const ARRIVE_THRESHOLD = 0.3;

type Phase = "idle" | "zooming" | "surface" | "orbit" | "returning";

const CameraController = ({ targetRef, targetSize = 0.5, onArrived, onSurfaceReached }: CameraControllerProps) => {
  const { camera } = useThree();
  const phase = useRef<Phase>("idle");
  const surfaceTimer = useRef(0);
  const lookTarget = useRef(new THREE.Vector3());
  const prevTarget = useRef<React.RefObject<THREE.Group> | null>(null);

  useFrame((_, delta) => {
    // Detect target change
    if (targetRef !== prevTarget.current) {
      prevTarget.current = targetRef;
      if (targetRef?.current) {
        phase.current = "zooming";
        surfaceTimer.current = 0;
      } else {
        phase.current = "returning";
      }
    }

    if (targetRef?.current) {
      const planetPos = targetRef.current.position;

      if (phase.current === "zooming") {
        // Phase 1: Dramatic close zoom to planet surface
        const surfaceOffset = targetSize * 2.5;
        const surfaceGoal = planetPos.clone().add(new THREE.Vector3(surfaceOffset, surfaceOffset * 0.3, surfaceOffset));
        camera.position.lerp(surfaceGoal, 0.06);
        lookTarget.current.lerp(planetPos, 0.06);
        camera.lookAt(lookTarget.current);

        if (camera.position.distanceTo(surfaceGoal) < 0.2) {
          phase.current = "surface";
          surfaceTimer.current = 0;
          onSurfaceReached?.();
        }
      } else if (phase.current === "surface") {
        // Phase 2: Hold on surface briefly with slow drift
        lookTarget.current.lerp(planetPos, 0.1);
        camera.lookAt(lookTarget.current);
        // Gentle drift around the planet
        const angle = surfaceTimer.current * 0.3;
        const surfaceOffset = targetSize * 2.5;
        const driftGoal = planetPos.clone().add(
          new THREE.Vector3(
            Math.cos(angle) * surfaceOffset,
            surfaceOffset * 0.3,
            Math.sin(angle) * surfaceOffset
          )
        );
        camera.position.lerp(driftGoal, 0.03);
        surfaceTimer.current += delta;

        if (surfaceTimer.current > 0.8) {
          phase.current = "orbit";
          onArrived?.();
        }
      } else if (phase.current === "orbit") {
        // Phase 3: Pull back to normal orbit view
        const goalPos = planetPos.clone().add(new THREE.Vector3(2, 1.5, 4));
        camera.position.lerp(goalPos, 0.04);
        lookTarget.current.lerp(planetPos, 0.04);
        camera.lookAt(lookTarget.current);
      }
    } else {
      phase.current = "idle";
      camera.position.lerp(DEFAULT_POS, 0.03);
      lookTarget.current.lerp(DEFAULT_LOOK, 0.03);
      camera.lookAt(lookTarget.current);
    }
  });

  return null;
};

export default CameraController;
