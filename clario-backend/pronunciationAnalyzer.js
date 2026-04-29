// ── Advanced Pronunciation Analysis ───────────────────────────────────────────
// Detects word difficulty, phonetic patterns, and targeted pronunciation focus areas

// Common phoneme combinations that are difficult to pronounce
const DIFFICULT_PHONEMES = {
  // Consonant clusters - initial position
  'str': 'consonant cluster (str)',
  'shr': 'consonant cluster (shr)',
  'scr': 'consonant cluster (scr)',
  'thr': 'consonant cluster (thr)',
  'spl': 'consonant cluster (spl)',
  'spr': 'consonant cluster (spr)',
  'sch': 'consonant cluster (sch)',
  'chr': 'consonant cluster (chr)',
  'phr': 'consonant cluster (phr)',
  'gr': 'consonant cluster (gr)',
  'dr': 'consonant cluster (dr)',
  'br': 'consonant cluster (br)',
  'cr': 'consonant cluster (cr)',
  'fr': 'consonant cluster (fr)',
  'pr': 'consonant cluster (pr)',
  'tr': 'consonant cluster (tr)',
  
  // Consonant clusters - final position
  'nch': 'consonant cluster (nch)',
  'nge': 'consonant cluster (nge)',
  'rch': 'consonant cluster (rch)',
  'lch': 'consonant cluster (lch)',
  'rth': 'consonant cluster (rth)',
  'lth': 'consonant cluster (lth)',
  'nce': 'consonant cluster (nce)',
  'nt': 'consonant cluster (nt)',
  'nd': 'consonant cluster (nd)',
  'ng': 'consonant cluster (ng)',
  'ld': 'consonant cluster (ld)',
  'lf': 'consonant cluster (lf)',
  'lt': 'consonant cluster (lt)',
  'st': 'consonant cluster (st)',
  'ct': 'consonant cluster (ct)',
  'pt': 'consonant cluster (pt)',
  'ft': 'consonant cluster (ft)',
  'sk': 'consonant cluster (sk)',
  'sp': 'consonant cluster (sp)',
  
  // Difficult consonant pairs and sounds
  'th': 'difficult consonant (th)',
  'zh': 'difficult consonant (zh)',
  'gh': 'silent consonant (gh)',
  'ph': 'consonant digraph (ph)',
  'wh': 'consonant digraph (wh)',
  'ps': 'consonant pair (ps)',
  'pn': 'consonant pair (pn)',
  'mn': 'consonant pair (mn)',
  'kn': 'consonant pair (kn)',
  
  // Vowel diphthongs and complex patterns
  'ough': 'irregular vowel pattern (ough)',
  'ight': 'complex vowel pattern (ight)',
  'augh': 'complex vowel pattern (augh)',
  'ough': 'complex vowel pattern (ough)',
  'eigh': 'complex vowel pattern (eigh)',
  'ough': 'variable vowel pattern (ough)',
  'eous': 'vowel suffix (eous)',
  'ious': 'vowel suffix (ious)',
  'ual': 'vowel pattern (ual)',
  'uous': 'vowel pattern (uous)',
  'aeo': 'vowel sequence (aeo)',
  'eau': 'vowel sequence (eau)',
};

