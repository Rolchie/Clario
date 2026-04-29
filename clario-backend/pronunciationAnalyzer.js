// ── Advanced Pronunciation Analysis ───────────────────────────────────────────
// Detects word difficulty, phonetic patterns, and targeted pronunciation focus areas

const DIFFICULT_PHONEMES = {
  str: "consonant cluster (str)",
  shr: "consonant cluster (shr)",
  scr: "consonant cluster (scr)",
  thr: "consonant cluster (thr)",
  spl: "consonant cluster (spl)",
  spr: "consonant cluster (spr)",
  sch: "consonant cluster (sch)",
  chr: "consonant cluster (chr)",
  phr: "consonant cluster (phr)",
  gr: "consonant cluster (gr)",
  dr: "consonant cluster (dr)",
  br: "consonant cluster (br)",
  cr: "consonant cluster (cr)",
  fr: "consonant cluster (fr)",
  pr: "consonant cluster (pr)",
  tr: "consonant cluster (tr)",

  nch: "consonant cluster (nch)",
  nge: "consonant cluster (nge)",
  rch: "consonant cluster (rch)",
  lch: "consonant cluster (lch)",
  rth: "consonant cluster (rth)",
  lth: "consonant cluster (lth)",
  nce: "consonant cluster (nce)",
  nt: "consonant cluster (nt)",
  nd: "consonant cluster (nd)",
  ng: "consonant cluster (ng)",
  ld: "consonant cluster (ld)",
  lf: "consonant cluster (lf)",
  lt: "consonant cluster (lt)",
  st: "consonant cluster (st)",
  ct: "consonant cluster (ct)",
  pt: "consonant cluster (pt)",
  ft: "consonant cluster (ft)",
  sk: "consonant cluster (sk)",
  sp: "consonant cluster (sp)",

  th: "difficult consonant (th)",
  zh: "difficult consonant (zh)",
  gh: "silent consonant (gh)",
  ph: "consonant digraph (ph)",
  wh: "consonant digraph (wh)",
  ps: "consonant pair (ps)",
  pn: "consonant pair (pn)",
  mn: "consonant pair (mn)",
  kn: "consonant pair (kn)",

  ough: "variable vowel pattern (ough)",
  ight: "complex vowel pattern (ight)",
  augh: "complex vowel pattern (augh)",
  eigh: "complex vowel pattern (eigh)",
  eous: "vowel suffix (eous)",
  ious: "vowel suffix (ious)",
  ual: "vowel pattern (ual)",
  uous: "vowel pattern (uous)",
  aeo: "vowel sequence (aeo)",
  eau: "vowel sequence (eau)",
};

