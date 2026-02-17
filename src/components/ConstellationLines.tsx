import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Planet } from "@/services/DataService";

interface ConstellationLinesProps {
  planets: Planet[];
  planetRefs: Map<string, React.RefObject<THREE.Group>>;
  highlightedPlanets?: Set<string>;
}

interface Connection {
  from: string;
  to: string;
  sharedSkills: string[];
  strength: number; // 0-1 based on overlap
}

function computeConnections(planets: Planet[]): Connection[] {
  const connections: Connection[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i];
      const b = planets[j];
      const allTagsA = new Set([
        ...a.skills,
        ...a.projects.flatMap((p) => p.tags),
      ]);
      const allTagsB = new Set([
        ...b.skills,
        ...b.projects.flatMap((p) => p.tags),
      ]);
      const shared = [...allTagsA].filter((t) => allTagsB.has(t));
      if (shared.length > 0) {
        connections.push({
          from: a.id,
          to: b.id,
          sharedSkills: shared,
          strength: Math.min(shared.length / 4, 1),
        });
      }
    }
  }
  return connections;
}

const ConnectionLine = ({
  fromRef,
  toRef,
  strength,
  highlighted,
}: {
  fromRef: React.RefObject<THREE.Group>;
  toRef: React.RefObject<THREE.Group>;
  strength: number;
  highlighted: boolean;
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const positions = useMemo(() => new Float32Array(6), []);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        transparent: true,
        opacity: highlighted ? 0.5 * strength : 0.08 * strength,
        color: highlighted ? new THREE.Color("hsl(210, 100%, 56%)") : new THREE.Color("hsl(215, 20%, 55%)"),
        depthWrite: false,
      }),
    [highlighted, strength]
  );

  useFrame(() => {
    if (!fromRef.current || !toRef.current || !lineRef.current) return;
    const from = fromRef.current.position;
    const to = toRef.current.position;
    positions[0] = from.x;
    positions[1] = from.y;
    positions[2] = from.z;
    positions[3] = to.x;
    positions[4] = to.y;
    positions[5] = to.z;
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.attributes.position.needsUpdate = true;

    // Animate opacity for highlighted lines
    material.opacity = highlighted
      ? 0.3 + Math.sin(Date.now() * 0.003) * 0.2
      : 0.06 * strength;
  });

  return <primitive object={new THREE.Line(geometry, material)} ref={lineRef} />;
};

const ConstellationLines = ({
  planets,
  planetRefs,
  highlightedPlanets,
}: ConstellationLinesProps) => {
  const connections = useMemo(() => computeConnections(planets), [planets]);

  return (
    <group>
      {connections.map((conn) => {
        const fromRef = planetRefs.get(conn.from);
        const toRef = planetRefs.get(conn.to);
        if (!fromRef || !toRef) return null;
        const highlighted =
          highlightedPlanets?.has(conn.from) || highlightedPlanets?.has(conn.to) || false;
        return (
          <ConnectionLine
            key={`${conn.from}-${conn.to}`}
            fromRef={fromRef}
            toRef={toRef}
            strength={conn.strength}
            highlighted={highlighted}
          />
        );
      })}
    </group>
  );
};

export { computeConnections };
export default ConstellationLines;