// Words commonly mispronounced (with difficulty score 1-5)
const COMMON_MISPRONOUNCED = {
  // Classic mispronunciations
  'pronunciation': 5, 'worcester': 5, 'quinoa': 4, 'february': 4,
  'squirrel': 4, 'colonel': 4, 'queue': 3, 'wednesday': 4,
  'library': 3, 'jewelry': 3, 'probably': 3, 'environment': 4,
  'restaurant': 4, 'basically': 4, 'literally': 4, 'specific': 3,
  'accommodate': 4, 'necessary': 4, 'conscientious': 5, 'paradigm': 4,
  'entrepreneur': 4, 'surveillance': 4, 'comfortable': 4, 'privilege': 4,
  
  // Geographic & foreign origin
  'worcestershire': 5, 'bourgeois': 4, 'debris': 3, 'rendezvous': 4,
  'schedule': 3, 'cologne': 3, 'detroit': 3, 'hawaii': 3,
  
  // Scientific & technical
  'hierarchy': 4, 'otolaryngology': 5, 'isthmus': 4, 'thyroid': 3,
  'metabolism': 4, 'pneumonia': 3, 'epilepsy': 4, 'pharmaceutical': 5,
  'photosynthesis': 4, 'morphine': 3, 'estrogen': 3, 'testosterone': 4,
  'psychologist': 4, 'psychiatrist': 4, 'archaeology': 4, 'zoology': 3,
  
  // Business & professional
  'confidentiality': 5, 'analytics': 3, 'algorithm': 3, 'semantics': 3,
  'infrastructure': 4, 'logistics': 3, 'bureaucracy': 4, 'audit': 2,
  'portfolio': 3, 'synthesis': 3, 'leverage': 3, 'prioritize': 3,
  'accountability': 4, 'incentive': 3, 'acquisition': 4, 'franchise': 3,
  'subsidiary': 4, 'hierarchy': 4, 'coalition': 3, 'advocacy': 3,
  
  // Education & academia
  'thesis': 3, 'dissertation': 4, 'bibliography': 4, 'linguistics': 4,
  'pedagogy': 4, 'curriculum': 3, 'exegesis': 4, 'epistemology': 5,
  'metaphor': 3, 'allegory': 3, 'irony': 2, 'rhetoric': 3,
  
  // Medical & anatomy
  'stethoscope': 4, 'larynx': 3, 'esophagus': 4, 'trachea': 3,
  'diaphragm': 3, 'bronchitis': 4, 'appendicitis': 4, 'cholesterol': 4,
  'arrhythmia': 4, 'myocardial': 4, 'hemorrhage': 4, 'pneumonia': 3,
  'anesthetic': 4, 'sphygmomanometer': 5, 'renin': 2, 'glucose': 3,
  'visceral': 3, 'peristalsis': 4, 'phagocyte': 3, 'lymphocyte': 4,
  
  // General vocabulary
  'wednesday': 4, 'vehicle': 3, 'atheist': 3, 'height': 2,
  'anxiety': 3, 'niche': 3, 'subtle': 3, 'subpoena': 4,
  'mischievous': 4, 'heinous': 3, 'choir': 3, 'yacht': 3,
  'pneumatic': 4, 'wrestle': 3, 'island': 3, 'receipt': 3,
  'auxiliary': 4, 'arctic': 3, 'harassment': 4, 'bouquet': 3,
  'bureaucrat': 4, 'chasm': 3, 'closure': 3, 'draught': 3,
  'epitome': 3, 'espresso': 3, 'facade': 3, 'genre': 3,
  'gouge': 2, 'heinous': 3, 'hyperbole': 4, 'islet': 2,
  'liaison': 3, 'nuclei': 3, 'osteoporosis': 5, 'queue': 3,
  'quixotic': 4, 'salmon': 3, 'segue': 3, 'silhouette': 4,
  'statistics': 4, 'supposedly': 4, 'tsunami': 3, 'wednesday': 4,
  'worcester': 5, 'xerox': 3, 'zealous': 3, 'zodiac': 3,
  
  // Common modern words
  'gif': 2, 'cache': 2, 'router': 3, 'wifi': 2, 'jpeg': 3,
  'debut': 3, 'depot': 3, 'microsoft': 3, 'amazon': 3,
  'google': 2, 'hyundai': 3, 'lamborghini': 4, 'porsche': 3,
  'renault': 3, 'versailles': 4, 'minuscule': 4, 'sherbet': 3,
  
  // Words with silent letters (extra tricky)
  'knight': 3, 'gnome': 2, 'psychology': 4, 'pneumonia': 3,
  'mnemonic': 4, 'pterodactyl': 5, 'ptomaine': 4, 'gnocchi': 3,
  'coup': 2, 'debris': 3, 'salmon': 3, 'plumber': 3,
  'thumb': 2, 'subtle': 3, 'receipt': 3, 'debt': 2,
  'doubt': 2, 'island': 3, 'castle': 3, 'wrestle': 3,
  'aisle': 2, 'hour': 2, 'honest': 2, 'herb': 2,
  'rhythm': 4, 'pneumatic': 4, 'asthma': 3, 'baptism': 3,
  
  // Foreign borrowings
  'renaissance': 4, 'cliche': 3, 'entrepreneur': 4, 'resume': 3,
  'ballet': 3, 'buffet': 3, 'fiancé': 3, 'touché': 3,
  'café': 2, 'naïve': 2, 'cliché': 3, 'détente': 3,
  'blasé': 2, 'passé': 2, 'début': 3, 'dossier': 3,
  'rapport': 3, 'regime': 3, 'elite': 2, 'prestige': 3,
  'repertoire': 4, 'soirée': 3, 'genre': 3, 'matinee': 3,
  'rendezvous': 4, 'garage': 3, 'mirage': 3, 'montage': 3,
  'massage': 3, 'fatigue': 3, 'intrigue': 3, 'espionage': 4,
  'sabotage': 3, 'boutique': 3, 'antique': 3, 'critique': 3,
  'physique': 3, 'mystique': 3, 'technique': 3, 'unique': 3,
  'boutonniere': 5, 'chauffeur': 3, 'cuisine': 3, 'debris': 3,
  'faux': 2, 'lieu': 2, 'prix': 2, 'tort': 2,
};