const COMMON_MISPRONOUNCED = {
  pronunciation: 5,
  worcester: 5,
  quinoa: 4,
  february: 4,
  squirrel: 4,
  colonel: 4,
  queue: 3,
  wednesday: 4,
  library: 3,
  jewelry: 3,
  probably: 3,
  environment: 4,
  restaurant: 4,
  basically: 4,
  literally: 4,
  specific: 3,
  accommodate: 4,
  necessary: 4,
  conscientious: 5,
  paradigm: 4,
  entrepreneur: 4,
  surveillance: 4,
  comfortable: 4,
  privilege: 4,
  worcestershire: 5,
  bourgeois: 4,
  debris: 3,
  rendezvous: 4,
  schedule: 3,
  cologne: 3,
  detroit: 3,
  hawaii: 3,
  hierarchy: 4,
  otolaryngology: 5,
  isthmus: 4,
  thyroid: 3,
  metabolism: 4,
  pneumonia: 3,
  epilepsy: 4,
  pharmaceutical: 5,
  photosynthesis: 4,
  morphine: 3,
  estrogen: 3,
  testosterone: 4,
  psychologist: 4,
  psychiatrist: 4,
  archaeology: 4,
  zoology: 3,
  confidentiality: 5,
  analytics: 3,
  algorithm: 3,
  semantics: 3,
  infrastructure: 4,
  logistics: 3,
  bureaucracy: 4,
  audit: 2,
  portfolio: 3,
  synthesis: 3,
  leverage: 3,
  prioritize: 3,
  accountability: 4,
  incentive: 3,
  acquisition: 4,
  franchise: 3,
  subsidiary: 4,
  coalition: 3,
  advocacy: 3,
  thesis: 3,
  dissertation: 4,
  bibliography: 4,
  linguistics: 4,
  pedagogy: 4,
  curriculum: 3,
  exegesis: 4,
  epistemology: 5,
  metaphor: 3,
  allegory: 3,
  irony: 2,
  rhetoric: 3,
  stethoscope: 4,
  larynx: 3,
  esophagus: 4,
  trachea: 3,
  diaphragm: 3,
  bronchitis: 4,
  appendicitis: 4,
  cholesterol: 4,
  arrhythmia: 4,
  myocardial: 4,
  hemorrhage: 4,
  anesthetic: 4,
  sphygmomanometer: 5,
  renin: 2,
  glucose: 3,
  visceral: 3,
  peristalsis: 4,
  phagocyte: 3,
  lymphocyte: 4,
  vehicle: 3,
  atheist: 3,
  height: 2,
  anxiety: 3,
  niche: 3,
  subtle: 3,
  subpoena: 4,
  mischievous: 4,
  heinous: 3,
  choir: 3,
  yacht: 3,
  pneumatic: 4,
  wrestle: 3,
  island: 3,
  receipt: 3,
  auxiliary: 4,
  arctic: 3,
  harassment: 4,
  bouquet: 3,
  bureaucrat: 4,
  chasm: 3,
  closure: 3,
  draught: 3,
  epitome: 3,
  espresso: 3,
  facade: 3,
  genre: 3,
  gouge: 2,
  hyperbole: 4,
  islet: 2,
  liaison: 3,
  nuclei: 3,
  osteoporosis: 5,
  quixotic: 4,
  salmon: 3,
  segue: 3,
  silhouette: 4,
  statistics: 4,
  supposedly: 4,
  tsunami: 3,
  xerox: 3,
  zealous: 3,
  zodiac: 3,
  gif: 2,
  cache: 2,
  router: 3,
  wifi: 2,
  jpeg: 3,
  debut: 3,
  depot: 3,
  microsoft: 3,
  amazon: 3,
  google: 2,
  hyundai: 3,
  lamborghini: 4,
  porsche: 3,
  renault: 3,
  versailles: 4,
  minuscule: 4,
  sherbet: 3,
  knight: 3,
  gnome: 2,
  psychology: 4,
  mnemonic: 4,
  pterodactyl: 5,
  ptomaine: 4,
  gnocchi: 3,
  coup: 2,
  plumber: 3,
  thumb: 2,
  debt: 2,
  doubt: 2,
  castle: 3,
  aisle: 2,
  hour: 2,
  honest: 2,
  herb: 2,
  rhythm: 4,
  asthma: 3,
  baptism: 3,
  renaissance: 4,
  cliche: 3,
  resume: 3,
  ballet: 3,
  buffet: 3,
  fiancé: 3,
  touché: 3,
  café: 2,
  naïve: 2,
  cliché: 3,
  détente: 3,
  blasé: 2,
  passé: 2,
  début: 3,
  dossier: 3,
  rapport: 3,
  regime: 3,
  elite: 2,
  prestige: 3,
  repertoire: 4,
  soirée: 3,
  matinee: 3,
  garage: 3,
  mirage: 3,
  montage: 3,
  massage: 3,
  fatigue: 3,
  intrigue: 3,
  espionage: 4,
  sabotage: 3,
  boutique: 3,
  antique: 3,
  critique: 3,
  physique: 3,
  mystique: 3,
  technique: 3,
  unique: 3,
  boutonniere: 5,
  chauffeur: 3,
  cuisine: 3,
  faux: 2,
  lieu: 2,
  prix: 2,
  tort: 2,
};

