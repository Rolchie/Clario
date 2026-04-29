// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED COACHING ENGINE
// Detailed, scenario-specific feedback with actionable micro-challenges
// ═══════════════════════════════════════════════════════════════════════════════

// ── BUILD DETAILED COACHING REPORT ─────────────────────────────────────────────
function buildDetailedCoachingReport(metrics, sentenceAnalysis, scenario, scenarioConfig) {
  const { breakdown, summary } = metrics;
  const { strengths, weaknesses, worstSentences } = summary;

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 1: WHAT YOU DID WELL
  // ───────────────────────────────────────────────────────────────────────────
  const strengthsText = buildStrengthsSection(breakdown, summary, scenario, scenarioConfig);

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 2: WHAT TO WORK ON
  // ───────────────────────────────────────────────────────────────────────────
  const improvementsText = buildImprovementsSection(breakdown, weaknesses, sentenceAnalysis, scenario);

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 3: HOW TO IMPROVE
  // ───────────────────────────────────────────────────────────────────────────
  const actionableStepsText = buildActionableStepsSection(breakdown, weaknesses, sentenceAnalysis, scenario, scenarioConfig);

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 4: YOUR CHALLENGE FOR TODAY
  // ───────────────────────────────────────────────────────────────────────────
  const challengeText = buildChallengeSection(breakdown, weaknesses, metrics.overall, scenario, scenarioConfig);

  return {
    strengths: strengthsText,
    improvements: improvementsText,
    actionableSteps: actionableStepsText,
    challenge: challengeText,
    formatted: `${strengthsText}\n\n${improvementsText}\n\n${actionableStepsText}\n\n${challengeText}`
  };
}

// ── SECTION 1: STRENGTHS ───────────────────────────────────────────────────────
function buildStrengthsSection(breakdown, summary, scenario, scenarioConfig) {
  const strengths = [];
  
  // Pronunciation
  if (breakdown.pronunciation >= 80) {
    strengths.push(`Your pronunciation clarity at ${breakdown.pronunciation}% shows excellent articulation. Listeners can understand you clearly.`);
  }

  // Pace
  if (breakdown.pace >= 85) {
    strengths.push(`Your pace is ideal at ${breakdown.pace}%. You're speaking at a comfortable speed that's easy to follow in a ${scenario}.`);
  } else if (breakdown.pace >= 75) {
    strengths.push(`Your pace at ${breakdown.pace}% is solid. You're maintaining a reasonable speed throughout.`);
  }

  // Flow
  if (breakdown.flow >= 80) {
    strengths.push(`Your flow is smooth at ${breakdown.flow}%. Sentences connect naturally without distracting hesitations.`);
  }

  // Confidence
  if (breakdown.confidence >= 75) {
    strengths.push(`Your confidence score of ${breakdown.confidence}% shows you're delivering with assurance. No major hesitation patterns detected.`);
  }

  // Overall
  if (summary.sentenceCount > 0 && summary.sentenceCount >= 5) {
    strengths.push(`You delivered ${summary.sentenceCount} complete sentences with an average of ${summary.avgWordsPerSentence} words per sentence. Good sentence structure.`);
  }

  if (strengths.length === 0) {
    return "You're building your ${scenario} delivery skills. Every practice session strengthens your ability to communicate clearly.";
  }

  return `**What You Did Well**\n${strengths.join("\n")}`;
}

