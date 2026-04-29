// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED METRICS ENGINE - Detailed Speech Analysis with Sentence Breakdown
// ═══════════════════════════════════════════════════════════════════════════════

const { analyzeWordDifficulty } = require("./pronunciationAnalyzer");

// ── SENTENCE PARSER ────────────────────────────────────────────────────────────
// Splits transcript into sentences with word positions and Whisper confidence data
function parseSentences(transcript, whisperWords = []) {
  if (!transcript) return [];

  // Build word confidence map from Whisper data
  const whisperMap = {};
  if (whisperWords && whisperWords.length > 0) {
    whisperWords.forEach((w, idx) => {
      const cleanWord = (w.word || "").toLowerCase().replace(/[^a-z']/g, "");
      if (!whisperMap[cleanWord]) {
        whisperMap[cleanWord] = [];
      }
      whisperMap[cleanWord].push({
        confidence: w.probability ?? w.confidence ?? 0.95,
        index: idx,
        original: w.word
      });
    });
  }

  // Split by sentence-ending punctuation
  const sentences = transcript
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0)
    .map(sentence => {
      const words = sentence.trim().split(/\s+/);
      const cleanWords = words.map(w => w.toLowerCase().replace(/[^a-z']/g, ""));
      
      // Map words to Whisper confidence
      const enrichedWords = words.map((word, idx) => {
        const cleanWord = cleanWords[idx];
        const whisperData = whisperMap[cleanWord]?.[0] || {};
        
        return {
          original: word,
          clean: cleanWord,
          confidence: whisperData.confidence ?? 0.95,
          index: idx,
          isComplex: analyzeWordDifficulty(cleanWord)?.difficulty === 'hard',
          length: cleanWord.length
        };
      });

      return {
        raw: sentence.trim(),
        words: enrichedWords,
        wordCount: enrichedWords.filter(w => /[a-zA-Z]/.test(w.original)).length,
        avgConfidence: enrichedWords.length > 0
          ? Math.round((enrichedWords.reduce((sum, w) => sum + w.confidence, 0) / enrichedWords.length) * 100)
          : 95,
        hasFillers: false,
        fillers: [],
        pace: 0,
        clarity: 0,
        flow: 0
      };
    });

  return sentences;
}

// ── FILLER DETECTION (Enhanced) ────────────────────────────────────────────────
// Returns: { word, count, confidence, positions, severity }
function detectFillersInSentence(sentenceText) {
  const lower = sentenceText.toLowerCase();
  const fillers = {};

  // Hard fillers with positions
  const hardFillers = ["uh", "um", "uhm", "ah", "er", "hmm", "eh", "huh", "hm"];
  hardFillers.forEach(f => {
    const re = new RegExp(`(?:^|\\s)(${f})(?=\\s|[,!?.']|$)`, "gi");
    let match;
    while ((match = re.exec(lower)) !== null) {
      if (!fillers[f]) fillers[f] = { count: 0, positions: [], severity: "hard" };
      fillers[f].count++;
      fillers[f].positions.push(match.index);
    }
  });

  // Multi-word fillers
  const multiWordFillers = ["you know", "i mean", "kind of", "sort of", "i think", "you see", "i guess"];
  multiWordFillers.forEach(f => {
    const re = new RegExp(f.replace(/\s+/, "\\s+"), "gi");
    let match;
    while ((match = re.exec(lower)) !== null) {
      if (!fillers[f]) fillers[f] = { count: 0, positions: [], severity: "medium" };
      fillers[f].count++;
      fillers[f].positions.push(match.index);
    }
  });

  // Context-aware "like"
  const likeFillerRe = /(?:(?:was|were|am|is|are|be|been|i'm|he's|she's|it's|they're|we're|and|so|but|then|just)\s+like\b|\blike\s+(?:really|so|very|totally|super|you know|kind of|basically|actually|um|uh))/gi;
  let match;
  while ((match = likeFillerRe.exec(lower)) !== null) {
    if (!fillers["like"]) fillers["like"] = { count: 0, positions: [], severity: "medium" };
    fillers["like"].count++;
    fillers["like"].positions.push(match.index);
  }

  // Soft fillers at boundaries
  const softFillers = ["basically", "actually", "literally", "right", "well", "okay"];
  softFillers.forEach(f => {
    const re = new RegExp(`(?:^|[,!?.\\s])(${f})(?=[,!?.\\s]|$)`, "gi");
    while ((match = re.exec(lower)) !== null) {
      if (!fillers[f]) fillers[f] = { count: 0, positions: [], severity: "soft" };
      fillers[f].count++;
      fillers[f].positions.push(match.index);
    }
  });

  return Object.entries(fillers).map(([word, data]) => ({
    word,
    count: data.count,
    positions: data.positions,
    severity: data.severity,
    confidence: data.severity === "hard" ? 95 : data.severity === "medium" ? 80 : 60
  }));
}

// ── PACE ANALYSIS (per sentence) ────────────────────────────────────────────────
// Returns: { wpm, adjustment, isConsistent, status }
function analyzePaceSentence(wordCount, estimatedDuration, scenarioConfig) {
  const wpm = estimatedDuration > 0
    ? Math.round((wordCount / estimatedDuration) * 60)
    : 0;

  const { min: minWPM, ideal: idealWPM, max: maxWPM } = scenarioConfig.paceRange;

  let adjustment = 0;
  let status = "ideal";

  if (wpm < minWPM) {
    adjustment = ((minWPM - wpm) / minWPM) * 100;
    status = "too slow";
  } else if (wpm > maxWPM) {
    adjustment = ((wpm - maxWPM) / maxWPM) * 100;
    status = "too fast";
  }

  return {
    wpm,
    targetWPM: idealWPM,
    adjustment: Math.round(adjustment),
    status,
    inRange: wpm >= minWPM && wpm <= maxWPM
  };
}

// ── PRONUNCIATION CLARITY ANALYSIS ─────────────────────────────────────────────
// Multi-factor approach: Whisper confidence + word complexity + consonant patterns
function analyzePronunciationSentence(words, lowConfThreshold = 0.75) {
  if (!words || words.length === 0) {
    return { clarity: 95, issues: [], score: 100 };
  }

  const lowConfWords = words.filter(w => w.confidence < lowConfThreshold);
  const complexWords = words.filter(w => w.isComplex);
  const finalConsonantWords = words.filter(w => /[dtg]$/.test(w.clean));

  // Base clarity from Whisper confidence
  const baseClarity = Math.round(
    words.reduce((sum, w) => sum + (w.confidence * 100), 0) / words.length
  );

  // Penalties
  let penaltyPoints = 0;
  const issues = [];

  // Low confidence words (heavy penalty)
  if (lowConfWords.length > 0) {
    penaltyPoints += lowConfWords.length * 8;
    issues.push({
      type: "unclear words",
      words: lowConfWords.map(w => w.original),
      impact: lowConfWords.length * 8
    });
  }

  // Complex words (medium penalty)
  if (complexWords.length > 0) {
    penaltyPoints += complexWords.length * 4;
    issues.push({
      type: "complex pronunciation",
      words: complexWords.map(w => w.original),
      impact: complexWords.length * 4
    });
  }

  // Final consonants (Filipino-specific, light penalty)
  if (finalConsonantWords.length > 0) {
    const avgConfFinal = finalConsonantWords.reduce((sum, w) => sum + w.confidence, 0) / finalConsonantWords.length;
    if (avgConfFinal < 0.80) {
      penaltyPoints += 3;
      issues.push({
        type: "final consonant clarity",
        words: finalConsonantWords.map(w => w.original),
        impact: 3
      });
    }
  }

  const finalClarity = Math.max(40, baseClarity - penaltyPoints);
  const score = Math.round((finalClarity / 100) * 100);

  return {
    clarity: Math.round(finalClarity),
    baseClarity,
    penaltyPoints,
    lowConfWords: lowConfWords.length,
    complexWords: complexWords.length,
    issues,
    score
  };
}

// ── FLOW & CONSISTENCY ANALYSIS ────────────────────────────────────────────────
// Analyzes pause patterns, sentence length variation, vocabulary diversity
function analyzeFlowSentence(sentenceIndex, totalSentences, wordCount, fillers) {
  const issues = [];
  let flowScore = 100;

  // Sentence length consistency check
  if (wordCount < 3) {
    issues.push("Very short sentence - may indicate hesitation");
    flowScore -= 10;
  } else if (wordCount > 40) {
    issues.push("Very long sentence - may lack clarity");
    flowScore -= 15;
  }

  // Filler density impact on flow
  const fillerCount = fillers.reduce((sum, f) => sum + f.count, 0);
  if (fillerCount > 0) {
    const fillerDensity = (fillerCount / Math.max(1, wordCount)) * 100;
    if (fillerDensity > 10) {
      issues.push(`High filler density (${Math.round(fillerDensity)}%) - disrupts flow`);
      flowScore -= Math.min(25, fillerDensity * 2);
    }
  }

  // Hard filler penalty on flow
  const hardFillers = fillers.filter(f => f.severity === "hard");
  if (hardFillers.length > 0) {
    issues.push(`Hard fillers (um/uh) detected - breaks natural rhythm`);
    flowScore -= hardFillers.reduce((sum, f) => sum + (f.count * 5), 0);
  }

  return {
    score: Math.max(30, flowScore),
    issues,
    fillerDensity: fillerCount > 0 ? Math.round((fillerCount / Math.max(1, wordCount)) * 100) : 0
  };
}

// ── CONFIDENCE DETECTION ───────────────────────────────────────────────────────
// Uses filler placement, pause positioning, and word stress patterns
function detectConfidenceSentence(sentenceText, fillers, clarity, wordCount) {
  const lower = sentenceText.toLowerCase();
  let confidenceScore = 100;
  const indicators = [];

  // Fillers at beginning = low confidence
  const beginingFillers = fillers.filter(f => f.positions[0] < 10);
  if (beginingFillers.length > 0) {
    confidenceScore -= 15;
    indicators.push("Hesitation at start");
  }

  // Multiple fillers = anxiety
  const totalFillers = fillers.reduce((sum, f) => sum + f.count, 0);
  if (totalFillers > 3) {
    confidenceScore -= 20;
    indicators.push("Multiple hesitations");
  }

  // Low clarity with fillers = uncertainty
  if (clarity < 75 && totalFillers > 0) {
    confidenceScore -= 15;
    indicators.push("Unclear speech with hesitation");
  }

  // Short words or very long sentences = uncertainty
  if (wordCount > 30) {
    confidenceScore -= 10;
    indicators.push("Long rambling sentences");
  }

  // Positive indicators
  if (clarity > 85 && totalFillers === 0) {
    confidenceScore = Math.min(100, confidenceScore + 10);
    indicators.push("Clear, confident delivery");
  }

  return {
    score: Math.max(20, confidenceScore),
    indicators,
    assessment: confidenceScore >= 75 ? "High" : confidenceScore >= 50 ? "Moderate" : "Low"
  };
}

// ── EMPHASIS & PROMINENCE ANALYSIS ─────────────────────────────────────────────
// Detects which words lack emphasis based on repetition, position, and length
function analyzeEmphasisSentence(words, sentenceText) {
  const analysis = {
    keyWords: [],
    weakWords: [],
    emphasisScore: 80
  };

  if (!words || words.length === 0) return analysis;

  // Key words = longer, more complex words, or sentence starters
  const keywordCandidates = words.filter((w, idx) => 
    w.length > 6 || (w.isComplex && w.length > 4) || idx === 0
  );

  // Weak words = short, repeated, filler-adjacent
  const weakCandidates = words.filter(w => 
    w.length <= 3 && w.original.toLowerCase() !== "i" && w.original.toLowerCase() !== "the"
  );

  analysis.keyWords = keywordCandidates.slice(0, 3);
  analysis.weakWords = weakCandidates.slice(0, 2);
  analysis.emphasisScore = keywordCandidates.length > 0 ? 85 : 60;

  return analysis;
}

// ── COMPREHENSIVE SENTENCE ANALYSIS ────────────────────────────────────────────
function analyzeSentence(sentence, sentenceIndex, totalSentences, scenarioConfig, estimatedDuration) {
  // Parse sentence metadata
  const words = sentence.words;
  const wordCount = sentence.wordCount;

  // Detect fillers in this sentence
  const fillers = detectFillersInSentence(sentence.raw);

  // Analyze each dimension
  const paceMetics = analyzePaceSentence(wordCount, estimatedDuration / totalSentences, scenarioConfig);
  const pronunciationMetrics = analyzePronunciationSentence(words);
  const flowMetrics = analyzeFlowSentence(sentenceIndex, totalSentences, wordCount, fillers);
  const confidenceMetrics = detectConfidenceSentence(sentence.raw, fillers, pronunciationMetrics.clarity, wordCount);
  const emphasisMetrics = analyzeEmphasisSentence(words, sentence.raw);

  // Calculate sentence-level scores
  const sentenceScore = Math.round(
    (pronunciationMetrics.score * 0.25) +
    (paceMetics.inRange ? 100 : Math.max(50, 100 - (paceMetics.adjustment * 2))) * 0.25 +
    (flowMetrics.score * 0.25) +
    (confidenceMetrics.score * 0.25)
  );

  return {
    index: sentenceIndex + 1,
    text: sentence.raw,
    wordCount,
    wordList: words.map(w => w.original),
    
    // Detailed metrics
    pace: paceMetics,
    pronunciation: pronunciationMetrics,
    flow: flowMetrics,
    confidence: confidenceMetrics,
    emphasis: emphasisMetrics,
    fillers,

    // Overall sentence health
    score: sentenceScore,
    status: sentenceScore >= 80 ? "strong" : sentenceScore >= 60 ? "fair" : "needs improvement",
    
    // Key issues in this sentence
    issues: [
      ...pronunciationMetrics.issues,
      ...flowMetrics.issues,
      ...(confidenceMetrics.indicators.length > 0 ? [{ type: "confidence", details: confidenceMetrics.indicators }] : []),
      ...(fillers.length > 0 ? [{ type: "fillers", details: fillers }] : [])
    ].slice(0, 3) // Top 3 issues per sentence
  };
}

// ── OVERALL METRICS AGGREGATOR ─────────────────────────────────────────────────
function aggregateMetrics(sentences, scenarioConfig) {
  if (sentences.length === 0) {
    return {
      overall: 0,
      breakdown: { pace: 0, pronunciation: 0, flow: 0, confidence: 0 },
      summary: {}
    };
  }

  const paceScores = sentences.map(s => s.pace.inRange ? 100 : Math.max(50, 100 - (s.pace.adjustment * 2)));
  const pronunciationScores = sentences.map(s => s.pronunciation.score);
  const flowScores = sentences.map(s => s.flow.score);
  const confidenceScores = sentences.map(s => s.confidence.score);

  const avgPace = Math.round(paceScores.reduce((a, b) => a + b, 0) / paceScores.length);
  const avgPronunciation = Math.round(pronunciationScores.reduce((a, b) => a + b, 0) / pronunciationScores.length);
  const avgFlow = Math.round(flowScores.reduce((a, b) => a + b, 0) / flowScores.length);
  const avgConfidence = Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length);

  const overallScore = Math.round(
    (avgPace * scenarioConfig.weights.pace) +
    (avgPronunciation * scenarioConfig.weights.pronunciation) +
    (avgFlow * scenarioConfig.weights.flow) +
    (avgConfidence * 0.1) // Confidence is bonus metric
  );

  // Identify strengths and weaknesses
  const scores = [
    { dimension: "Pronunciation", score: avgPronunciation },
    { dimension: "Pace", score: avgPace },
    { dimension: "Flow", score: avgFlow },
    { dimension: "Confidence", score: avgConfidence }
  ];

  const strengths = scores.filter(s => s.score >= 80).map(s => s.dimension);
  const weaknesses = scores.filter(s => s.score < 70).map(s => s.dimension);

  // Find worst-performing sentences
  const worstSentences = sentences
    .map((s, idx) => ({ ...s, index: idx + 1 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  return {
    overall: overallScore,
    breakdown: {
      pace: avgPace,
      pronunciation: avgPronunciation,
      flow: avgFlow,
      confidence: avgConfidence
    },
    summary: {
      strengths,
      weaknesses,
      worstSentences: worstSentences.map(s => ({
        index: s.index,
        score: s.score,
        status: s.status,
        mainIssue: s.issues[0]?.type || "overall clarity"
      })),
      sentenceCount: sentences.length,
      avgWordsPerSentence: Math.round(sentences.reduce((sum, s) => sum + s.wordCount, 0) / sentences.length)
    }
  };
}

module.exports = {
  parseSentences,
  detectFillersInSentence,
  analyzePaceSentence,
  analyzePronunciationSentence,
  analyzeFlowSentence,
  detectConfidenceSentence,
  analyzeEmphasisSentence,
  analyzeSentence,
  aggregateMetrics
};
