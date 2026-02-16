import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Starfield from "@/components/Starfield";
import { getAllContent, type ContentData, type Planet, type Project } from "@/services/DataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Plus, Trash2, Lock, ChevronDown, ChevronUp, Save, Check } from "lucide-react";

const ADMIN_PASSWORD = "admin";

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<ContentData | null>(null);
  const [editingPlanet, setEditingPlanet] = useState<string | null>(null);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", tags: "", link: "", videoUrl: "", studentCount: "" });

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
    localStorage.setItem("portfolio-content", JSON.stringify(content));
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
                },
              ],
            }
          : p
      ),
    });
    setNewProject({ title: "", description: "", tags: "", link: "", videoUrl: "", studentCount: "" });
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
          </div>
        </div>

        {/* Planets */}
        <div className="space-y-6">
          {content.planets.map((planet) => {
            const isExpanded = expandedPlanet === planet.id;
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
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">3D Properties</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Model Path (.glb)</Label>
                          <Input value={planet.modelPath || ""} onChange={(e) => updatePlanet(planet.id, { modelPath: e.target.value || undefined })} className="mt-1" placeholder="/models/planet.glb" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Glow Intensity</Label>
                          <Input type="number" step="0.1" value={planet.glowIntensity ?? 1.5} onChange={(e) => updatePlanet(planet.id, { glowIntensity: parseFloat(e.target.value) })} className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Emissive Color</Label>
                          <Input value={planet.emissiveColor || planet.color} onChange={(e) => updatePlanet(planet.id, { emissiveColor: e.target.value })} className="mt-1" placeholder="#FF6600" />
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
