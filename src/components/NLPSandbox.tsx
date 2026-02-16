import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Token {
  text: string;
  type: "noun" | "verb" | "adjective" | "adverb" | "other" | "punctuation";
}

interface SentimentResult {
  label: string;
  score: number;
  tokens: Token[];
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

// Simple mock POS tagger
function mockTokenize(text: string): Token[] {
  const nouns = new Set(["model", "sentence", "analysis", "data", "text", "research", "depression", "language", "word", "detection", "system", "network", "learning", "transformer", "attention", "token", "embedding", "vector", "classification", "sentiment", "person", "world", "thing", "life", "time", "day", "way", "people", "man", "woman", "child"]);
  const verbs = new Set(["is", "are", "was", "were", "have", "has", "had", "do", "does", "did", "run", "detect", "analyze", "predict", "train", "process", "classify", "feel", "think", "know", "want", "need", "use", "find", "give", "tell", "work", "call", "try", "ask", "seem", "come", "go", "make", "take", "see", "look", "get", "say"]);
  const adjectives = new Set(["good", "bad", "happy", "sad", "great", "small", "large", "deep", "new", "old", "high", "low", "long", "short", "natural", "neural", "fine", "beautiful", "terrible", "wonderful", "awful", "amazing", "depressed", "anxious", "positive", "negative"]);
  const adverbs = new Set(["very", "really", "quite", "always", "never", "often", "sometimes", "well", "badly", "quickly", "slowly", "not", "also", "just", "still", "already"]);
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
    // Default heuristic: ends in -ly → adverb, -tion/-ment/-ness → noun, -ed/-ing → verb
    if (lower.endsWith("ly")) return { text: w, type: "adverb" };
    if (lower.endsWith("tion") || lower.endsWith("ment") || lower.endsWith("ness")) return { text: w, type: "noun" };
    if (lower.endsWith("ed") || lower.endsWith("ing")) return { text: w, type: "verb" };
    if (lower.endsWith("ful") || lower.endsWith("ous") || lower.endsWith("ive")) return { text: w, type: "adjective" };
    return { text: w, type: "other" };
  });
}

function mockSentiment(tokens: Token[]): { label: string; score: number } {
  const positive = new Set(["good", "great", "happy", "wonderful", "amazing", "beautiful", "love", "excellent", "fantastic", "positive", "best"]);
  const negative = new Set(["bad", "sad", "terrible", "awful", "depressed", "anxious", "hate", "worst", "negative", "poor", "horrible"]);
  let score = 0;
  let negated = false;
  tokens.forEach((t) => {
    const w = t.text.toLowerCase();
    if (w === "not" || w === "never" || w === "no") { negated = true; return; }
    if (positive.has(w)) score += negated ? -1 : 1;
    if (negative.has(w)) score += negated ? 1 : -1;
    negated = false;
  });
  const normalized = Math.tanh(score * 0.5);
  const label = normalized > 0.15 ? "Positive" : normalized < -0.15 ? "Negative" : "Neutral";
  return { label, score: Math.round((normalized + 1) * 50) / 100 };
}

const NLPSandbox = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setAnalyzing(true);
    // Simulate processing delay
    setTimeout(() => {
      const tokens = mockTokenize(input);
      const sentiment = mockSentiment(tokens);
      setResult({ ...sentiment, tokens });
      setAnalyzing(false);
    }, 600);
  };

  const sentimentColor = result?.label === "Positive" ? "hsl(142, 70%, 49%)" : result?.label === "Negative" ? "hsl(0, 84%, 60%)" : "hsl(25, 95%, 55%)";

  return (
    <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Model Sandbox
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Type a sentence to see mock tokenization and sentiment analysis. This demonstrates the NLP pipeline used in depression detection research.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder="e.g. I feel really happy about this research"
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
            className="space-y-4"
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

            {/* Sentiment */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-mono">Sentiment Classification</p>
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-md text-sm font-semibold"
                  style={{
                    backgroundColor: `${sentimentColor}20`,
                    border: `1px solid ${sentimentColor}40`,
                    color: sentimentColor,
                  }}
                >
                  {result.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: sentimentColor }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {result.score.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NLPSandbox;