const FILIPINO_ACCENT_CHALLENGES = {
  words: "final consonant cluster (words)",
  calls: "final consonant cluster (calls)",
  builds: "final consonant cluster (builds)",
  tasks: "final consonant cluster (tasks)",
  helps: "final consonant cluster (helps)",
  wants: "final consonant cluster (wants)",
  attempts: "final consonant cluster (attempts)",
  strengths: "final consonant cluster (strengths)",

  thought: "th sound challenge",
  through: "th sound challenge",
  thing: "th sound challenge",
  this: "th sound challenge",
  that: "th sound challenge",
  than: "th sound challenge",
  thanks: "th sound challenge",
  theme: "th sound challenge",
  theory: "th sound challenge",
  therefore: "th sound challenge",
  bathrooms: "th sound challenge",
  mathematics: "th sound challenge",
  therapeutic: "th sound challenge",
  synthesis: "th sound challenge",
  enthusiastic: "th sound challenge",

  very: "v sound challenge",
  value: "v sound challenge",
  view: "v sound challenge",
  various: "v sound challenge",
  give: "v sound challenge",
  heavy: "v sound challenge",
  forever: "v sound challenge",
  available: "v sound challenge",
  November: "v sound challenge",
  achievement: "v sound challenge",
  behavior: "v sound challenge",
  involvement: "v sound challenge",

  really: "r/l confusion risk",
  role: "r/l confusion risk",
  rule: "r/l confusion risk",
  read: "r/l confusion risk",
  research: "r/l confusion risk",
  result: "r/l confusion risk",
  large: "r/l confusion risk",
  learn: "r/l confusion risk",
  culture: "r/l confusion risk",
  literature: "r/l confusion risk",
  material: "r/l confusion risk",
  natural: "r/l confusion risk",
  general: "r/l confusion risk",
  international: "r/l confusion risk",

  important: "stress pattern difficulty",
  development: "stress pattern difficulty",
  information: "stress pattern difficulty",
  education: "stress pattern difficulty",
  community: "stress pattern difficulty",
  technology: "stress pattern difficulty",
  government: "stress pattern difficulty",
  entertainment: "stress pattern difficulty",
  responsibility: "stress pattern difficulty",
  organization: "stress pattern difficulty",
};

