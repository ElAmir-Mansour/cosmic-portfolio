// Data Service Layer
// Currently fetches from local JSON. Swap BASE_URL to point at your Go/Python API.

const BASE_URL = "/data";

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
}

export interface Planet {
  id: string;
  name: string;
  color: string;
  neonClass: string;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  description: string;
  skills: string[];
  projects: Project[];
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  email: string;
  github: string;
  linkedin: string;
}

export interface ContentData {
  profile: Profile;
  planets: Planet[];
}

let cachedData: ContentData | null = null;

async function fetchContent(): Promise<ContentData> {
  if (cachedData) return cachedData;
  const res = await fetch(`${BASE_URL}/content.json`);
  if (!res.ok) throw new Error("Failed to load content");
  cachedData = await res.json();
  return cachedData!;
}

export async function getProfile(): Promise<Profile> {
  const data = await fetchContent();
  return data.profile;
}

export async function getPlanets(): Promise<Planet[]> {
  const data = await fetchContent();
  return data.planets;
}

export async function getPlanetById(id: string): Promise<Planet | undefined> {
  const planets = await getPlanets();
  return planets.find((p) => p.id === id);
}

export async function getProjects(planetId: string): Promise<Project[]> {
  const planet = await getPlanetById(planetId);
  return planet?.projects ?? [];
}

export async function getAllContent(): Promise<ContentData> {
  return fetchContent();
}

export function clearCache() {
  cachedData = null;
}
