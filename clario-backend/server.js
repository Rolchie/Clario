const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const FormData = require("form-data");

// Import advanced analytics engines
const metricsEngine = require("./metricsEngine");
const pronunciationAnalyzer = require("./advancedPronunciationAnalyzer");
const coachingEngine = require("./advancedCoachingEngine");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://clario-ashen.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// ── File upload ───────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `audio_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// ── Scenario Configurations ────────────────────────────────────────────────────
const SCENARIO_CONFIGS = {
  "Thesis Defense": {
    displayName: "Thesis Defense",
    description: "Academic presentation requiring technical clarity and confidence",
    weights: { pronunciation: 0.35, pace: 0.25, fillers: 0.25, flow: 0.15 },
    paceRange: { min: 100, ideal: 130, max: 150 },
    fillerThreshold: 1,
    focusAreas: ["Technical terminology", "Confidence", "Logical structure", "Pronunciation clarity"],
    coachingFocus: "Deliver your research clearly and with confidence. Eliminate any hesitation.",
  },
  "Job Interview": {
    displayName: "Job Interview",
    description: "Professional conversation requiring confidence and clear answers",
    weights: { pronunciation: 0.35, pace: 0.20, fillers: 0.30, flow: 0.15 },
    paceRange: { min: 110, ideal: 135, max: 155 },
    fillerThreshold: 2,
    focusAreas: ["Confidence", "Clear answers", "No filler words", "Professional tone"],
    coachingFocus: "Answer with confidence and clarity. Avoid filler words. Sound professional.",
  },
  "Recitation": {
    displayName: "Recitation",
    description: "Artistic delivery with proper pacing and expression",
    weights: { pronunciation: 0.25, pace: 0.40, fillers: 0.15, flow: 0.20 },
    paceRange: { min: 80, ideal: 120, max: 140 },
    fillerThreshold: 1,
    focusAreas: ["Pacing and rhythm", "Pronunciation", "Expression", "Emotional delivery"],
    coachingFocus: "Focus on rhythm, pacing, and emotional expression.",
  },
  "General Speaking": {
    displayName: "General Speaking",
    description: "Free-form practice for any speaking situation",
    weights: { pronunciation: 0.30, pace: 0.25, fillers: 0.25, flow: 0.20 },
    paceRange: { min: 110, ideal: 140, max: 160 },
    fillerThreshold: 3,
    focusAreas: ["Overall fluency", "Filler words", "Pace", "Clarity"],
    coachingFocus: "Practice speaking naturally while maintaining clarity.",
  },
};

// ── OpenRouter API ────────────────────────────────────────────────────────────
async function callOpenRouter(prompt, model = 'anthropic/claude-sonnet-4-5', maxTokens = 1400) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Clario Speech Coach',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        console.error(`OpenRouter attempt ${attempt + 1} [${model}]:`, await res.text());
        continue;
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    } catch (e) {
      console.error(`OpenRouter attempt ${attempt + 1} [${model}]:`, e.message);
    }
  }
  return null;
}

const callClaude = (prompt, maxTokens = 1400) =>
  callOpenRouter(prompt, 'anthropic/claude-sonnet-4-5', maxTokens);

const callGemini = (prompt) =>
  callOpenRouter(prompt, 'google/gemini-3-flash', 800);