// ── SECTION 2: AREAS FOR IMPROVEMENT ───────────────────────────────────────────
function buildImprovementsSection(breakdown, weaknesses, sentenceAnalysis, scenario) {
  const issues = [];

  // Pronunciation issues
  if (breakdown.pronunciation < 70) {
    const unclearSentences = sentenceAnalysis.filter(s => s.pronunciation.clarity < 75);
    if (unclearSentences.length > 0) {
      issues.push(`**Pronunciation Clarity (${breakdown.pronunciation}%)**\nSentence(s) ${unclearSentences.map(s => s.index).join(", ")} had unclear words. Specific challenge: "${unclearSentences[0].text}"`);
    }
  }

  // Pace issues
  if (breakdown.pace < 70) {
    const slowSentences = sentenceAnalysis.filter(s => s.pace.status === "too slow");
    const fastSentences = sentenceAnalysis.filter(s => s.pace.status === "too fast");
    
    if (slowSentences.length > 0) {
      const avgWPM = Math.round(slowSentences.reduce((sum, s) => sum + s.pace.wpm, 0) / slowSentences.length);
      issues.push(`**Pace Too Slow (${breakdown.pace}%)**\nYou averaged ${avgWPM} WPM in sentences ${slowSentences.map(s => s.index).join(", ")}. Target: ${slowSentences[0]?.pace?.targetWPM} WPM.`);
    } else if (fastSentences.length > 0) {
      const avgWPM = Math.round(fastSentences.reduce((sum, s) => sum + s.pace.wpm, 0) / fastSentences.length);
      issues.push(`**Pace Too Fast (${breakdown.pace}%)**\nYou rushed through sentences ${fastSentences.map(s => s.index).join(", ")} at ${avgWPM} WPM. Slow to ${fastSentences[0]?.pace?.targetWPM} WPM.`);
    }
  }

  // Flow issues
  if (breakdown.flow < 70) {
    const fillerySentences = sentenceAnalysis.filter(s => s.fillers.length > 0);
    if (fillerySentences.length > 0) {
      const totalFillers = fillerySentences.reduce((sum, s) => sum + s.fillers.reduce((fSum, f) => fSum + f.count, 0), 0);
      issues.push(`**Flow Disruptions (${breakdown.flow}%)**\nDetected ${totalFillers} filler word(s) in sentences ${fillerySentences.map(s => s.index).join(", ")}. Replace with confident pauses.`);
    }
  }

  // Confidence issues
  if (breakdown.confidence < 60) {
    const hesitantSentences = sentenceAnalysis.filter(s => s.confidence.score < 50);
    if (hesitantSentences.length > 0) {
      issues.push(`**Confidence Indicators (${breakdown.confidence}%)**\nSentences ${hesitantSentences.map(s => s.index).join(", ")} show hesitation patterns. Consider: ${hesitantSentences[0].confidence.indicators[0]}`);
    }
  }

  if (issues.length === 0) {
    return "**Areas to Watch**\nYou're doing well overall. Minor refinements in pace consistency and eliminating occasional fillers will further strengthen your delivery.";
  }

  return `**What to Work On**\n${issues.join("\n\n")}`;
}

// ── SECTION 3: ACTIONABLE STEPS ────────────────────────────────────────────────
function buildActionableStepsSection(breakdown, weaknesses, sentenceAnalysis, scenario, scenarioConfig) {
  const steps = [];

  // Step 1: Pronunciation
  if (breakdown.pronunciation < 80) {
    const unclearSentences = sentenceAnalysis.filter(s => s.pronunciation.clarity < 75);
    if (unclearSentences.length > 0) {
      const worstSentence = unclearSentences[0];
      steps.push(
        `**Step 1: Pronunciation Practice**\n` +
        `Target: Sentence ${worstSentence.index} - "${worstSentence.text}"\n` +
        `Action: Slow down to 50% speed. Emphasize each consonant, especially final sounds. Record yourself 3 times. Listen for the unclear words: ${worstSentence.pronunciation.issues.map(i => i.words?.join(", ")).filter(Boolean)[0] || "all words"}.\n` +
        `Goal: Reach 85% clarity.`
      );
    }
  }

  // Step 2: Pace
  if (breakdown.pace < 80) {
    const targetWPM = scenarioConfig.paceRange.ideal;
    const sentenceLength = Math.round(sentenceAnalysis.reduce((sum, s) => sum + s.wordCount, 0) / sentenceAnalysis.length);
    const targetSeconds = Math.round((sentenceLength / targetWPM) * 60);
    
    steps.push(
      `**Step 2: Pace Calibration**\n` +
      `Target: ${targetWPM} WPM\n` +
      `Action: Time yourself on your sentences. Average sentence (${sentenceLength} words) should take ${targetSeconds} seconds.\n` +
      `Practice: Deliver one sentence while looking at a timer. Adjust speed based on target.`
    );
  }

  // Step 3: Flow/Fillers
  if (breakdown.flow < 80) {
    const fillerySentences = sentenceAnalysis.filter(s => s.fillers.length > 0);
    if (fillerySentences.length > 0) {
      const fillerTypes = [...new Set(fillerySentences.flatMap(s => s.fillers.map(f => f.word)))];
      steps.push(
        `**Step 3: Eliminate Fillers**\n` +
        `Problem fillers: "${fillerTypes.join('", "')}" in sentences ${fillerySentences.map(s => s.index).join(", ")}\n` +
        `Action: Replace each filler with a 2-second pause. Practice your problematic sentences 5 times, replacing every filler.\n` +
        `Practice: Sentence by sentence, emphasize pauses over saying filler words.`
      );
    }
  }

  // Step 4: Scenario-specific
  const scenarioSteps = buildScenarioSpecificSteps(scenario, breakdown, sentenceAnalysis);
  if (scenarioSteps) {
    steps.push(scenarioSteps);
  }

  if (steps.length === 0) {
    steps.push(
      `**Continuous Improvement**\n` +
      `1. Record yourself delivering the same content 3 more times\n` +
      `2. Listen back and mark where you hear issues\n` +
      `3. Focus on one area per practice session\n` +
      `4. Target a 5-point improvement on your weakest metric`
    );
  }

  return `**How to Improve**\n${steps.join("\n\n")}`;
}

