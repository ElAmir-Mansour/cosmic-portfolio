// Data Service Layer
// Currently fetches from local JSON. Swap BASE_URL to point at your Go/Python API.

const BASE_URL = "/data";

export interface TechnicalChallenge {
  question: string;
  decision: string;
  reasoning: string;
}

export interface CodeSnippet {
  nodeId: string;
  language: string;
  filename: string;
  code: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  videoUrl?: string;
  studentCount?: number;
  architecture?: string; // Mermaid diagram definition
  technicalChallenges?: TechnicalChallenge[];
  codeSnippets?: CodeSnippet[];
}

export interface ResearchMilestone {
  id: string;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "upcoming";
  description: string;
}

export interface ImpactMetric {
  label: string;
  value: string;
  sublabel: string;
  icon: string; // icon name: "youtube" | "globe" | "graduation" | "trending"
}

export interface LearningPath {
  level: string;
  title: string;
  topics: string[];
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
  icon?: string; // lucide icon name e.g. "smartphone", "brain", "graduation-cap"
  modelPath?: string;
  glowIntensity?: number;
  emissiveColor?: string;
  eccentricity?: number;  // 0 = circle, 0.5 = ellipse
  axialTilt?: number;     // degrees
  // NLP Research specific
  researchAbstract?: string;
  researchMilestones?: ResearchMilestone[];
  // E-Learning specific
  impactMetrics?: ImpactMetric[];
  learningPaths?: LearningPath[];
}

export interface ProfileStat {
  icon: string;
  value: number;
  suffix: string;
  label: string;
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  email: string;
  github: string;
  linkedin: string;
  medium?: string;
  udemy?: string;
  youtube?: string;
  about?: string;
  resumeUrl?: string;
  stats?: ProfileStat[];
}

export interface ContentData {
  profile: Profile;
  planets: Planet[];
}

let cachedData: ContentData | null = null;

async function fetchContent(): Promise<ContentData> {
  if (cachedData) return cachedData;
  const saved = localStorage.getItem("portfolio-content");
  if (saved) {
    cachedData = JSON.parse(saved);
    return cachedData!;
  }
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

export function saveContent(data: ContentData) {
  localStorage.setItem("portfolio-content", JSON.stringify(data));
  cachedData = data;
}
