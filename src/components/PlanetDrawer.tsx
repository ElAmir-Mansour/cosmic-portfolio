import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Users, ExternalLink, BookOpen, Award } from "lucide-react";
import type { Planet } from "@/services/DataService";
import NLPSandbox from "./NLPSandbox";
import ArchitectureDiagram from "./ArchitectureDiagram";

interface PlanetDrawerProps {
  planet: Planet | null;
  onClose: () => void;
}

const VideoModal = ({ url, onClose }: { url: string; onClose: () => void }) => {
  const getEmbedUrl = (raw: string) => {
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : raw;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={getEmbedUrl(url)}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </motion.div>
    </motion.div>
  );
};

const ImpactStats = ({ planet }: { planet: Planet }) => {
  const totalStudents = planet.projects.reduce((sum, p) => sum + (p.studentCount || 0), 0);
  const courseCount = planet.projects.length;

  return (
    <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">10+ Years of Teaching</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xl font-bold text-foreground">10+</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Years</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-foreground">{courseCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Courses</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-foreground">
            {totalStudents > 0 ? totalStudents.toLocaleString() : "500+"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Students</p>
        </div>
      </div>
    </div>
  );
};

const ELearningCard = ({ project }: { project: Planet["projects"][0] }) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <div className="rounded-lg overflow-hidden bg-secondary/50 border border-border transition-colors hover:border-primary/30">
        <div className="relative h-32 bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
          {project.videoUrl ? (
            <button
              onClick={() => setShowVideo(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/90 text-primary-foreground text-sm font-medium hover:bg-primary transition-colors"
            >
              <Play className="w-4 h-4" /> Watch Trailer
            </button>
          ) : (
            <BookOpen className="w-8 h-8 text-muted-foreground/40" />
          )}
        </div>
        <div className="p-4">
          <h4 className="font-medium text-foreground mb-1">{project.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded bg-background text-muted-foreground">{tag}</span>
              ))}
            </div>
            {project.studentCount && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" /> {project.studentCount.toLocaleString()}
              </span>
            )}
          </div>
          {project.link && project.link !== "#" && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="w-3 h-3" /> View Course
            </a>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showVideo && project.videoUrl && (
          <VideoModal url={project.videoUrl} onClose={() => setShowVideo(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

const DefaultProjectCard = ({ project }: { project: Planet["projects"][0] }) => (
  <div className="block p-4 rounded-lg bg-secondary/50 border border-border transition-colors hover:border-primary/30">
    <a href={project.link} className="block">
      <h4 className="font-medium text-foreground mb-1">{project.title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs rounded bg-background text-muted-foreground">{tag}</span>
        ))}
      </div>
    </a>
    {project.architecture && (
      <ArchitectureDiagram definition={project.architecture} title={`${project.title} Architecture`} />
    )}
  </div>
);

const PlanetDrawer = ({ planet, onClose }: PlanetDrawerProps) => {
  const isELearning = planet?.id === "elearning";
  const isNLP = planet?.id === "nlp";

  return (
    <AnimatePresence>
      {planet && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md glass overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planet.color, boxShadow: `0 0 12px ${planet.color}` }} />
                  <h2 className="text-xl font-semibold text-foreground">{planet.name}</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-muted-foreground text-sm mb-6">{planet.description}</p>

              {isELearning && <ImpactStats planet={planet} />}

              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {planet.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">{skill}</span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {isELearning ? "Course Modules" : "Projects"}
                </h3>
                <div className="space-y-4">
                  {planet.projects.map((project) =>
                    isELearning ? (
                      <ELearningCard key={project.id} project={project} />
                    ) : (
                      <DefaultProjectCard key={project.id} project={project} />
                    )
                  )}
                </div>
              </div>

              {isNLP && <NLPSandbox />}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default PlanetDrawer;