/**
 * Count syllables in a word using a simple heuristic
 * Counts vowel groups + adjusts for silent e's
 */
function getSyllableCount(word) {
  if (!word || word.length < 3) return 1;
  
  const lower = word.toLowerCase();
  let count = 0;
  let previousWasVowel = false;
  const vowels = 'aeiouy';
  
  for (let char of lower) {
    const isVowel = vowels.includes(char);
    if (isVowel && !previousWasVowel) count++;
    previousWasVowel = isVowel;
  }
  
  // Adjust for silent e
  if (lower.endsWith('e')) count--;
  
  // Adjust for le ending
  if (lower.endsWith('le') && lower.length > 2 && !vowels.includes(lower[lower.length - 3])) {
    count++;
  }
  
  return Math.max(1, count);
}

/**
 * Analyze a single word for pronunciation difficulty
 * Returns: { word, difficulty, syllables, patterns, score (0-100) }
 */
function analyzeWordDifficulty(word) {
  if (!word || word.length < 2) return null;
  
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  const syllables = getSyllableCount(lower);
  const patterns = [];
  let difficultyScore = 0;
  
  // Check for known difficult words
  if (COMMON_MISPRONOUNCED[lower]) {
    difficultyScore += COMMON_MISPRONOUNCED[lower] * 15;
    patterns.push('commonly mispronounced');
  }
  
  // Check for phonetic patterns
  for (const [pattern, description] of Object.entries(DIFFICULT_PHONEMES)) {
    if (lower.includes(pattern)) {
      difficultyScore += 20;
      patterns.push(description);
    }
  }
  
  // Syllable complexity: 4+ syllables = harder
  if (syllables >= 4) {
    difficultyScore += (syllables - 3) * 15;
    patterns.push(`${syllables} syllables`);
  }
  
  // Word length factor: very long words are harder
  if (lower.length >= 10) {
    difficultyScore += Math.min(25, (lower.length - 9) * 5);
    patterns.push('long word');
  }
  
  // Cap at 100
  difficultyScore = Math.min(100, difficultyScore);
  
  // Determine difficulty level
  let difficulty = 'easy';
  if (difficultyScore >= 60) difficulty = 'hard';
  else if (difficultyScore >= 35) difficulty = 'moderate';
  
  return {
    word,
    difficulty,
    syllables,
    patterns: [...new Set(patterns)], // Remove duplicates
    score: difficultyScore,
  };
}