function normalizeWord(word) {
  return String(word || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function getSyllableCount(word) {
  if (!word || word.length < 3) return 1;

  const lower = word.toLowerCase();
  let count = 0;
  let previousWasVowel = false;
  const vowels = "aeiouy";

  for (let char of lower) {
    const isVowel = vowels.includes(char);
    if (isVowel && !previousWasVowel) count++;
    previousWasVowel = isVowel;
  }

  if (lower.endsWith("e")) count--;

  if (
    lower.endsWith("le") &&
    lower.length > 2 &&
    !vowels.includes(lower[lower.length - 3])
  ) {
    count++;
  }

  return Math.max(1, count);
}

function analyzeWordDifficulty(word) {
  if (!word || word.length < 2) return null;

  const lower = normalizeWord(word);
  if (!lower) return null;

  const syllables = getSyllableCount(lower);
  const patterns = [];
  let difficultyScore = 0;

  if (COMMON_MISPRONOUNCED[lower]) {
    difficultyScore += COMMON_MISPRONOUNCED[lower] * 15;
    patterns.push("commonly mispronounced");
  }

  for (const [pattern, description] of Object.entries(DIFFICULT_PHONEMES)) {
    if (lower.includes(pattern)) {
      difficultyScore += 20;
      patterns.push(description);
    }
  }

  if (FILIPINO_ACCENT_CHALLENGES[lower]) {
    difficultyScore += 25;
    patterns.push(FILIPINO_ACCENT_CHALLENGES[lower]);
  }

  if (syllables >= 4) {
    difficultyScore += (syllables - 3) * 15;
    patterns.push(`${syllables} syllables`);
  }

  if (lower.length >= 10) {
    difficultyScore += Math.min(25, (lower.length - 9) * 5);
    patterns.push("long word");
  }

  difficultyScore = Math.min(100, difficultyScore);

  let difficulty = "easy";
  if (difficultyScore >= 60) difficulty = "hard";
  else if (difficultyScore >= 35) difficulty = "moderate";

  return {
    word,
    difficulty,
    syllables,
    patterns: [...new Set(patterns)],
    score: difficultyScore,
  };
}

function identifyPronunciationFocusWords(words, whisperConfidenceData = {}) {
  if (!words || words.length === 0) return [];

  const analyzed = words
    .map((word) => analyzeWordDifficulty(word))
    .filter(Boolean);

  const scored = analyzed.map((analysis) => {
    const word = normalizeWord(analysis.word);
    const whisperConfidence = whisperConfidenceData[word] || 85;
    const confidencePenalty = Math.max(0, 100 - whisperConfidence);
    const focusScore = confidencePenalty * 0.6 + analysis.score * 0.4;

    return {
      ...analysis,
      focusScore: Math.round(focusScore),
      whisperConfidence,
    };
  });

  return scored.sort((a, b) => b.focusScore - a.focusScore);
}

function detectPhoneticPatterns(transcript) {
  if (!transcript) return {};

  const lower = transcript.toLowerCase();
  const patterns = {};

  const unStressed = [
    "the",
    "a",
    "and",
    "or",
    "to",
    "at",
    "in",
    "on",
    "is",
    "are",
    "was",
    "been",
    "have",
    "had",
    "do",
    "does",
    "can",
    "could",
    "will",
    "would",
    "should",
  ];

  unStressed.forEach((word) => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
    if (count > 0) patterns[word] = { count, type: "unstressed", priority: "low" };
  });

  const schwaWords = [
    "about",
    "comma",
    "sofa",
    "agenda",
    "america",
    "banana",
    "camera",
    "animal",
    "problem",
    "system",
    "person",
    "family",
    "library",
    "history",
    "memory",
    "energy",
  ];

  schwaWords.forEach((word) => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, "gi")) || []).length;
    if (count > 0) patterns[word] = { count, type: "schwa-sound", priority: "medium" };
  });

  Object.keys(FILIPINO_ACCENT_CHALLENGES).forEach((word) => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, "gi")) || []).length;
    if (count > 0) {
      patterns[word] = {
        count,
        type: FILIPINO_ACCENT_CHALLENGES[word],
        priority: "high",
      };
    }
  });

  const stressWords = [
    "emphasis",
    "opposite",
    "present",
    "record",
    "conflict",
    "permit",
    "produce",
    "refuse",
    "subject",
    "object",
    "suspect",
    "address",
    "progress",
    "project",
  ];

  stressWords.forEach((word) => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, "gi")) || []).length;
    if (count > 0) patterns[word] = { count, type: "stress-dependent", priority: "high" };
  });

  return patterns;
}

