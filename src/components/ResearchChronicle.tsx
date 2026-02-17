import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FlaskConical, Brain, BarChart3, CheckCircle2, Clock } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "upcoming";
  description: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "m1",
    title: "Literature Review",
    date: "Sep 2023",
    status: "completed",
    description:
      "Surveyed 80+ papers on NLP-based mental health screening, focusing on transformer architectures for depression detection from social media and clinical text.",
  },
  {
    id: "m2",
    title: "Dataset Curation",
    date: "Jan 2024",
    status: "completed",
    description:
      "Collected and preprocessed text corpora from publicly available mental health forums. Applied IRB-compliant anonymization and balanced class distribution.",
  },
  {
    id: "m3",
    title: "Baseline Models",
    date: "May 2024",
    status: "completed",
    description:
      "Trained TF-IDF + SVM and LSTM baselines to establish benchmark F1 scores. Results confirmed the need for attention-based architectures.",
  },
  {
    id: "m4",
    title: "Transformer Fine-Tuning",
    date: "Oct 2024",
    status: "in-progress",
    description:
      "Fine-tuning BERT and RoBERTa on the curated dataset. Experimenting with domain-adaptive pre-training and multi-task learning objectives.",
  },
  {
    id: "m5",
    title: "Evaluation & Thesis Writing",
    date: "Mar 2025",
    status: "upcoming",
    description:
      "Final model evaluation with cross-validation, ablation studies, and comparison against clinical baselines. Drafting the thesis document.",
  },
];

const STATUS_ICONS = {
  completed: CheckCircle2,
  "in-progress": Clock,
  upcoming: Clock,
};

const STATUS_COLORS = {
  completed: "text-[hsl(142,70%,49%)]",
  "in-progress": "text-primary",
  upcoming: "text-muted-foreground/40",
};

const ResearchChronicle = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="mt-6 space-y-6">
      {/* Live Abstract */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Research Abstract
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This research investigates the application of transformer-based language models for
          early detection of depressive symptoms in unstructured text. By fine-tuning BERT and
          RoBERTa on curated mental health corpora, the study evaluates how attention mechanisms
          can capture subtle linguistic markers of depression, including reduced lexical diversity,
          increased first-person pronoun usage, and persistent negative sentiment patterns.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          The methodology combines domain-adaptive pre-training with multi-task learning to improve
          generalization across diverse text sources. Preliminary results show that attention-based
          models outperform traditional feature-engineering approaches by 12-18% in F1 score on
          held-out clinical validation sets.
        </p>
      </div>

      {/* Timeline */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Research Timeline
          </h3>
        </div>
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-1 bottom-1 w-px bg-border" />

          {MILESTONES.map((ms, i) => {
            const Icon = STATUS_ICONS[ms.status];
            const isExpanded = expandedId === ms.id;
            return (
              <div key={ms.id} className="relative mb-4 last:mb-0">
                {/* Dot */}
                <div className="absolute -left-6 top-0.5">
                  <Icon className={`w-[18px] h-[18px] ${STATUS_COLORS[ms.status]}`} />
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : ms.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{ms.title}</span>
                    <span className="text-[10px] text-muted-foreground">{ms.date}</span>
                    {ms.status === "in-progress" && (
                      <span className="px-1.5 py-0.5 text-[9px] rounded bg-primary/20 text-primary font-medium">
                        Current
                      </span>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-xs text-muted-foreground leading-relaxed mt-1 overflow-hidden"
                    >
                      {ms.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResearchChronicle;
