import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Starfield from "@/components/Starfield";
import { getAllContent, saveContent, type ContentData, type Planet, type Project } from "@/services/DataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Plus, Trash2, Lock, ChevronDown, ChevronUp, Save, Check, Eye } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

const ADMIN_PASSWORD = "admin";

// Mini 3D planet preview for the admin theme editor
const MiniPlanetPreview = ({ color, glowIntensity, emissiveColor }: { color: string; glowIntensity: number; emissiveColor: string }) => {
  const emissive = useMemo(() => new THREE.Color(emissiveColor || color), [emissiveColor, color]);
  const meshColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <div className="h-32 rounded-lg overflow-hidden border border-border bg-background">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[3, 3, 3]} intensity={1} />
        <mesh rotation={[0.3, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color={meshColor}
            emissive={emissive}
            emissiveIntensity={glowIntensity}
            toneMapped={false}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        {/* Atmosphere */}
        <mesh scale={1.25}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial
            color={emissive}
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      </Canvas>
    </div>
  );
};

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<ContentData | null>(null);
  const [editingPlanet, setEditingPlanet] = useState<string | null>(null);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewPlanet, setPreviewPlanet] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ title: "", description: "", tags: "", link: "", videoUrl: "", studentCount: "", architecture: "" });

  useEffect(() => {
    getAllContent().then((data) => setContent(JSON.parse(JSON.stringify(data)))).catch(console.error);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
  };

  const updateContent = (newContent: ContentData) => {
    setContent(newContent);
    setHasChanges(true);
    setSaved(false);
  };

  const updatePlanet = (planetId: string, updates: Partial<Planet>) => {
    if (!content) return;
    updateContent({
      ...content,
      planets: content.planets.map((p) => (p.id === planetId ? { ...p, ...updates } : p)),
    });
  };

  const saveChanges = () => {
    if (!content) return;
    saveContent(content);
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportJSON = () => {
    if (!content) return;
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const addProject = (planetId: string) => {
    if (!content || !newProject.title) return;
    updateContent({
      ...content,
      planets: content.planets.map((p) =>
        p.id === planetId
          ? {
              ...p,
              projects: [
                ...p.projects,
                {
                  id: `${planetId}-${Date.now()}`,
                  title: newProject.title,
                  description: newProject.description,
                  tags: newProject.tags.split(",").map((t) => t.trim()).filter(Boolean),
                  link: newProject.link || "#",
                  videoUrl: newProject.videoUrl || undefined,
                  studentCount: newProject.studentCount ? parseInt(newProject.studentCount) : undefined,
                  architecture: newProject.architecture || undefined,
                },
              ],
            }
          : p
      ),
    });
    setNewProject({ title: "", description: "", tags: "", link: "", videoUrl: "", studentCount: "", architecture: "" });
  };

  const removeProject = (planetId: string, projectId: string) => {
    if (!content) return;
    updateContent({
      ...content,
      planets: content.planets.map((p) =>
        p.id === planetId ? { ...p, projects: p.projects.filter((pr) => pr.id !== projectId) } : p
      ),
    });
  };

  if (!authenticated) {
    return (
      <div className="bg-background min-h-screen">
        <Starfield />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-6">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleLogin}
            className="glass rounded-xl p-8 w-full max-w-sm space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Admin Access</h2>
            </div>
            <div>
              <Label htmlFor="password" className="text-muted-foreground">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" placeholder="Enter password" />
            </div>
            <Button type="submit" className="w-full">Enter</Button>
          </motion.form>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="bg-background min-h-screen">
      <Starfield />
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button onClick={saveChanges} size="sm" disabled={!hasChanges && !saved}>
              {saved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>
            <Button onClick={exportJSON} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Export JSON
            </Button>
          </div>
        </div>

        {/* Profile */}
        <div className="glass rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <Input value={content.profile.name} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, name: e.target.value } })} className="mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Title</Label>
              <Input value={content.profile.title} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, title: e.target.value } })} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">Tagline</Label>
              <Input value={content.profile.tagline} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, tagline: e.target.value } })} className="mt-1" />
            </div>
          </div>
        </div>

        {/* Planets */}
        <div className="space-y-6">
          {content.planets.map((planet) => {
            const isExpanded = expandedPlanet === planet.id;
            const showPreview = previewPlanet === planet.id;
            return (
              <div key={planet.id} className="glass rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => setExpandedPlanet(isExpanded ? null : planet.id)}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planet.color }} />
                  <h3 className="font-semibold text-foreground flex-1">{planet.name}</h3>
                  <span className="text-xs text-muted-foreground">{planet.projects.length} projects</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>

                {isExpanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* 3D Properties */}
                    <div className="p-4 rounded-lg bg-secondary/20 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">3D Properties</h4>
                        <button
                          onClick={() => setPreviewPlanet(showPreview ? null : planet.id)}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Eye className="w-3 h-3" /> {showPreview ? "Hide Preview" : "Preview"}
                        </button>
                      </div>

                      {showPreview && (
                        <div className="mb-4">
                          <MiniPlanetPreview
                            color={planet.color}
                            glowIntensity={planet.glowIntensity ?? 1.5}
                            emissiveColor={planet.emissiveColor || planet.color}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Model Path (.glb)</Label>
                          <Input value={planet.modelPath || ""} onChange={(e) => updatePlanet(planet.id, { modelPath: e.target.value || undefined })} className="mt-1" placeholder="/models/planet.glb" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Glow Intensity</Label>
                          <input
                            type="range"
                            min="0" max="5" step="0.1"
                            value={planet.glowIntensity ?? 1.5}
                            onChange={(e) => updatePlanet(planet.id, { glowIntensity: parseFloat(e.target.value) })}
                            className="w-full mt-2 accent-primary"
                          />
                          <span className="text-xs text-muted-foreground font-mono">{(planet.glowIntensity ?? 1.5).toFixed(1)}</span>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Emissive Color</Label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="color"
                              value={planet.emissiveColor || planet.color}
                              onChange={(e) => updatePlanet(planet.id, { emissiveColor: e.target.value })}
                              className="w-10 h-10 rounded border border-border cursor-pointer"
                            />
                            <Input value={planet.emissiveColor || planet.color} onChange={(e) => updatePlanet(planet.id, { emissiveColor: e.target.value })} placeholder="#FF6600" />
                          </div>
                        </div>
                      </div>

                      {/* Orbital Physics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50">
                        <div>
                          <Label className="text-xs text-muted-foreground">Eccentricity (0 = circle, 0.5 = ellipse)</Label>
                          <input
                            type="range"
                            min="0" max="0.6" step="0.05"
                            value={planet.eccentricity ?? 0}
                            onChange={(e) => updatePlanet(planet.id, { eccentricity: parseFloat(e.target.value) })}
                            className="w-full mt-2 accent-primary"
                          />
                          <span className="text-xs text-muted-foreground font-mono">{(planet.eccentricity ?? 0).toFixed(2)}</span>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Axial Tilt (degrees)</Label>
                          <input
                            type="range"
                            min="0" max="45" step="1"
                            value={planet.axialTilt ?? 0}
                            onChange={(e) => updatePlanet(planet.id, { axialTilt: parseFloat(e.target.value) })}
                            className="w-full mt-2 accent-primary"
                          />
                          <span className="text-xs text-muted-foreground font-mono">{planet.axialTilt ?? 0}°</span>
                        </div>
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-2">
                      {planet.projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                          <div>
                            <span className="text-sm font-medium text-foreground">{project.title}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{project.tags.join(", ")}</span>
                            {project.videoUrl && <span className="ml-2 text-xs text-primary">🎬 Video</span>}
                            {project.studentCount && <span className="ml-2 text-xs text-muted-foreground">👥 {project.studentCount}</span>}
                            {project.architecture && <span className="ml-2 text-xs text-primary">📐 Diagram</span>}
                          </div>
                          <button onClick={() => removeProject(planet.id, project.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add project form */}
                    {editingPlanet === planet.id ? (
                      <div className="space-y-3 p-4 rounded-lg bg-secondary/20 border border-border">
                        <Input placeholder="Project title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
                        <Input placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
                        <Input placeholder="Tags (comma-separated)" value={newProject.tags} onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })} />
                        <Input placeholder="Link" value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} />
                        <Input placeholder="Video URL (optional)" value={newProject.videoUrl} onChange={(e) => setNewProject({ ...newProject, videoUrl: e.target.value })} />
                        <Input placeholder="Student count (optional)" type="number" value={newProject.studentCount} onChange={(e) => setNewProject({ ...newProject, studentCount: e.target.value })} />
                        <Input placeholder="Architecture diagram (Mermaid syntax, optional)" value={newProject.architecture} onChange={(e) => setNewProject({ ...newProject, architecture: e.target.value })} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => addProject(planet.id)}>Add</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingPlanet(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setEditingPlanet(planet.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Plus className="w-3 h-3" /> Add project
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
