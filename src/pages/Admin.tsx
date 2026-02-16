import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Starfield from "@/components/Starfield";
import { getAllContent, type ContentData, type Planet, type Project } from "@/services/DataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Plus, Trash2, Lock } from "lucide-react";

const ADMIN_PASSWORD = "admin"; // Simple client-side gate

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<ContentData | null>(null);
  const [editingPlanet, setEditingPlanet] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ title: "", description: "", tags: "", link: "" });

  useEffect(() => {
    getAllContent().then((data) => setContent(JSON.parse(JSON.stringify(data)))).catch(console.error);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
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
    setContent({
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
                },
              ],
            }
          : p
      ),
    });
    setNewProject({ title: "", description: "", tags: "", link: "" });
  };

  const removeProject = (planetId: string, projectId: string) => {
    if (!content) return;
    setContent({
      ...content,
      planets: content.planets.map((p) =>
        p.id === planetId
          ? { ...p, projects: p.projects.filter((pr) => pr.id !== projectId) }
          : p
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter password"
              />
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
          <Button onClick={exportJSON} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export JSON
          </Button>
        </div>

        {/* Profile */}
        <div className="glass rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <Input
                value={content.profile.name}
                onChange={(e) => setContent({ ...content, profile: { ...content.profile, name: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Title</Label>
              <Input
                value={content.profile.title}
                onChange={(e) => setContent({ ...content, profile: { ...content.profile, title: e.target.value } })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Planets */}
        <div className="space-y-6">
          {content.planets.map((planet) => (
            <div key={planet.id} className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planet.color }} />
                <h3 className="font-semibold text-foreground">{planet.name}</h3>
                <span className="text-xs text-muted-foreground">{planet.projects.length} projects</span>
              </div>

              {/* Existing projects */}
              <div className="space-y-2 mb-4">
                {planet.projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <span className="text-sm font-medium text-foreground">{project.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{project.tags.join(", ")}</span>
                    </div>
                    <button
                      onClick={() => removeProject(planet.id, project.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add project form */}
              {editingPlanet === planet.id ? (
                <div className="space-y-3 p-4 rounded-lg bg-secondary/20 border border-border">
                  <Input
                    placeholder="Project title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={newProject.tags}
                    onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  />
                  <Input
                    placeholder="Link"
                    value={newProject.link}
                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => addProject(planet.id)}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingPlanet(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPlanet(planet.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add project
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