// ── SCENARIO-SPECIFIC STEPS ────────────────────────────────────────────────────
function buildScenarioSpecificSteps(scenario, breakdown, sentenceAnalysis) {
  const scenarioTips = {
    "Thesis Defense": () => {
      const technicalSentences = sentenceAnalysis.filter(s => s.wordCount > 20);
      return (
        `**Step 4: Thesis Defense Specific**\n` +
        `Focus: Authority & Technical Clarity\n` +
        `Action: In complex sentences like #${technicalSentences[0]?.index}, slow down even more. ${breakdown.confidence < 70 ? "Eliminate every hesitation—confidence in your research matters." : "Maintain your confident delivery throughout."}\n` +
        `Practice: Record yourself explaining your thesis as if explaining to a committee. No fillers allowed.`
      );
    },
    "Job Interview": () => {
      const answerLength = sentenceAnalysis.reduce((sum, s) => sum + s.wordCount, 0);
      return (
        `**Step 4: Interview Specific**\n` +
        `Focus: Professional Confidence\n` +
        `Action: Your total answer was ${answerLength} words. Interviewers prefer 100-150 word answers. ${breakdown.fillers?.total > 0 ? "Remove all 'um', 'uh', 'like'—they signal uncertainty." : "Maintain this clarity level—no fillers."}\n` +
        `Practice: Answer common interview questions. Record and listen for hesitation patterns.`
      );
    },
    "Recitation": () => {
      return (
        `**Step 4: Recitation Specific**\n` +
        `Focus: Expression & Pacing\n` +
        `Action: Recitation is about rhythm. ${breakdown.pace < 80 ? "Vary your pace—slow on emotional lines, normal on narrative." : "Maintain this pace—it serves the content."}\n` +
        `Practice: Add punctuation pauses. Let commas and periods breathe. Record and listen for emotional arc.`
      );
    },
    "General Speaking": () => {
      return null;
    }
  };

  const scenarioFn = scenarioTips[scenario];
  return scenarioFn ? scenarioFn() : null;
}

// ── SECTION 4: CHALLENGE FOR TODAY ─────────────────────────────────────────────
function buildChallengeSection(breakdown, weaknesses, overallScore, scenario, scenarioConfig) {
  const weakestMetric = [
    { name: "Pronunciation", score: breakdown.pronunciation },
    { name: "Pace", score: breakdown.pace },
    { name: "Flow", score: breakdown.flow },
    { name: "Confidence", score: breakdown.confidence }
  ].sort((a, b) => a.score - b.score)[0];

  const targetScore = Math.min(100, overallScore + 10);
  const challengeText = buildChallenge(scenario, weakestMetric, overallScore, targetScore, scenarioConfig);

  return `**Your Challenge for Today**\n${challengeText}`;
}