function generatePronunciationTips(focusWords, analysis = {}) {
  const tips = [];

  focusWords.slice(0, 4).forEach((word) => {
    if (!word) return;

    let technique = "";
    const patterns = word.patterns || [];

    if (patterns.some((p) => p.includes("th"))) {
      technique =
        '"TH" sound: Place your tongue BETWEEN your upper and lower teeth. Blow air out gently. Practice: "this", "that", "think", "thanks".';
    } else if (patterns.some((p) => p.includes("v sound"))) {
      technique =
        '"V" sound: Touch your lower lip to your upper teeth. Make a buzzing sound. Say "very", "value", "give" slowly.';
    } else if (patterns.some((p) => p.includes("r/l"))) {
      technique =
        'R vs L: For "R", curl the tongue slightly. For "L", touch the tongue to the roof of the mouth.';
    } else if (patterns.some((p) => p.includes("consonant cluster"))) {
      technique =
        "Consonant cluster: Break the word into smaller sound parts, pronounce each consonant clearly, then blend smoothly.";
    } else if (patterns.some((p) => p.includes("stress pattern"))) {
      technique =
        "Stress pattern: Listen to native pronunciation and identify which syllable receives the strongest emphasis.";
    } else if (word.syllables >= 4) {
      technique = `Enunciate all ${word.syllables} syllables clearly. Practice slowly first, then increase speed.`;
    } else if (patterns.some((p) => p.includes("irregular") || p.includes("silent"))) {
      technique =
        "Irregular pronunciation pattern: Listen to native examples and repeat slowly before using normal speed.";
    } else if (patterns.some((p) => p.includes("commonly mispronounced"))) {
      technique =
        "This word is commonly mispronounced. Compare your pronunciation with native speaker audio and repeat it several times.";
    } else {
      technique =
        "Enunciate clearly. Record yourself, listen back, and compare with native speaker pronunciation.";
    }

    tips.push({
      word: word.word,
      difficulty: word.difficulty,
      syllables: word.syllables,
      patterns: patterns.slice(0, 2),
      technique,
      focusScore: word.focusScore,
    });
  });

  return tips;
}

function calculatePronunciationScore(avgConfidence, lowConfidenceCount, focusWords) {
  let score = Math.min(100, avgConfidence);
  score = Math.max(0, score - lowConfidenceCount * 2);

  const hardWordsHandledWell = focusWords.filter((w) => w.difficulty === "hard").length;

  if (hardWordsHandledWell > 0 && lowConfidenceCount === 0) {
    score = Math.min(100, score + 5);
  }

  return Math.round(score);
}

function analyzeFilipinoAccentPatterns(transcript, confidenceMap = {}) {
  if (!transcript) return { patterns: [], severity: "low" };

  const lower = transcript.toLowerCase();
  const detectedPatterns = [];
  let totalPatternOccurrences = 0;

  Object.entries(FILIPINO_ACCENT_CHALLENGES).forEach(([word, challenge]) => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, "gi")) || []).length;

    if (count > 0) {
      const wordConfidence = confidenceMap[word] || 85;

      if (wordConfidence < 80) {
        detectedPatterns.push({
          word,
          challenge,
          occurrences: count,
          confidence: wordConfidence,
          severity: wordConfidence < 70 ? "high" : "medium",
        });

        totalPatternOccurrences += count;
      }
    }
  });

  detectedPatterns.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };

    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }

    return b.occurrences - a.occurrences;
  });

  let overallSeverity = "low";
  if (detectedPatterns.filter((p) => p.severity === "high").length > 2) {
    overallSeverity = "high";
  } else if (detectedPatterns.length > 4) {
    overallSeverity = "medium";
  }

  return {
    patterns: detectedPatterns.slice(0, 5),
    totalOccurrences: totalPatternOccurrences,
    severity: overallSeverity,
    recommendation: generateAccentRecommendation(detectedPatterns, overallSeverity),
  };
}

function generateAccentRecommendation(patterns, severity) {
  if (patterns.length === 0) {
    return "Your accent is clear. Continue maintaining consistent pronunciation practice.";
  }

  const topPatterns = patterns.slice(0, 2).map((p) => p.challenge).join(", ");

  if (severity === "high") {
    return `Focus on these challenges: ${topPatterns}. Practice these sounds daily with native speaker audio.`;
  }

  if (severity === "medium") {
    return `Work on improving: ${topPatterns}. Dedicate a few minutes daily to these pronunciations.`;
  }

  return `Minor accent issues detected with: ${topPatterns}. Continue regular practice.`;
}

function getPronunciationResources(word) {
  const lower = normalizeWord(word);
  const difficulty = analyzeWordDifficulty(word);

  return {
    word,
    difficulty: difficulty?.difficulty || "unknown",
    resources: {
      youglish: `https://youglish.com/search/${encodeURIComponent(word)}`,
      forvo: `https://forvo.com/search/${encodeURIComponent(word)}/`,
      cambridgeDictionary: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(lower)}`,
      merriamWebster: `https://www.merriam-webster.com/dictionary/${encodeURIComponent(lower)}`,
      oxfordLearners: `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(lower)}`,
    },
    tips: difficulty ? generatePronunciationTips([difficulty], {}) : [],
  };
}

