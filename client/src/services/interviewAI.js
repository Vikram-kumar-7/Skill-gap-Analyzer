// ============================================================
// src/services/interviewAI.js
// google/gemma-4-31b-it:free handles all interview tasks:
//   - Answer evaluation with 4-axis scoring
//   - Progressive hint generation
//   - Targeted follow-up questions
//   - Structured answer outlines
//
// Every prompt is prefixed with the developer's history context
// from HistoryService.buildContext() — this is the key quality lever.
// ============================================================
import { ai } from './aiService';
import { HistoryService } from '../utils/userHistory';

export const InterviewAI = {
  /**
   * Evaluate a candidate's answer against the expected answer.
   * Scores on 4 axes (0–100 each) and returns structured feedback.
   *
   * @param {string} question       - The interview question
   * @param {string} userAnswer     - What the user typed/said
   * @param {string} expectedAnswer - The model answer from the question bank
   * @param {string} topic          - Skill/topic tag (e.g. "React", "JavaScript")
   * @returns {Promise<{overallScore: number, technicalAccuracy: number, completeness: number, clarity: number, depth: number, feedback: string, missingPoints: string[], strengths: string[], chronicGapRepeated: boolean, chronicGapName: string}>}
   */
  async evaluateAnswer(question, userAnswer, expectedAnswer, topic) {
    const context = HistoryService.buildContext(topic);

    const prompt = `${context}You are a principal engineer and technical interviewer with 15+ years of experience. 
You are evaluating a candidate's interview response with extreme objectivity and actionable feedback.

=== INTERVIEW CONTEXT ===
QUESTION: ${question}
EXPECTED ANSWER DIRECTION: ${expectedAnswer}
CANDIDATE'S ANSWER: ${userAnswer}
QUESTION CATEGORY: ${topic}
DIFFICULTY: Medium

=== EVALUATION CRITERIA (Score 0-100) ===
1. technicalAccuracy: Are the facts, concepts, and mechanisms correct? Penalize misconceptions heavily.
2. completeness: Did they cover all major aspects of the question? Compare against the expected answer direction.
3. clarity: Is the answer well-structured and easy to follow? Consider communication quality.
4. depth: Did they go beyond surface-level explanation? Did they mention trade-offs, internals, or optimizations?
5. overallScore: Weighted average (40% accuracy + 25% completeness + 15% clarity + 20% depth)

=== OUTPUT RULES ===
- Be brutally honest but constructive. Do not inflate scores.
- If the answer is completely wrong or irrelevant, overallScore should be below 30.
- If the answer is good but missing depth, score depth 50-65.
- If the answer is excellent and comprehensive, score 85+.
- If the candidate repeated a known chronic gap from the developer history, set chronicGapRepeated to true and specify the name of the gap in chronicGapName.
- missingPoints: List specific concepts/points they failed to mention (max 5 items)
- strengths: List what they did well (max 3 items)
- feedback: 2-3 sentences. Start with the biggest issue, then encouragement, then 1 specific improvement tip.
- improvementPlan: 1 concrete action they can take to improve this type of answer

Return ONLY a valid JSON object:
{
  "overallScore": 0,
  "technicalAccuracy": 0,
  "completeness": 0,
  "clarity": 0,
  "depth": 0,
  "feedback": "string",
  "missingPoints": ["string", ...],
  "strengths": ["string", ...],
  "improvementPlan": "string",
  "chronicGapRepeated": false,
  "chronicGapName": ""
}`;

    try {
      const result = await ai.reason(prompt, true);
      // Enforce weighted scoring calculation client-side for reliability: 40% accuracy + 25% completeness + 15% clarity + 20% depth
      result.overallScore = Math.round(
        (result.technicalAccuracy || 0) * 0.4 +
          (result.completeness || 0) * 0.25 +
          (result.clarity || 0) * 0.15 +
          (result.depth || 0) * 0.2
      );
      // Feed result back into HistoryService so the next prompt gets smarter context
      HistoryService.recordAnswer(topic, result.overallScore, result.missingPoints || []);
      return result;
    } catch (e) {
      console.error('[InterviewAI] evaluateAnswer failed:', e);
      return fallbackEval(e.message);
    }
  },

  /**
   * Generate 3 progressive hints — each reveals more without giving away the answer.
   *
   * @param {string} question   - The interview question
   * @param {string} difficulty - "Easy" | "Medium" | "Hard"
   * @param {string} topic      - Skill/topic for history context
   * @returns {string[]} - Array of exactly 3 hint strings
   */
  async generateHints(question, difficulty, topic) {
    const context = HistoryService.buildContext(topic);

    const stats = HistoryService.getTopicStats();
    const topicStat = stats.find((s) => s.topic === topic);
    const userLevel = topicStat
      ? topicStat.avg > 80
        ? 'Advanced'
        : topicStat.avg > 50
          ? 'Intermediate'
          : 'Beginner'
      : 'Intermediate';

    const prompt = `${context}You are a senior technical interviewer at a top-tier tech company (Google, Amazon, Netflix). 
The candidate is preparing for an interview and needs progressive hints.

INTERVIEW QUESTION: ${question}
DIFFICULTY LEVEL: ${difficulty}
CANDIDATE SKILL LEVEL: ${userLevel}

Generate exactly 3 hints that follow this progression:
- Hint 1: A subtle nudge that points toward the right concept without revealing the answer. Should make the candidate think "Ah, I should consider that angle."
- Hint 2: A more specific pointer that narrows down the approach. Reveals the category of solution but not the implementation.
- Hint 3: A strong pointer that almost reveals the approach/algorithm but still requires the candidate to articulate the full reasoning.

Rules:
- NEVER give the direct answer in any hint
- NEVER write code in the hints
- Each hint must be 1-2 sentences max
- Use interview-appropriate language (professional, encouraging)

Return ONLY a valid JSON array:
["hint 1", "hint 2", "hint 3"]`;

    try {
      const hints = await ai.reason(prompt, true);
      // Ensure it's an array with at least 3 items
      if (Array.isArray(hints) && hints.length >= 3) return hints.slice(0, 3);
      throw new Error('Invalid hints format');
    } catch {
      return [
        'Think about the core concept behind this problem — what fundamental principle applies here?',
        'Consider the trade-offs involved. What are the edge cases you need to handle?',
        'Focus on the approach before the implementation — outline your steps first.',
      ];
    }
  },

  /**
   * Generate ONE targeted follow-up question probing exactly what the candidate missed.
   *
   * @param {string}   originalQuestion - The original interview question
   * @param {string}   userAnswer       - What the candidate said
   * @param {string[]} missingPoints    - Gaps identified by evaluateAnswer
   * @param {string}   topic            - Skill/topic tag for history context
   * @returns {Promise<string>} - A single follow-up question string
   */
  async generateFollowUp(originalQuestion, userAnswer, missingPoints, topic) {
    const context = HistoryService.buildContext(topic);
    const gaps = (missingPoints || []).join(', ') || 'general depth and completeness';

    const prompt = `${context}A candidate answered an interview question but missed key points.
Generate ONE targeted follow-up question to probe exactly what they missed.

ORIGINAL QUESTION: ${originalQuestion}
CANDIDATE'S ANSWER: ${userAnswer}
GAPS IDENTIFIED: ${gaps}

The follow-up must directly test their understanding of the gaps.
Make it feel like a natural next question in a real interview.
Return ONLY the question text — no quotes, no explanation, no preamble.`;

    try {
      const text = await ai.reason(prompt, false);
      return text.trim().replace(/^["']|["']$/g, '');
    } catch {
      const firstGap = missingPoints?.[0] || 'that concept';
      return `Can you elaborate on ${firstGap} and explain how it works in practice?`;
    }
  },

  /**
   * Generate a structured answer OUTLINE (not the full answer) to guide the user.
   *
   * @param {string} question   - The interview question
   * @param {string} difficulty - "Easy" | "Medium" | "Hard"
   * @param {string} topic      - Skill/topic for history context
   * @returns {Promise<{opening: string, coreConcepts: string[], steps: string[], edgeCases: string[], closing: string, complexityNote?: string}>}
   */
  async generateAnswerOutline(question, difficulty, topic) {
    const context = HistoryService.buildContext(topic);

    const prompt = `${context}You are an engineering manager conducting mock interviews. The candidate is stuck and needs a structured answer template.

INTERVIEW QUESTION: ${question}
DIFFICULTY: ${difficulty}
CATEGORY: ${topic}

${context ? 'Add ⚠️ next to any key point or step the developer historically struggles with in coreConcepts or steps, based on the history above.' : ''}

Provide a detailed answer outline that the candidate can use to structure their verbal response. Do NOT write the full answer — only the skeleton/framework.

The outline must include:
1. Opening Statement (how to start the answer)
2. Core Concepts to Mention (bullet points of key terms/theories)
3. Step-by-Step Breakdown (logical flow of the answer)
4. Edge Cases / Trade-offs to Discuss
5. Strong Closing Statement (how to wrap up impressively)

If the question involves code/system design, include:
- Time/Space Complexity considerations
- Scalability angles
- Alternative approaches comparison

Return ONLY a valid JSON object:
{
  "opening": "string",
  "coreConcepts": ["concept 1", "concept 2", ...],
  "steps": ["step 1", "step 2", ...],
  "edgeCases": ["case 1", "case 2", ...],
  "closing": "string",
  "complexityNote": "string (optional)"
}`;

    try {
      return await ai.reason(prompt, true);
    } catch (e) {
      console.error('[InterviewAI] generateAnswerOutline failed:', e);
      return {
        opening: "Let's approach this topic from the foundational principles.",
        coreConcepts: ['Basic concepts related to ' + topic],
        steps: [
          'Define the system context',
          'Address state management and logic flow',
          'Refactor and write tests',
        ],
        edgeCases: ['Empty input bounds', 'Invalid states', 'Network interruptions'],
        closing: 'That summarizes the core approach and trade-offs.',
        complexityNote: 'Ensure time and space trade-offs are fully analyzed.',
      };
    }
  },
};

// ── Private helpers ────────────────────────────────────────────

function fallbackEval(reason = 'AI unavailable') {
  return {
    overallScore: 0,
    technicalAccuracy: 0,
    completeness: 0,
    clarity: 0,
    depth: 0,
    feedback: `AI evaluation unavailable (${reason}). Compare your answer to the expected solution manually and self-assess each criterion.`,
    missingPoints: [],
    strengths: [],
    improvementPlan:
      'Review documentation or course materials for the topics and concepts tested here.',
    chronicGapRepeated: false,
    chronicGapName: '',
  };
}