/**
 * Analyze a list of words and return top difficult ones
 * Sorted by: Whisper confidence + pronunciation difficulty
 */
function identifyPronunciationFocusWords(words, whisperConfidenceData = {}) {
  if (!words || words.length === 0) return [];
  
  const analyzed = words
    .map(word => analyzeWordDifficulty(word))
    .filter(Boolean);
  
  // Score each word based on:
  // 1. Whisper confidence (if available)
  // 2. Pronunciation difficulty
  const scored = analyzed.map(analysis => {
    const word = analysis.word.toLowerCase();
    const whisperConfidence = whisperConfidenceData[word] || 85; // Default high confidence
    
    // Lower whisper confidence + higher difficulty = higher priority
    const confidencePenalty = Math.max(0, 100 - whisperConfidence);
    const focusScore = (confidencePenalty * 0.6) + (analysis.score * 0.4);
    
    return {
      ...analysis,
      focusScore: Math.round(focusScore),
      whisperConfidence,
    };
  });
  
  // Sort by focus score (highest = most important to focus on)
  return scored.sort((a, b) => b.focusScore - a.focusScore);
}

// Filipino speaker-specific pronunciation patterns
const FILIPINO_ACCENT_CHALLENGES = {
  // Word-final consonant clusters (Filipinos often drop final consonants)
  'words': 'final consonant cluster (words)',
  'calls': 'final consonant cluster (calls)',
  'builds': 'final consonant cluster (builds)',
  'tasks': 'final consonant cluster (tasks)',
  'helps': 'final consonant cluster (helps)',
  'wants': 'final consonant cluster (wants)',
  'attempts': 'final consonant cluster (attempts)',
  'strengths': 'final consonant cluster (strengths)',
  
  // TH sound confusion (Filipino lacks this sound)
  'thought': 'th sound challenge',
  'through': 'th sound challenge',
  'thing': 'th sound challenge',
  'this': 'th sound challenge',
  'that': 'th sound challenge',
  'than': 'th sound challenge',
  'thanks': 'th sound challenge',
  'theme': 'th sound challenge',
  'theory': 'th sound challenge',
  'therefore': 'th sound challenge',
  'bathrooms': 'th sound challenge',
  'mathematics': 'th sound challenge',
  'therapeutic': 'th sound challenge',
  'synthesis': 'th sound challenge',
  'enthusiastic': 'th sound challenge',
  
  // V/F confusion (Filipino P/F similarity)
  'very': 'v sound challenge',
  'value': 'v sound challenge',
  'view': 'v sound challenge',
  'various': 'v sound challenge',
  'give': 'v sound challenge',
  'heavy': 'v sound challenge',
  'forever': 'v sound challenge',
  'available': 'v sound challenge',
  'November': 'v sound challenge',
  'achievement': 'v sound challenge',
  'behavior': 'v sound challenge',
  'involvement': 'v sound challenge',
  
  // R/L confusion
  'really': 'r/l confusion risk',
  'role': 'r/l confusion risk',
  'rule': 'r/l confusion risk',
  'read': 'r/l confusion risk',
  'research': 'r/l confusion risk',
  'result': 'r/l confusion risk',
  'large': 'r/l confusion risk',
  'learn': 'r/l confusion risk',
  'culture': 'r/l confusion risk',
  'literature': 'r/l confusion risk',
  'material': 'r/l confusion risk',
  'natural': 'r/l confusion risk',
  'general': 'r/l confusion risk',
  'international': 'r/l confusion risk',
  
  // Stress pattern issues
  'important': 'stress pattern difficulty',
  'development': 'stress pattern difficulty',
  'information': 'stress pattern difficulty',
  'education': 'stress pattern difficulty',
  'community': 'stress pattern difficulty',
  'technology': 'stress pattern difficulty',
  'government': 'stress pattern difficulty',
  'entertainment': 'stress pattern difficulty',
  'responsibility': 'stress pattern difficulty',
  'organization': 'stress pattern difficulty',
};

/**
 * Detect phonetic patterns that affect pronunciation in context
 */