function comparePronunciations(word, userConfidence, nativeConfidence = 95) {
  const difference = nativeConfidence - userConfidence;

  return {
    word,
    userConfidence,
    nativeConfidence,
    gap: difference,
    assessment:
      difference < 5
        ? "excellent"
        : difference < 15
        ? "good"
        : difference < 25
        ? "needs-work"
        : "significant-issues",
    improvementNeeded: Math.ceil(difference / 5),
  };
}

function generateWeeklyPlan(focusWords, currentScore = 75) {
  const plan = {
    week: 1,
    goal: Math.min(100, currentScore + 10),
    dailyFocus: [],
    weeklyGoal: `Improve pronunciation score from ${currentScore} to ${Math.min(
      100,
      currentScore + 10
    )}`,
    totalMinutesPerDay: 15,
    activities: [],
  };

  focusWords.slice(0, 5).forEach((word, index) => {
    const day = index + 1;
    if (!plan.dailyFocus[day]) plan.dailyFocus[day] = [];
    plan.dailyFocus[day].push(word.word);
  });

  plan.activities = [
    { day: "Daily", activity: "Record yourself speaking for 60 seconds", duration: "5 min" },
    { day: "Daily", activity: "Listen to native speakers on YouGlish", duration: "5 min" },
    { day: "Daily", activity: "Mimic pronunciation at normal and slow speed", duration: "5 min" },
    { day: "Weekend", activity: "Review and practice all focus words", duration: "20 min" },
  ];

  return plan;
}

/**
 * Main function used by server.js
 */
function analyzePronunciationDetailed(allWords = [], whisperWords = []) {
  const cleanWords = allWords.map(normalizeWord).filter(Boolean);
  const confidenceMap = {};

  whisperWords.forEach((item) => {
    const word = normalizeWord(item.word);

    if (!word) return;

    let confidence = item.probability ?? item.confidence ?? 0.85;

    if (confidence <= 1) {
      confidence = Math.round(confidence * 100);
    } else {
      confidence = Math.round(confidence);
    }

    confidenceMap[word] = confidence;
  });

  const focusWords = identifyPronunciationFocusWords(cleanWords, confidenceMap);

  const lowConfidenceWords = focusWords.filter(
    (word) => Number(word.whisperConfidence) < 80
  );

  const confidenceValues = Object.values(confidenceMap);

  const avgConfidence =
    confidenceValues.length > 0
      ? Math.round(
          confidenceValues.reduce((sum, value) => sum + value, 0) /
            confidenceValues.length
        )
      : 85;

  const score = calculatePronunciationScore(
    avgConfidence,
    lowConfidenceWords.length,
    focusWords
  );

  const transcript = cleanWords.join(" ");

  return {
    score,
    avgConfidence,
    lowConfidenceCount: lowConfidenceWords.length,
    lowConfidenceWords,
    focusWords: focusWords.slice(0, 8),
    tips: generatePronunciationTips(focusWords, {}),
    phoneticPatterns: detectPhoneticPatterns(transcript),
    accentAnalysis: analyzeFilipinoAccentPatterns(transcript, confidenceMap),
  };
}

module.exports = {
  getSyllableCount,
  analyzeWordDifficulty,
  identifyPronunciationFocusWords,
  detectPhoneticPatterns,
  generatePronunciationTips,
  calculatePronunciationScore,
  analyzeFilipinoAccentPatterns,
  generateAccentRecommendation,
  getPronunciationResources,
  comparePronunciations,
  generateWeeklyPlan,
  analyzePronunciationDetailed,
  DIFFICULT_PHONEMES,
  COMMON_MISPRONOUNCED,
  FILIPINO_ACCENT_CHALLENGES,
};