import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Starfield from "@/components/Starfield";
import { getAllContent, saveContent, type ContentData, type Planet, type Project, type ResearchMilestone, type ImpactMetric, type LearningPath, type TechnicalChallenge, type CodeSnippet } from "@/services/DataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Plus, Trash2, Lock, ChevronDown, ChevronUp, Save, Check, Eye } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

const ADMIN_PASSWORD = "admin";

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
          <meshStandardMaterial color={meshColor} emissive={emissive} emissiveIntensity={glowIntensity} toneMapped={false} roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh scale={1.25}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial color={emissive} transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      </Canvas>
    </div>
  );
};

/* ─── Milestone Editor ─── */
const MilestoneEditor = ({ milestones, onChange }: { milestones: ResearchMilestone[]; onChange: (m: ResearchMilestone[]) => void }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", date: "", status: "upcoming" as ResearchMilestone["status"], description: "" });

  const add = () => {
    if (!draft.title) return;
    onChange([...milestones, { ...draft, id: `m-${Date.now()}` }]);
    setDraft({ title: "", date: "", status: "upcoming", description: "" });
    setAdding(false);
  };

  const update = (idx: number, updates: Partial<ResearchMilestone>) => {
    onChange(milestones.map((m, i) => i === idx ? { ...m, ...updates } : m));
  };

  const remove = (idx: number) => onChange(milestones.filter((_, i) => i !== idx));

  return (
    <div className="p-4 rounded-lg bg-secondary/20 border border-border space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Research Milestones</h4>
      {milestones.map((ms, i) => (
        <div key={ms.id} className="flex gap-2 items-start p-2 rounded bg-secondary/30">
          <div className="flex-1 space-y-1">
            <Input value={ms.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Title" className="h-7 text-xs" />
            <div className="flex gap-2">
              <Input value={ms.date} onChange={(e) => update(i, { date: e.target.value })} placeholder="Date" className="h-7 text-xs w-28" />
              <select value={ms.status} onChange={(e) => update(i, { status: e.target.value as ResearchMilestone["status"] })} className="h-7 text-xs rounded border border-input bg-background px-2">
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
            <Input value={ms.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="Description" className="h-7 text-xs" />
          </div>
          <button onClick={() => remove(i)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      {adding ? (
        <div className="space-y-2 p-2 rounded bg-secondary/30">
          <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="h-7 text-xs" />
          <div className="flex gap-2">
            <Input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} placeholder="Date" className="h-7 text-xs w-28" />
            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ResearchMilestone["status"] })} className="h-7 text-xs rounded border border-input bg-background px-2">
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
          <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" className="h-7 text-xs" />
          <div className="flex gap-2">
            <Button size="sm" onClick={add} className="h-7 text-xs">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-7 text-xs">Cancel</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /> Add milestone</button>
      )}
    </div>
  );
};

/* ─── Impact Metrics Editor ─── */
const MetricsEditor = ({ metrics, onChange }: { metrics: ImpactMetric[]; onChange: (m: ImpactMetric[]) => void }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ label: "", value: "", sublabel: "", icon: "globe" });

  const add = () => {
    if (!draft.label) return;
    onChange([...metrics, draft]);
    setDraft({ label: "", value: "", sublabel: "", icon: "globe" });
    setAdding(false);
  };

  const update = (idx: number, updates: Partial<ImpactMetric>) => {
    onChange(metrics.map((m, i) => i === idx ? { ...m, ...updates } : m));
  };

  const remove = (idx: number) => onChange(metrics.filter((_, i) => i !== idx));

  return (
    <div className="p-4 rounded-lg bg-secondary/20 border border-border space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Impact Metrics</h4>
      {metrics.map((m, i) => (
        <div key={i} className="flex gap-2 items-center p-2 rounded bg-secondary/30">
          <select value={m.icon} onChange={(e) => update(i, { icon: e.target.value })} className="h-7 text-xs rounded border border-input bg-background px-2 w-24">
            <option value="youtube">YouTube</option>
            <option value="globe">Globe</option>
            <option value="graduation">Graduation</option>
            <option value="trending">Trending</option>
          </select>
          <Input value={m.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" className="h-7 text-xs" />
          <Input value={m.value} onChange={(e) => update(i, { value: e.target.value })} placeholder="Value" className="h-7 text-xs w-20" />
          <Input value={m.sublabel} onChange={(e) => update(i, { sublabel: e.target.value })} placeholder="Sublabel" className="h-7 text-xs w-28" />
          <button onClick={() => remove(i)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      {adding ? (
        <div className="flex gap-2 items-center p-2 rounded bg-secondary/30">
          <select value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} className="h-7 text-xs rounded border border-input bg-background px-2 w-24">
            <option value="youtube">YouTube</option>
            <option value="globe">Globe</option>
            <option value="graduation">Graduation</option>
            <option value="trending">Trending</option>
          </select>
          <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Label" className="h-7 text-xs" />
          <Input value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} placeholder="Value" className="h-7 text-xs w-20" />
          <Input value={draft.sublabel} onChange={(e) => setDraft({ ...draft, sublabel: e.target.value })} placeholder="Sublabel" className="h-7 text-xs w-28" />
          <Button size="sm" onClick={add} className="h-7 text-xs">Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-7 text-xs">Cancel</Button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /> Add metric</button>
      )}
    </div>
  );
};

/* ─── Learning Paths Editor ─── */
const LearningPathsEditor = ({ paths, onChange }: { paths: LearningPath[]; onChange: (p: LearningPath[]) => void }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ level: "", title: "", topics: "" });

  const add = () => {
    if (!draft.title) return;
    onChange([...paths, { level: draft.level, title: draft.title, topics: draft.topics.split(",").map(t => t.trim()).filter(Boolean) }]);
    setDraft({ level: "", title: "", topics: "" });
    setAdding(false);
  };

  const update = (idx: number, updates: Partial<LearningPath & { topicsStr?: string }>) => {
    if (updates.topicsStr !== undefined) {
      onChange(paths.map((p, i) => i === idx ? { ...p, topics: updates.topicsStr!.split(",").map(t => t.trim()).filter(Boolean) } : p));
    } else {
      onChange(paths.map((p, i) => i === idx ? { ...p, ...updates } : p));
    }
  };

  const remove = (idx: number) => onChange(paths.filter((_, i) => i !== idx));

  return (
    <div className="p-4 rounded-lg bg-secondary/20 border border-border space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Learning Paths</h4>
      {paths.map((p, i) => (
        <div key={i} className="flex gap-2 items-start p-2 rounded bg-secondary/30">
          <div className="flex-1 space-y-1">
            <div className="flex gap-2">
              <Input value={p.level} onChange={(e) => update(i, { level: e.target.value })} placeholder="Level" className="h-7 text-xs w-28" />
              <Input value={p.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Title" className="h-7 text-xs" />
            </div>
            <Input value={p.topics.join(", ")} onChange={(e) => update(i, { topicsStr: e.target.value })} placeholder="Topics (comma-separated)" className="h-7 text-xs" />
          </div>
          <button onClick={() => remove(i)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      {adding ? (
        <div className="space-y-2 p-2 rounded bg-secondary/30">
          <div className="flex gap-2">
            <Input value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} placeholder="Level" className="h-7 text-xs w-28" />
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title" className="h-7 text-xs" />
          </div>
          <Input value={draft.topics} onChange={(e) => setDraft({ ...draft, topics: e.target.value })} placeholder="Topics (comma-separated)" className="h-7 text-xs" />
          <div className="flex gap-2">
            <Button size="sm" onClick={add} className="h-7 text-xs">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-7 text-xs">Cancel</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /> Add path</button>
      )}
    </div>
  );
};

/* ─── Technical Challenges Editor (per project) ─── */
const ChallengesEditor = ({ challenges, onChange }: { challenges: TechnicalChallenge[]; onChange: (c: TechnicalChallenge[]) => void }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ question: "", decision: "", reasoning: "" });

  const add = () => {
    if (!draft.question) return;
    onChange([...challenges, draft]);
    setDraft({ question: "", decision: "", reasoning: "" });
    setAdding(false);
  };

  const update = (idx: number, updates: Partial<TechnicalChallenge>) => {
    onChange(challenges.map((c, i) => i === idx ? { ...c, ...updates } : c));
  };

  const remove = (idx: number) => onChange(challenges.filter((_, i) => i !== idx));

  return (
    <div className="mt-2 space-y-2">
      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Technical Decisions</span>
      {challenges.map((ch, i) => (
        <div key={i} className="flex gap-2 items-start p-2 rounded bg-secondary/20 border border-border/50">
          <div className="flex-1 space-y-1">
            <Input value={ch.question} onChange={(e) => update(i, { question: e.target.value })} placeholder="Question" className="h-7 text-xs" />
            <Input value={ch.decision} onChange={(e) => update(i, { decision: e.target.value })} placeholder="Decision" className="h-7 text-xs" />
            <Input value={ch.reasoning} onChange={(e) => update(i, { reasoning: e.target.value })} placeholder="Reasoning" className="h-7 text-xs" />
          </div>
          <button onClick={() => remove(i)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      {adding ? (
        <div className="space-y-1 p-2 rounded bg-secondary/20">
          <Input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} placeholder="Question" className="h-7 text-xs" />
          <Input value={draft.decision} onChange={(e) => setDraft({ ...draft, decision: e.target.value })} placeholder="Decision" className="h-7 text-xs" />
          <Input value={draft.reasoning} onChange={(e) => setDraft({ ...draft, reasoning: e.target.value })} placeholder="Reasoning" className="h-7 text-xs" />
          <div className="flex gap-2">
            <Button size="sm" onClick={add} className="h-7 text-xs">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-7 text-xs">Cancel</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /> Add decision</button>
      )}
    </div>
  );
};

/* ─── Code Snippets Editor (per project) ─── */
const CodeSnippetsEditor = ({ snippets, onChange }: { snippets: CodeSnippet[]; onChange: (s: CodeSnippet[]) => void }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ nodeId: "", language: "typescript", filename: "", code: "" });

  const add = () => {
    if (!draft.nodeId || !draft.filename) return;
    onChange([...snippets, draft]);
    setDraft({ nodeId: "", language: "typescript", filename: "", code: "" });
    setAdding(false);
  };

  const update = (idx: number, updates: Partial<CodeSnippet>) => {
    onChange(snippets.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const remove = (idx: number) => onChange(snippets.filter((_, i) => i !== idx));

  return (
    <div className="mt-2 space-y-2">
      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Code Snippets (X-Ray)</span>
      {snippets.map((s, i) => (
        <div key={i} className="flex gap-2 items-start p-2 rounded bg-secondary/20 border border-border/50">
          <div className="flex-1 space-y-1">
            <div className="flex gap-2">
              <Input value={s.nodeId} onChange={(e) => update(i, { nodeId: e.target.value })} placeholder="Node ID (e.g. B)" className="h-7 text-xs w-20" />
              <select value={s.language} onChange={(e) => update(i, { language: e.target.value })} className="h-7 text-xs rounded border border-input bg-background px-2">
                <option value="swift">Swift</option>
                <option value="go">Go</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
              </select>
              <Input value={s.filename} onChange={(e) => update(i, { filename: e.target.value })} placeholder="Filename" className="h-7 text-xs" />
            </div>
            <textarea
              value={s.code}
              onChange={(e) => update(i, { code: e.target.value })}
              placeholder="Code..."
              rows={4}
              className="w-full text-xs font-mono rounded border border-input bg-background p-2 resize-y focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button onClick={() => remove(i)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      {adding ? (
        <div className="space-y-1 p-2 rounded bg-secondary/20">
          <div className="flex gap-2">
            <Input value={draft.nodeId} onChange={(e) => setDraft({ ...draft, nodeId: e.target.value })} placeholder="Node ID" className="h-7 text-xs w-20" />
            <select value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })} className="h-7 text-xs rounded border border-input bg-background px-2">
              <option value="swift">Swift</option>
              <option value="go">Go</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
            </select>
            <Input value={draft.filename} onChange={(e) => setDraft({ ...draft, filename: e.target.value })} placeholder="Filename" className="h-7 text-xs" />
          </div>
          <textarea
            value={draft.code}
            onChange={(e) => setDraft({ ...draft, code: e.target.value })}
            placeholder="Code..."
            rows={4}
            className="w-full text-xs font-mono rounded border border-input bg-background p-2 resize-y focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={add} className="h-7 text-xs">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-7 text-xs">Cancel</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /> Add snippet</button>
      )}
    </div>
  );
};

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<ContentData | null>(null);
  const [editingPlanet, setEditingPlanet] = useState<string | null>(null);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
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

  const updateProject = (planetId: string, projectId: string, updates: Partial<Project>) => {
    if (!content) return;
    updateContent({
      ...content,
      planets: content.planets.map((p) =>
        p.id === planetId
          ? { ...p, projects: p.projects.map((pr) => pr.id === projectId ? { ...pr, ...updates } : pr) }
          : p
      ),
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
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input value={content.profile.email} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, email: e.target.value } })} className="mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">GitHub</Label>
              <Input value={content.profile.github} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, github: e.target.value } })} className="mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">LinkedIn</Label>
              <Input value={content.profile.linkedin} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, linkedin: e.target.value } })} className="mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground">Medium</Label>
              <Input value={content.profile.medium || ""} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, medium: e.target.value || undefined } })} className="mt-1" placeholder="https://medium.com/@..." />
            </div>
            <div>
              <Label className="text-muted-foreground">Udemy</Label>
              <Input value={content.profile.udemy || ""} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, udemy: e.target.value || undefined } })} className="mt-1" placeholder="https://www.udemy.com/user/..." />
            </div>
            <div>
              <Label className="text-muted-foreground">YouTube</Label>
              <Input value={content.profile.youtube || ""} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, youtube: e.target.value || undefined } })} className="mt-1" placeholder="https://www.youtube.com/@..." />
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">About</Label>
              <textarea
                value={content.profile.about || ""}
                onChange={(e) => updateContent({ ...content, profile: { ...content.profile, about: e.target.value || undefined } })}
                className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                rows={3}
                placeholder="A short bio about yourself..."
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-muted-foreground">Resume URL</Label>
              <Input value={content.profile.resumeUrl || ""} onChange={(e) => updateContent({ ...content, profile: { ...content.profile, resumeUrl: e.target.value || undefined } })} className="mt-1" placeholder="https://drive.google.com/... or /resume.pdf" />
              <p className="text-[10px] text-muted-foreground mt-1">Link to your resume PDF (Google Drive, Dropbox, or place a file in /public)</p>
            </div>
          </div>
        </div>

        {/* Planets */}
        <div className="space-y-6">
          {content.planets.map((planet) => {
            const isExpanded = expandedPlanet === planet.id;
            const showPreview = previewPlanet === planet.id;
            const isNLP = planet.id === "nlp";
            const isELearning = planet.id === "elearning";
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
                        <button onClick={() => setPreviewPlanet(showPreview ? null : planet.id)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <Eye className="w-3 h-3" /> {showPreview ? "Hide Preview" : "Preview"}
                        </button>
                      </div>
                      {showPreview && (
                        <div className="mb-4">
                          <MiniPlanetPreview color={planet.color} glowIntensity={planet.glowIntensity ?? 1.5} emissiveColor={planet.emissiveColor || planet.color} />
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Model Path (.glb)</Label>
                          <Input value={planet.modelPath || ""} onChange={(e) => updatePlanet(planet.id, { modelPath: e.target.value || undefined })} className="mt-1" placeholder="/models/planet.glb" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Glow Intensity</Label>
                          <input type="range" min="0" max="5" step="0.1" value={planet.glowIntensity ?? 1.5} onChange={(e) => updatePlanet(planet.id, { glowIntensity: parseFloat(e.target.value) })} className="w-full mt-2 accent-primary" />
                          <span className="text-xs text-muted-foreground font-mono">{(planet.glowIntensity ?? 1.5).toFixed(1)}</span>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Emissive Color</Label>
                          <div className="flex gap-2 mt-1">
                            <input type="color" value={planet.emissiveColor || planet.color} onChange={(e) => updatePlanet(planet.id, { emissiveColor: e.target.value })} className="w-10 h-10 rounded border border-border cursor-pointer" />
                            <Input value={planet.emissiveColor || planet.color} onChange={(e) => updatePlanet(planet.id, { emissiveColor: e.target.value })} placeholder="#FF6600" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50">
                        <div>
                          <Label className="text-xs text-muted-foreground">Eccentricity (0 = circle, 0.5 = ellipse)</Label>
                          <input type="range" min="0" max="0.6" step="0.05" value={planet.eccentricity ?? 0} onChange={(e) => updatePlanet(planet.id, { eccentricity: parseFloat(e.target.value) })} className="w-full mt-2 accent-primary" />
                          <span className="text-xs text-muted-foreground font-mono">{(planet.eccentricity ?? 0).toFixed(2)}</span>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Axial Tilt (degrees)</Label>
                          <input type="range" min="0" max="45" step="1" value={planet.axialTilt ?? 0} onChange={(e) => updatePlanet(planet.id, { axialTilt: parseFloat(e.target.value) })} className="w-full mt-2 accent-primary" />
                          <span className="text-xs text-muted-foreground font-mono">{planet.axialTilt ?? 0}°</span>
                        </div>
                      </div>
                    </div>

                    {/* NLP-specific: Abstract + Milestones */}
                    {isNLP && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-secondary/20 border border-border">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Research Abstract</h4>
                          <textarea
                            value={planet.researchAbstract || ""}
                            onChange={(e) => updatePlanet(planet.id, { researchAbstract: e.target.value })}
                            placeholder="Write your research abstract here..."
                            rows={5}
                            className="w-full text-sm rounded-md border border-input bg-background text-foreground p-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                          />
                        </div>
                        <MilestoneEditor
                          milestones={planet.researchMilestones || []}
                          onChange={(milestones) => updatePlanet(planet.id, { researchMilestones: milestones })}
                        />
                      </div>
                    )}

                    {/* E-Learning specific: Metrics + Paths */}
                    {isELearning && (
                      <div className="space-y-4">
                        <MetricsEditor
                          metrics={planet.impactMetrics || []}
                          onChange={(metrics) => updatePlanet(planet.id, { impactMetrics: metrics })}
                        />
                        <LearningPathsEditor
                          paths={planet.learningPaths || []}
                          onChange={(paths) => updatePlanet(planet.id, { learningPaths: paths })}
                        />
                      </div>
                    )}

                    {/* Projects */}
                    <div className="space-y-2">
                      {planet.projects.map((project) => {
                        const isProjectExpanded = expandedProject === project.id;
                        return (
                          <div key={project.id} className="rounded-lg bg-secondary/30 overflow-hidden">
                            <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => setExpandedProject(isProjectExpanded ? null : project.id)}>
                              <div>
                                <span className="text-sm font-medium text-foreground">{project.title}</span>
                                <span className="ml-2 text-xs text-muted-foreground">{project.tags.join(", ")}</span>
                                {project.videoUrl && <span className="ml-2 text-xs text-primary">🎬</span>}
                                {project.architecture && <span className="ml-2 text-xs text-primary">📐</span>}
                                {project.technicalChallenges && project.technicalChallenges.length > 0 && <span className="ml-2 text-xs text-primary">🔧 {project.technicalChallenges.length}</span>}
                                {project.codeSnippets && project.codeSnippets.length > 0 && <span className="ml-2 text-xs text-primary">🔬 {project.codeSnippets.length}</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {isProjectExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                                <button onClick={(e) => { e.stopPropagation(); removeProject(planet.id, project.id); }} className="p-1 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {isProjectExpanded && (
                              <div className="px-3 pb-3 space-y-2">
                                <Input value={project.title} onChange={(e) => updateProject(planet.id, project.id, { title: e.target.value })} placeholder="Title" className="h-7 text-xs" />
                                <Input value={project.description} onChange={(e) => updateProject(planet.id, project.id, { description: e.target.value })} placeholder="Description" className="h-7 text-xs" />
                                <Input value={project.tags.join(", ")} onChange={(e) => updateProject(planet.id, project.id, { tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} placeholder="Tags" className="h-7 text-xs" />
                                <Input value={project.link} onChange={(e) => updateProject(planet.id, project.id, { link: e.target.value })} placeholder="Link" className="h-7 text-xs" />
                                <Input value={project.architecture || ""} onChange={(e) => updateProject(planet.id, project.id, { architecture: e.target.value || undefined })} placeholder="Architecture (Mermaid)" className="h-7 text-xs" />
                                <ChallengesEditor
                                  challenges={project.technicalChallenges || []}
                                  onChange={(challenges) => updateProject(planet.id, project.id, { technicalChallenges: challenges })}
                                />
                                <CodeSnippetsEditor
                                  snippets={project.codeSnippets || []}
                                  onChange={(codeSnippets) => updateProject(planet.id, project.id, { codeSnippets })}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
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