function detectPhoneticPatterns(transcript) {
  if (!transcript) return {};
  
  const lower = transcript.toLowerCase();
  const patterns = {};
  
  // Unstressed syllables (words that tend to be mumbled)
  const unStressed = ['the', 'a', 'and', 'or', 'to', 'at', 'in', 'on', 'is', 'are', 'was', 'been', 'have', 'had', 'do', 'does', 'can', 'could', 'will', 'would', 'should'];
  unStressed.forEach(word => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    if (count > 0) patterns[word] = { count, type: 'unstressed', priority: 'low' };
  });
  
  // Weak vowel patterns (schwa sound - ə)
  const schwaWords = ['about', 'comma', 'sofa', 'agenda', 'america', 'banana', 'camera', 'animal', 'problem', 'system', 'person', 'family', 'library', 'history', 'memory', 'energy'];
  schwaWords.forEach(word => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length;
    if (count > 0) patterns[word] = { count, type: 'schwa-sound', priority: 'medium' };
  });
  
  // Filipino-specific pronunciation challenges
  Object.keys(FILIPINO_ACCENT_CHALLENGES).forEach(word => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length;
    if (count > 0) {
      patterns[word] = { 
        count, 
        type: FILIPINO_ACCENT_CHALLENGES[word],
        priority: 'high'
      };
    }
  });
  
  // Stress pattern words (often mispronounced due to stress)
  const stressWords = ['emphasis', 'opposite', 'present', 'record', 'conflict', 'permit', 'produce', 'refuse', 'subject', 'object', 'suspect', 'address', 'progress', 'project'];
  stressWords.forEach(word => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length;
    if (count > 0) patterns[word] = { count, type: 'stress-dependent', priority: 'high' };
  });
  
  return patterns;
}

/**
 * Generate targeted pronunciation tips based on analysis
 */
function generatePronunciationTips(focusWords, analysis) {
  const tips = [];
  
  focusWords.slice(0, 4).forEach(word => {
    let technique = '';
    const patterns = word.patterns || [];
    
    // TH sound specific guidance
    if (patterns.some(p => p.includes('th'))) {
      technique = `"TH" sound: Place your tongue BETWEEN your upper and lower teeth. Blow air out gently. Practice: "this", "that", "think", "thanks". Don't substitute with "s" or "f".`;
    }
    // V sound guidance
    else if (patterns.some(p => p.includes('v sound'))) {
      technique = `"V" sound: Touch your lower lip to your upper teeth. Make a buzzing sound. Say "very", "value", "give" slowly. Don't confuse with "f" sound.`;
    }
    // R/L confusion
    else if (patterns.some(p => p.includes('r/l'))) {
      technique = `R vs L: For "R" - curl tongue slightly, say from back of mouth. For "L" - touch tongue to roof of mouth. Practice minimal pairs: "read/lead", "role/lole", "rock/lock".`;
    }
    // Consonant clusters
    else if (patterns.some(p => p.includes('consonant cluster'))) {
      const clusterPattern = patterns.find(p => p.includes('consonant cluster'));
      if (clusterPattern.includes('(str)') || clusterPattern.includes('(shr)') || clusterPattern.includes('(scr)')) {
        technique = `Consonant cluster: Pronounce each consonant separately first. Example: S-T-R or S-H-R. Then blend smoothly. Slow practice → normal speed.`;
      } else if (clusterPattern.includes('final')) {
        technique = `Final consonants: Don't drop the ending sounds. Say clearly: "tasks" (not "task"), "words" (not "word"), "helps" (not "help"). Over-pronounce slightly.`;
      } else {
        technique = `Consonant cluster: Break into smaller parts. Say each sound clearly. Build up to full word speed.`;
      }
    }
    // Stress pattern difficulty
    else if (patterns.some(p => p.includes('stress pattern'))) {
      technique = `Stress pattern: The emphasis is on different syllables than you might think. Listen to native speakers on YouGlish.com. Record and compare your pronunciation.`;
    }
    // Syllable-based guidance
    else if (word.syllables >= 5) {
      technique = `${word.syllables} syllables: Say each part slowly: ${word.word.split(/[aeiou]+/).filter(Boolean).slice(0, 4).join('-')}. Master each syllable before speaking full word.`;
    }
    else if (word.syllables >= 4) {
      technique = `Enunciate all ${word.syllables} syllables clearly. Don't rush through. Practice at 3/4 normal speed first.`;
    }
    // Irregular/silent letter patterns
    else if (patterns.some(p => p.includes('irregular') || p.includes('silent'))) {
      technique = `Irregular pronunciation pattern. Visit YouGlish.com to hear native speakers say this word. Repeat the recording slowly, then at normal speed.`;
    }
    // Commonly mispronounced
    else if (patterns.some(p => p.includes('commonly mispronounced'))) {
      technique = `This word is frequently mispronounced. Check pronunciation apps like Forvo or YouGlish. Practice with native speaker audio 5-10 times.`;
    }
    // Foreign words
    else if (patterns.some(p => p.includes('Foreign') || word.word.includes('é') || word.word.includes('à'))) {
      technique = `Foreign origin word. Pay attention to accents and stress. Use Forvo.com to hear native French/Spanish pronunciation. Mimic carefully.`;
    }
    // Vowel patterns
    else if (patterns.some(p => p.includes('vowel'))) {
      technique = `Complex vowel pattern. Listen to the vowel sound carefully. Repeat pronunciation slowly, then gradually increase speed.`;
    }
    // General guidance
    else if (!technique) {
      technique = `Enunciate clearly. Record yourself and listen back. Compare with native speaker on YouGlish.com. Identify the specific difficult part and drill it.`;
    }
    
    tips.push({
      word: word.word,
      difficulty: word.difficulty,
      syllables: word.syllables,
      patterns: patterns.slice(0, 2), // Top 2 patterns only
      technique,
      focusScore: word.focusScore,
    });
  });
  
  return tips;
}

