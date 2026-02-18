

# Elite 3D Planet Enhancements

## Overview
Seven targeted upgrades that transform the galaxy from "good 3D portfolio" to "award-site level" -- all using libraries already installed (drei, three, framer-motion).

---

## 1. Fresnel Atmosphere Glow (Custom Shader)

**What**: Replace the current flat-opacity `Atmosphere` component with a Fresnel-based shader that creates a realistic rim-lighting glow around each planet -- bright at the edges, transparent in the center, like a real atmosphere.

**Why**: The current `meshBasicMaterial` with `opacity: 0.12` looks like a translucent shell. Fresnel makes planets look cinematic.

**File**: `src/components/PlanetModel.tsx` -- replace the `Atmosphere` component with a `shaderMaterial` using a Fresnel formula in the fragment shader.

---

## 2. Planetary Rings (Saturn-style)

**What**: Add configurable rings to planets via a new `hasRings` boolean in `content.json`. Rings will use a `ringGeometry` with a gradient texture generated on a canvas, tilted to match the planet's axial tilt, with transparency falloff.

**Why**: Rings instantly signal "solar system" and add visual variety between planets.

**Files**: New `PlanetRings` component in `PlanetModel.tsx`, optional `hasRings`/`ringColor` fields in `DataService.ts` and `content.json`.

---

## 3. Orbiting Moons (Instanced Mesh)

**What**: Small spheres orbiting individual planets. Configurable via a `moons` count in `content.json` (e.g., 1-3 tiny glowing dots per planet). Uses a single `InstancedMesh` for all moons across all planets for performance.

**Why**: Adds life and motion to each planet without heavy GPU cost.

**Files**: New `Moons` sub-component in `PlanetModel.tsx`, optional `moons` field in `DataService.ts` and `content.json`.

---

## 4. Orbit Particle Trail (drei Trail)

**What**: Each planet leaves a fading particle trail along its orbit path using drei's `<Trail>` component. The trail color matches the planet color with decay, creating a comet-like effect.

**Why**: Trails make orbits feel dynamic rather than static rings. drei's `Trail` is already available in the installed version.

**File**: Wrap each planet's mesh with `<Trail>` in `PlanetModel.tsx`.

---

## 5. Nebula / Cosmic Dust Background

**What**: Add a few large, slowly-rotating, semi-transparent colored cloud meshes behind the planets using `sphereGeometry` with noise-based vertex displacement and additive blending. Creates a colored nebula effect in the deep background.

**Why**: The current background is just `Stars` dots on black. Nebula clouds add depth and atmosphere without affecting performance.

**File**: New `NebulaCloud` component added to `GalaxyScene.tsx`.

---

## 6. Interactive Orbit Speed Control

**What**: A small slider or "time warp" button in the bottom-left corner of the galaxy view that lets users speed up or slow down all orbital speeds (0.25x to 4x). The multiplier is passed as a context value to all `PlanetModel` instances.

**Why**: Gives users a playful interaction and a sense of control over the simulation.

**Files**: Speed state in `GalaxyScene.tsx`, consumed by `PlanetModel.tsx` via a context or prop.

---

## 7. Click Ripple / Shockwave Effect

**What**: When a planet is clicked, a brief expanding ring (shockwave) radiates outward from the planet using a scaled `ringGeometry` with animated opacity. Pure Three.js, no post-processing.

**Why**: Provides satisfying tactile feedback and makes clicks feel impactful.

**File**: New `ClickRipple` component triggered from `PlanetModel.tsx` on click.

---

## Implementation Order

1. Fresnel atmosphere shader (highest visual impact, replaces existing code)
2. Planetary rings
3. Orbiting moons
4. Orbit particle trails
5. Nebula background clouds
6. Orbit speed control UI
7. Click ripple effect

---

## Technical Notes

- No new dependencies needed -- everything uses `three`, `@react-three/drei`, and `@react-three/fiber` already installed
- All new features respect the existing `PerfTier` system: moons/trails/nebula are disabled on "low" tier
- New `content.json` fields (`hasRings`, `ringColor`, `moons`) are all optional with sensible defaults
- The Fresnel shader is ~15 lines of GLSL, inlined as a string in the component
- Trail from drei uses `meshLine` internally which is GPU-efficient
- Instanced mesh for moons means all moon geometry is a single draw call