// ── Main Analysis Route ───────────────────────────────────────────────────────
app.post("/api/analyze", upload.single("audio"), async (req, res) => {
  const audioFile = req.file;
  const scenario = req.body.scenario || "General Speaking";
  const duration = parseFloat(req.body.duration) || 0;

  if (!audioFile) return res.status(400).json({ error: "No audio file provided." });

  let transcript = "";
  let whisperWords = [];

  try {
    // ── 1. TRANSCRIBE VIA GROQ WHISPER ────────────────────────────────────
    const groqForm = new FormData();
    groqForm.append("file", fs.createReadStream(audioFile.path), {
      filename: audioFile.filename,
      contentType: audioFile.mimetype || "audio/webm",
    });
    groqForm.append("model", "whisper-large-v3");
    groqForm.append("response_format", "verbose_json");
    groqForm.append("timestamp_granularities[]", "word");
    groqForm.append("language", "en");

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        ...groqForm.getHeaders(),
      },
      body: groqForm,
    });

    if (!groqRes.ok) throw new Error(`Transcription failed: ${await groqRes.text()}`);

    const groqData = await groqRes.json();
    transcript = (groqData.text || "").trim();
    whisperWords = groqData.words || [];
    const actualDuration = groqData.duration || duration;

    if (!transcript) throw new Error("No speech detected in recording.");

    // ── 2. PARSE SENTENCES WITH WORD-LEVEL DATA ──────────────────────────
    const scenarioConfig = SCENARIO_CONFIGS[scenario] || SCENARIO_CONFIGS["General Speaking"];
    const sentences = metricsEngine.parseSentences(transcript, whisperWords);

    // ── 3. ANALYZE EACH SENTENCE ──────────────────────────────────────────
    const sentenceAnalysis = sentences.map((sentence, idx) =>
      metricsEngine.analyzeSentence(sentence, idx, sentences.length, scenarioConfig, actualDuration)
    );

    // ── 4. AGGREGATE METRICS ──────────────────────────────────────────────
    const aggregatedMetrics = metricsEngine.aggregateMetrics(sentenceAnalysis, scenarioConfig);

    // ── 5. PRONUNCIATION ANALYSIS ─────────────────────────────────────────
    const allWords = transcript.split(/\s+/).filter(w => /[a-zA-Z]/.test(w));
    const pronunciationAnalysis = pronunciationAnalyzer.analyzePronunciationDetailed(allWords, whisperWords);

    // ── 6. BUILD DETAILED COACHING REPORT ─────────────────────────────────
    const coachingReport = coachingEngine.buildDetailedCoachingReport(
      aggregatedMetrics,
      sentenceAnalysis,
      scenario,
      scenarioConfig
    );

    // ── 7. CLEAN UP ───────────────────────────────────────────────────────
    fs.unlink(audioFile.path, () => {});

    // ── 8. RETURN COMPREHENSIVE RESPONSE ──────────────────────────────────
    res.json({
      // Basic info
      transcript,
      scenario,
      scenarioConfig: {
        displayName: scenarioConfig.displayName,
        description: scenarioConfig.description,
        focusAreas: scenarioConfig.focusAreas,
      },

      // Overall metrics
      metrics: {
        overall: aggregatedMetrics.overall,
        breakdown: aggregatedMetrics.breakdown,
        duration: Math.round(actualDuration || duration || 0),
      },

      // Sentence-by-sentence analysis
      sentenceAnalysis: sentenceAnalysis.map(s => ({
        index: s.index,
        text: s.text,
        wordCount: s.wordCount,
        score: s.score,
        status: s.status,
        
        // Detailed metrics per sentence
        pace: {
          wpm: s.pace.wpm,
          target: s.pace.targetWPM,
          status: s.pace.status,
        },
        pronunciation: {
          clarity: s.pronunciation.clarity,
          issues: s.pronunciation.issues.length,
        },
        flow: {
          score: s.flow.score,
          issues: s.flow.issues,
        },
        confidence: {
          score: s.confidence.score,
          assessment: s.confidence.assessment,
        },
        fillers: s.fillers.map(f => ({
          word: f.word,
          count: f.count,
          severity: f.severity,
        })),
        
        // Coaching for this sentence
        coaching: coachingEngine.buildSentenceCoaching(s),
      })),

      // Pronunciation analysis
      pronunciation: {
        priorityWords: pronunciationAnalysis.priorityWords.slice(0, 5).map(w => ({
          word: w.original,
          confidence: w.confidence,
          issue: w.likely_issue,
          recommendation: w.recommendation,
        })),
        summary: pronunciationAnalysis.summary,
        recommendations: pronunciationAnalysis.recommendations.slice(0, 3),
      },

      // Detailed coaching
      coaching: {
        strengths: coachingReport.strengths,
        improvements: coachingReport.improvements,
        actionableSteps: coachingReport.actionableSteps,
        challenge: coachingReport.challenge,
      },

      // Summary
      summary: {
        strengths: aggregatedMetrics.summary.strengths,
        weaknesses: aggregatedMetrics.summary.weaknesses,
        worstSentences: aggregatedMetrics.summary.worstSentences,
        totalSentences: aggregatedMetrics.summary.sentenceCount,
        avgWordsPerSentence: aggregatedMetrics.summary.avgWordsPerSentence,
      },
    });

  } catch (err) {
    console.error("Analysis error:", err.message);
    if (audioFile?.path) fs.unlink(audioFile.path, () => {});
    res.status(500).json({ error: err.message || "Analysis failed." });
  }
});

app.get("/api/health", (req, res) => 
  res.json({ status: "CLARIO backend running ✓", version: "2.0-advanced" })
);

app.listen(PORT, () => 
  console.log(`🎙️  CLARIO backend listening on port ${PORT}`)
);
