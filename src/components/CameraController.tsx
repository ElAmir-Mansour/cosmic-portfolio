import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraControllerProps {
  targetRef: React.RefObject<THREE.Group> | null;
  onArrived?: () => void;
}

const DEFAULT_POS = new THREE.Vector3(0, 12, 20);
const DEFAULT_LOOK = new THREE.Vector3(0, 0, 0);
const LERP_SPEED = 0.03;
const ARRIVE_THRESHOLD = 0.3;

const CameraController = ({ targetRef, onArrived }: CameraControllerProps) => {
  const { camera } = useThree();
  const arrived = useRef(false);
  const lookTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    if (targetRef?.current) {
      const planetPos = targetRef.current.position;
      const goalPos = planetPos.clone().add(new THREE.Vector3(2, 1.5, 4));
      camera.position.lerp(goalPos, LERP_SPEED);
      lookTarget.current.lerp(planetPos, LERP_SPEED);
      camera.lookAt(lookTarget.current);

      if (!arrived.current && camera.position.distanceTo(goalPos) < ARRIVE_THRESHOLD) {
        arrived.current = true;
        onArrived?.();
      }
    } else {
      arrived.current = false;
      camera.position.lerp(DEFAULT_POS, LERP_SPEED);
      lookTarget.current.lerp(DEFAULT_LOOK, LERP_SPEED);
      camera.lookAt(lookTarget.current);
    }
  });

  return null;
};

export default CameraController;