/**
 * Calculate pronunciation score based on multiple factors
 */
function calculatePronunciationScore(avgConfidence, lowConfidenceCount, focusWords) {
  let score = Math.min(100, avgConfidence);
  
  // Penalize for low-confidence words
  // Each low-confidence word reduces score by 2 points
  score = Math.max(0, score - (lowConfidenceCount * 2));
  
  // Bonus if user handled difficult words well
  // (high difficulty words but not in low-confidence list)
  const hardWordsHandledWell = focusWords.filter(w => w.difficulty === 'hard').length;
  if (hardWordsHandledWell > 0 && lowConfidenceCount === 0) {
    score = Math.min(100, score + 5);
  }
  
  return Math.round(score);
}

/**
 * Analyze entire speech for Filipino accent patterns
 */
function analyzeFilipinoAccentPatterns(transcript, confidenceMap = {}) {
  if (!transcript) return { patterns: [], severity: 'low' };
  
  const lower = transcript.toLowerCase();
  const detectedPatterns = [];
  let totalPatternOccurrences = 0;
  
  // Check for each challenge
  Object.entries(FILIPINO_ACCENT_CHALLENGES).forEach(([word, challenge]) => {
    const count = (lower.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length;
    if (count > 0) {
      const wordConfidence = confidenceMap[word] || 85;
      // Flag if confidence is low for known challenge words
      if (wordConfidence < 80) {
        detectedPatterns.push({
          word,
          challenge,
          occurrences: count,
          confidence: wordConfidence,
          severity: wordConfidence < 70 ? 'high' : 'medium'
        });
        totalPatternOccurrences += count;
      }
    }
  });
  
  // Sort by severity and frequency
  detectedPatterns.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.occurrences - a.occurrences;
  });
  
  // Overall severity assessment
  let overallSeverity = 'low';
  if (detectedPatterns.filter(p => p.severity === 'high').length > 2) overallSeverity = 'high';
  else if (detectedPatterns.length > 4) overallSeverity = 'medium';
  
  return {
    patterns: detectedPatterns.slice(0, 5), // Top 5 patterns
    totalOccurrences: totalPatternOccurrences,
    severity: overallSeverity,
    recommendation: generateAccentRecommendation(detectedPatterns, overallSeverity)
  };
}

