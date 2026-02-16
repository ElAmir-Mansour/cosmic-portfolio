import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Token {
  text: string;
  type: "noun" | "verb" | "adjective" | "adverb" | "other" | "punctuation";
}

interface AnalysisResult {
  sentimentLabel: string;
  sentimentPolarity: number;
  lexicalDiversity: number;
  tokens: Token[];
  wordCount: number;
  uniqueWords: number;
  attentionWeights: number[]; // per-token attention scores 0-1
}

const TOKEN_COLORS: Record<Token["type"], string> = {
  noun: "hsl(210, 100%, 56%)",
  verb: "hsl(142, 70%, 49%)",
  adjective: "hsl(270, 80%, 60%)",
  adverb: "hsl(25, 95%, 55%)",
  other: "hsl(215, 20%, 55%)",
  punctuation: "hsl(215, 20%, 40%)",
};

const TOKEN_LABELS: Record<Token["type"], string> = {
  noun: "NOUN",
  verb: "VERB",
  adjective: "ADJ",
  adverb: "ADV",
  other: "DET/PREP",
  punctuation: "PUNCT",
};

function mockTokenize(text: string): Token[] {
  const nouns = new Set(["model", "sentence", "analysis", "data", "text", "research", "depression", "language", "word", "detection", "system", "network", "learning", "transformer", "attention", "token", "embedding", "vector", "classification", "sentiment", "person", "world", "thing", "life", "time", "day", "way", "people", "man", "woman", "child", "help", "hope", "fear", "anxiety", "mood", "health", "patient", "therapy", "brain", "mind", "study", "score", "result"]);
  const verbs = new Set(["is", "are", "was", "were", "have", "has", "had", "do", "does", "did", "run", "detect", "analyze", "predict", "train", "process", "classify", "feel", "think", "know", "want", "need", "use", "find", "give", "tell", "work", "call", "try", "ask", "seem", "come", "go", "make", "take", "see", "look", "get", "say", "struggle", "suffer", "cope", "improve"]);
  const adjectives = new Set(["good", "bad", "happy", "sad", "great", "small", "large", "deep", "new", "old", "high", "low", "long", "short", "natural", "neural", "fine", "beautiful", "terrible", "wonderful", "awful", "amazing", "depressed", "anxious", "positive", "negative", "lonely", "tired", "hopeless", "worthless", "empty", "numb", "exhausted"]);
  const adverbs = new Set(["very", "really", "quite", "always", "never", "often", "sometimes", "well", "badly", "quickly", "slowly", "not", "also", "just", "still", "already", "constantly", "barely", "hardly"]);
  const others = new Set(["the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by", "from", "up", "about", "into", "through", "during", "before", "after", "above", "below", "between", "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "its", "our", "their", "and", "but", "or", "so", "if", "when", "because"]);

  const words = text.match(/[\w']+|[^\w\s]/g) || [];
  return words.map((w): Token => {
    const lower = w.toLowerCase();
    if (/^[^\w\s]$/.test(w)) return { text: w, type: "punctuation" };
    if (nouns.has(lower)) return { text: w, type: "noun" };
    if (verbs.has(lower)) return { text: w, type: "verb" };
    if (adjectives.has(lower)) return { text: w, type: "adjective" };
    if (adverbs.has(lower)) return { text: w, type: "adverb" };
    if (others.has(lower)) return { text: w, type: "other" };
    if (lower.endsWith("ly")) return { text: w, type: "adverb" };
    if (lower.endsWith("tion") || lower.endsWith("ment") || lower.endsWith("ness")) return { text: w, type: "noun" };
    if (lower.endsWith("ed") || lower.endsWith("ing")) return { text: w, type: "verb" };
    if (lower.endsWith("ful") || lower.endsWith("ous") || lower.endsWith("ive")) return { text: w, type: "adjective" };
    return { text: w, type: "other" };
  });
}

// Simulate attention weights: content words and sentiment words get higher attention
function computeAttention(tokens: Token[]): number[] {
  const sentimentWords = new Set(["good", "bad", "happy", "sad", "depressed", "anxious", "lonely", "tired", "hopeless", "worthless", "empty", "numb", "exhausted", "love", "hate", "fear", "hope", "amazing", "terrible", "wonderful", "awful", "struggle", "suffer", "great", "beautiful", "horrible", "positive", "negative"]);
  const negators = new Set(["not", "never", "no"]);

  const raw = tokens.map((t) => {
    const w = t.text.toLowerCase();
    if (t.type === "punctuation") return 0.05;
    if (sentimentWords.has(w)) return 0.9 + Math.random() * 0.1;
    if (negators.has(w)) return 0.75;
    if (t.type === "noun") return 0.4 + Math.random() * 0.2;
    if (t.type === "verb") return 0.35 + Math.random() * 0.15;
    if (t.type === "adjective") return 0.55 + Math.random() * 0.2;
    if (t.type === "adverb") return 0.3 + Math.random() * 0.15;
    return 0.15 + Math.random() * 0.1;
  });

  // Normalize via softmax-like scaling
  const max = Math.max(...raw, 0.01);
  return raw.map((v) => v / max);
}

function analyzeText(text: string): AnalysisResult {
  const tokens = mockTokenize(text);
  const contentTokens = tokens.filter((t) => t.type !== "punctuation");
  const words = contentTokens.map((t) => t.text.toLowerCase());
  const uniqueWordsSet = new Set(words);
  const attentionWeights = computeAttention(tokens);

  const positive = new Set(["good", "great", "happy", "wonderful", "amazing", "beautiful", "love", "excellent", "fantastic", "positive", "best", "hope", "improve", "well", "fine", "better", "helpful", "strong"]);
  const negative = new Set(["bad", "sad", "terrible", "awful", "depressed", "anxious", "hate", "worst", "negative", "poor", "horrible", "lonely", "tired", "hopeless", "worthless", "empty", "numb", "exhausted", "struggle", "suffer", "fear"]);

  let rawScore = 0;
  let negated = false;
  tokens.forEach((t) => {
    const w = t.text.toLowerCase();
    if (w === "not" || w === "never" || w === "no" || w === "n't") { negated = true; return; }
    if (positive.has(w)) rawScore += negated ? -1 : 1;
    if (negative.has(w)) rawScore += negated ? 1 : -1;
    negated = false;
  });

  const sentimentPolarity = Math.tanh(rawScore * 0.4);
  const sentimentLabel = sentimentPolarity > 0.15 ? "Positive" : sentimentPolarity < -0.15 ? "Negative" : "Neutral";
  const lexicalDiversity = words.length > 0 ? uniqueWordsSet.size / words.length : 0;

  return {
    sentimentLabel,
    sentimentPolarity,
    lexicalDiversity,
    tokens,
    wordCount: words.length,
    uniqueWords: uniqueWordsSet.size,
    attentionWeights,
  };
}

const MetricBar = ({ label, value, color, displayValue }: { label: string; value: number; color: string; displayValue: string }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <span className="text-xs font-mono text-muted-foreground">{displayValue}</span>
    </div>
    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.abs(value) * 100}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

// Attention heatmap: color tokens by attention weight
const AttentionHeatmap = ({ tokens, weights }: { tokens: Token[]; weights: number[] }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-2 font-mono">Attention Weights (Simulated Self-Attention)</p>
    <div className="flex flex-wrap gap-1 p-3 rounded-lg bg-background/50 border border-border">
      {tokens.map((token, i) => {
        const w = weights[i] || 0;
        // Interpolate from cold (low attention) to hot (high attention)
        const hue = 30; // orange base
        const lightness = 85 - w * 50; // brighter = higher attention
        const opacity = 0.3 + w * 0.7;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="inline-flex flex-col items-center px-1.5 py-1 rounded text-xs font-mono cursor-default"
            style={{
              backgroundColor: `hsla(${hue}, 90%, ${lightness}%, ${opacity * 0.3})`,
              borderBottom: `2px solid hsla(${hue}, 90%, 50%, ${w})`,
            }}
            title={`Attention: ${(w * 100).toFixed(0)}%`}
          >
            <span className="font-medium text-foreground">{token.text}</span>
            <span className="text-[9px] text-muted-foreground">{(w * 100).toFixed(0)}%</span>
          </motion.span>
        );
      })}
    </div>
    <p className="mt-2 text-[10px] text-muted-foreground/60 italic">
      Warmer colors and thicker borders indicate higher attention. Sentiment-bearing words and negators receive the strongest focus.
    </p>
  </div>
);

const NLPSandbox = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult(analyzeText(input));
      setAnalyzing(false);
    }, 600);
  };

  const polarityColor = result
    ? result.sentimentPolarity > 0.15 ? "hsl(142, 70%, 49%)"
    : result.sentimentPolarity < -0.15 ? "hsl(0, 84%, 60%)"
    : "hsl(25, 95%, 55%)"
    : "hsl(215, 20%, 55%)";

  const diversityColor = result
    ? result.lexicalDiversity > 0.7 ? "hsl(142, 70%, 49%)"
    : result.lexicalDiversity > 0.4 ? "hsl(45, 90%, 55%)"
    : "hsl(0, 84%, 60%)"
    : "hsl(215, 20%, 55%)";

  return (
    <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        NLP Research Sandbox
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Type a sentence to see how text analysis pipelines process language. This mirrors the feature extraction used in depression detection research.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder="e.g. I feel so tired and empty all the time"
          className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !input.trim()}
          className="h-9 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {analyzing ? "..." : "Analyze"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Tokenization */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-mono">Tokenization / POS Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {result.tokens.map((token, i) => (
                  <span
                    key={i}
                    className="inline-flex flex-col items-center px-2 py-1 rounded text-xs font-mono"
                    style={{
                      backgroundColor: `${TOKEN_COLORS[token.type]}20`,
                      border: `1px solid ${TOKEN_COLORS[token.type]}40`,
                      color: TOKEN_COLORS[token.type],
                    }}
                  >
                    <span className="font-medium">{token.text}</span>
                    <span className="text-[9px] opacity-70">{TOKEN_LABELS[token.type]}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Attention Heatmap */}
            <AttentionHeatmap tokens={result.tokens} weights={result.attentionWeights} />

            {/* Multi-layer Metric Bars */}
            <div className="space-y-4 p-3 rounded-lg bg-background/50 border border-border">
              <p className="text-xs text-muted-foreground font-mono mb-1">Linguistic Metrics</p>

              <MetricBar
                label="Sentiment Polarity"
                value={(result.sentimentPolarity + 1) / 2}
                color={polarityColor}
                displayValue={`${result.sentimentLabel} (${result.sentimentPolarity > 0 ? "+" : ""}${result.sentimentPolarity.toFixed(2)})`}
              />

              <MetricBar
                label="Lexical Diversity (TTR)"
                value={result.lexicalDiversity}
                color={diversityColor}
                displayValue={`${result.lexicalDiversity.toFixed(2)} (${result.uniqueWords}/${result.wordCount} unique)`}
              />
            </div>

            {/* Research Context */}
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-xs font-semibold text-accent-foreground mb-2">How This Relates to Depression Detection</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Attention Weights</strong> show which tokens a transformer model focuses on most. In depression detection, models learn to attend to emotional markers, negation patterns, and first-person pronouns. The heatmap above simulates this selective focus.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                <strong>Sentiment Polarity</strong> measures positive or negative tone. Persistent negative polarity across language samples is a known marker of depressive states. Clinical models weigh specific word patterns and negation contexts rather than simple keyword matching.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                <strong>Lexical Diversity</strong> (Type-Token Ratio) captures how varied word choice is. Research shows that individuals with depression often use a smaller set of repeated words. This metric is one of several features fed into transformer-based classifiers for early screening.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2 italic">
                Note: This is a simplified simulation. Production systems use fine-tuned transformer models (e.g., BERT, RoBERTa) trained on clinical text corpora with validated diagnostic labels.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NLPSandbox;