// ── CHALLENGE BUILDER ──────────────────────────────────────────────────────────
function buildChallenge(scenario, weakestMetric, currentScore, targetScore, scenarioConfig) {
  const challenges = {
    "Pronunciation": () => 
      `Re-record your speech focusing ONLY on clarity. Emphasize every final consonant. Articulate the words marked as unclear. Target: Reach 85% pronunciation clarity. Your current score is ${currentScore}/100 → aim for ${targetScore}/100.`,
    
    "Pace": () => {
      const targetWPM = scenarioConfig.paceRange.ideal;
      return `Time yourself precisely. Deliver your speech hitting exactly ${targetWPM} WPM. Use a timer or metronome. Re-record 2 times. Current score: ${currentScore}/100 → target ${targetScore}/100.`;
    },
    
    "Flow": () => 
      `Re-record with ZERO fillers. Every time you feel an 'um' coming, pause instead. Replace all hesitations with confident silence. Your ${scenario} should flow naturally. Current score: ${currentScore}/100 → target ${targetScore}/100.`,
    
    "Confidence": () => 
      `Stand up. Make eye contact (with yourself in mirror/camera). Re-deliver with conviction. Remove hesitation patterns. Speak like you own the room. Current score: ${currentScore}/100 → target ${targetScore}/100.`
  };

  const basedOnWeakest = challenges[weakestMetric.name]?.() || challenges["Pronunciation"]();
  
  return basedOnWeakest + `\n\nYou've got this! Every recording brings improvement.`;
}

// ── BUILD SENTENCE-SPECIFIC COACHING ───────────────────────────────────────────
function buildSentenceCoaching(sentence) {
  const feedback = {
    summary: `Sentence ${sentence.index}: "${sentence.text}"`,
    score: `${sentence.score}/100 - ${sentence.status}`,
    breakdown: {
      pace: `WPM: ${sentence.pace.wpm} (${sentence.pace.status === "ideal" ? "✓" : "✗"})`,
      pronunciation: `Clarity: ${sentence.pronunciation.clarity}% (${sentence.pronunciation.clarity >= 80 ? "✓" : "needs work"})`,
      flow: `Flow Score: ${sentence.flow.score}/100`,
      confidence: `Confidence: ${sentence.confidence.assessment} (${sentence.confidence.score}/100)`
    },
    issues: sentence.issues.map((issue, idx) => 
      `${idx + 1}. ${issue.type}: ${Array.isArray(issue.details) ? issue.details.join(", ") : issue.details}`
    ),
    recommendation: buildSentenceRecommendation(sentence)
  };

  return feedback;
}

// ── SENTENCE RECOMMENDATION ────────────────────────────────────────────────────
function buildSentenceRecommendation(sentence) {
  const topIssue = sentence.issues[0];
  
  if (!topIssue) return "This sentence is strong. Maintain this delivery.";

  const recommendations = {
    "unclear words": 
      `Focus on clear articulation. The words ${sentence.pronunciation.issues[0]?.words?.slice(0, 2).join(", ")} need sharper pronunciation. Slow down on these words.`,
    "complex pronunciation":
      `These words have complex sounds. Practice each one separately at slow speed, then increase tempo.`,
    "final consonant clarity":
      `Hold final consonants longer. Don't rush the ending of words.`,
    "high filler density":
      `Too many filler words disrupt flow. Replace with confident pauses.`,
    "confidence":
      `This sentence shows hesitation. Re-deliver with more conviction. Speak louder and clearer.`,
    "overall clarity":
      `General articulation issue. Enunciate every syllable clearly.`
  };

  return recommendations[topIssue.type] || recommendations["overall clarity"];
}

module.exports = {
  buildDetailedCoachingReport,
  buildStrengthsSection,
  buildImprovementsSection,
  buildActionableStepsSection,
  buildChallenge,
  buildSentenceCoaching,
  buildSentenceRecommendation
};