/**
 * Generate specific accent improvement recommendations
 */
function generateAccentRecommendation(patterns, severity) {
  if (patterns.length === 0) {
    return "Your accent is clear! Continue maintaining consistent pronunciation practice.";
  }
  
  const topPatterns = patterns.slice(0, 2).map(p => p.challenge).join(', ');
  
  if (severity === 'high') {
    return `Focus on these challenges: ${topPatterns}. Practice these specific sounds 10 minutes daily with native speaker audio (YouGlish.com). Record yourself weekly to track progress.`;
  } else if (severity === 'medium') {
    return `Work on improving: ${topPatterns}. Dedicate 5 minutes daily to these pronunciations. Watch English movies with subtitles to reinforce correct pronunciation.`;
  } else {
    return `Minor accent issues detected with: ${topPatterns}. Continue regular practice and you'll achieve native-like pronunciation soon.`;
  }
}

/**
 * Get pronunciation resources for a specific word
 */
function getPronunciationResources(word) {
  const lower = word.toLowerCase();
  
  // Check word database
  const difficulty = analyzeWordDifficulty(word);
  
  return {
    word,
    difficulty: difficulty?.difficulty || 'unknown',
    resources: {
      youglish: `https://youglish.com/search/${encodeURIComponent(word)}`,
      forvo: `https://forvo.com/search/${encodeURIComponent(word)}/`,
      cambridgeDictionary: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(lower)}`,
      merriamWebster: `https://www.merriam-webster.com/dictionary/${encodeURIComponent(lower)}`,
      oxyfordLearners: `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(lower)}`
    },
    tips: generatePronunciationTips([difficulty], {})
  };
}

/**
 * Compare two pronunciations and identify differences
 */
function comparePronunciations(word, userConfidence, nativeConfidence = 95) {
  const analysis = analyzeWordDifficulty(word);
  const difference = nativeConfidence - userConfidence;
  
  return {
    word,
    userConfidence,
    nativeConfidence,
    gap: difference,
    assessment: difference < 5 ? 'excellent' : difference < 15 ? 'good' : difference < 25 ? 'needs-work' : 'significant-issues',
    improvementNeeded: Math.ceil(difference / 5) // weeks to improve
  };
}

/**
 * Generate a weekly pronunciation improvement plan
 */
function generateWeeklyPlan(focusWords, currentScore = 75) {
  const plan = {
    week: 1,
    goal: Math.min(100, currentScore + 10),
    dailyFocus: [],
    weeklyGoal: `Improve pronunciation score from ${currentScore} to ${Math.min(100, currentScore + 10)}`,
    totalMinutesPerDay: 15,
    activities: []
  };
  
  // Assign focus words to days
  focusWords.slice(0, 5).forEach((word, index) => {
    const day = Math.floor(index / 1) + 1;
    if (!plan.dailyFocus[day]) plan.dailyFocus[day] = [];
    plan.dailyFocus[day].push(word.word);
  });
  
  // Add activities
  plan.activities = [
    { day: 'Daily', activity: 'Record yourself speaking for 60 seconds', duration: '5 min' },
    { day: 'Daily', activity: 'Listen to native speakers on YouGlish', duration: '5 min' },
    { day: 'Daily', activity: 'Mimic pronunciation at normal and slow speed', duration: '5 min' },
    { day: 'Tue/Thu', activity: 'Video call with native English speaker', duration: '15 min' },
    { day: 'Weekend', activity: 'Review and practice all week\'s focus words', duration: '20 min' }
  ];
  
  return plan;
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
  DIFFICULT_PHONEMES,
  COMMON_MISPRONOUNCED,
  FILIPINO_ACCENT_CHALLENGES,
};
