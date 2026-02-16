

# Cosmic Knowledge Base — Portfolio

## Overview
A futuristic, cyberpunk-minimalist portfolio built around a 3D Solar System metaphor. Five planets represent your expertise areas: iOS Development, Full-Stack Engineering, E-Learning/Content Creation, NLP Research, and Scrum/PM. The experience gracefully degrades to a 2D Star Map on mobile/slow connections.

---

## Page 1: Landing / Entrance
- Dark-mode, glassmorphism hero section with your name, title, and a brief tagline
- Subtle animated star-field background (CSS/canvas, lightweight)
- Minimal nav bar with links: About, Explore, Contact, Admin
- Scroll-triggered transition: as the user scrolls, the 2D UI fades out and the 3D space environment fades in using Framer Motion

## Page 2: The Galaxy (3D Solar System)
- Full-screen 3D scene using `@react-three/fiber` and `@react-three/drei`
- A central "sun" (your personal brand) orbited by 5 planets, each with a distinct neon color/glow:
  - **iOS Development** (blue)
  - **Full-Stack Engineering** (green)
  - **E-Learning / Content Creation** (purple)
  - **NLP Research** (orange)
  - **Scrum / PM** (cyan)
- Planets slowly orbit and rotate with subtle particle/star-field backdrop
- **PlanetModel** placeholder component — renders a sphere by default, designed so you can swap in Spline or GLTF models later
- **Click interaction**: clicking a planet triggers a smooth camera animation (zoom/focus) and opens a side-panel drawer

## The Side Panel (Drawer)
- Slides in from the right with glassmorphism styling
- Shows the selected planet's category name, description, and a list of related projects/skills
- Each project card displays: title, short description, tags, and a link
- Close button or click-away to return to the galaxy view

## Mobile / Slow Connection: 2D Star Map
- Device detection (screen size) and optional connection-speed check
- Instead of the 3D scene, render a beautifully styled 2D grid/list of the 5 categories
- Each category is a card with a neon-glow accent, expandable to show projects
- Same data, same content, just a performant flat layout

## Data Service Layer
- All content (planets, projects, bio) loaded from `/data/content.json`
- A `DataService` module with async fetch functions (e.g., `getPlanets()`, `getProjects(categoryId)`)
- Clean interface so you can later point these functions at a Go/Python API endpoint with a single URL change

## Admin Dashboard (`/admin`)
- Protected route (simple client-side password gate)
- Form to add/edit planets and projects (updates local React state)
- "Export JSON" button that outputs the current state as formatted JSON for you to copy-paste into `content.json`
- Preview of current data in a table/list view

## Contact Section
- Minimal contact form or links (email, GitHub, LinkedIn)
- Positioned as a footer section or accessible from the nav

---

## Design System
- **Colors**: Deep black background, neon accent palette (electric blue, green, purple, orange, cyan)
- **Typography**: Clean, high-quality sans-serif with large headings
- **Effects**: Glassmorphism cards, subtle glow/bloom on interactive elements, smooth Framer Motion transitions throughout
- **Tone**: Professional, clear, no fluff — impactful copy

