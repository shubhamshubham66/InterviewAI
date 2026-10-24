import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'

const client = apiKey ? new Anthropic({ apiKey }) : null

export const aiEnabled = Boolean(client)

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON object found in model response')
  return JSON.parse(match[0])
}

async function callClaude(system, user) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system,
    messages: [{ role: 'user', content: user }],
  })
  const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
  return extractJson(text)
}

// ---- Mock fallback (used when ANTHROPIC_API_KEY is not configured) ----

const MOCK_BANK = {
  'SDE Intern': [
    'Walk me through a project from your resume. What was your specific contribution?',
    'What is the difference between an array and a linked list, and when would you pick one over the other?',
    'How would you detect a cycle in a linked list?',
  ],
  'Frontend Developer': [
    'Tell me about a UI bug you fixed recently. How did you track it down?',
    'What happens between typing a URL and the page rendering?',
    'How do you decide between client-side and server-side rendering?',
  ],
  'Backend Developer': [
    'Describe how you would design a rate limiter for a public API.',
    'What is the difference between SQL and NoSQL, and when would you choose each?',
    'How do you handle a database migration on a table with millions of rows?',
  ],
  'HR Round': [
    'Tell me about yourself.',
    'Describe a conflict you had in a team and how you resolved it.',
    'Where do you see yourself in three years?',
  ],
}

function mockQuestion({ role, history, adaptiveHint }) {
  const bank = MOCK_BANK[role] || MOCK_BANK['SDE Intern']
  const asked = history.filter((h) => h.role === 'interviewer').length

  if (adaptiveHint === 'reinforce' && asked > 0) {
    return {
      question: 'Let\'s reinforce the basics first — in your own words, what problem was your last answer trying to solve, and why does that approach work?',
      isFollowUp: true,
      topic: role,
      mock: true,
    }
  }

  if (asked < bank.length) {
    const prefix = adaptiveHint === 'increase' && asked > 0 ? '(Raising the bar) ' : ''
    return { question: prefix + bank[asked], isFollowUp: false, topic: role, mock: true }
  }
  return {
    question: 'Can you go a bit deeper on that last point, with a specific example?',
    isFollowUp: true,
    topic: role,
    mock: true,
  }
}

function mockEvaluate({ answer }) {
  const words = (answer || '').trim().split(/\s+/).filter(Boolean)
  const length = words.length
  const hasExample = /(for example|e\.g|instance|project|I built|I used)/i.test(answer || '')
  const score = Math.max(2, Math.min(9.5, 3 + Math.min(length / 15, 4) + (hasExample ? 2 : 0)))
  return {
    score: Math.round(score * 10) / 10,
    correctness: Math.round(score * 10) / 10,
    clarity: length > 10 ? 7 : 4,
    structure: hasExample ? 7 : 4,
    feedback: hasExample
      ? 'Good, you backed this up with a concrete example. Tighten the structure: situation, action, result.'
      : 'Add a concrete example from your own work to make this answer specific instead of generic.',
    idealAnswerHint: 'A strong answer names a specific project, what you did, and a measurable outcome.',
    mock: true,
  }
}

const ADAPTIVE_INSTRUCTIONS = {
  increase:
    'The candidate has been scoring well. Raise the difficulty: ask a harder question, ideally on a new topic, that pushes past the stated difficulty level.',
  reinforce:
    'The candidate\'s last answer was weak. Do not move to a new topic yet. Ask a simpler, concept-level follow-up on the SAME topic to help them rebuild it before moving on.',
  maintain: '',
}

// ---- Public API ----

export async function generateQuestion({ role, interviewType, difficulty, resumeContext, history, adaptiveHint = 'maintain' }) {
  if (!aiEnabled) return mockQuestion({ role, history, adaptiveHint })

  const system = [
    'You are an experienced technical interviewer conducting a mock interview.',
    `Role: ${role}. Interview type: ${interviewType}. Difficulty: ${difficulty}.`,
    resumeContext ? `Candidate resume context:\n${resumeContext}` : 'No resume was provided.',
    'Ask one question at a time. If the candidate\'s last answer was vague or shallow, ask a sharper follow-up on the same topic instead of moving on.',
    ADAPTIVE_INSTRUCTIONS[adaptiveHint] || '',
    'Reply with ONLY a JSON object: {"question": string, "isFollowUp": boolean, "topic": string}.',
  ].filter(Boolean).join('\n')

  const transcript = history
    .map((h) => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.text}`)
    .join('\n')

  const user = transcript
    ? `Conversation so far:\n${transcript}\n\nAsk the next question.`
    : 'Ask the opening question for this interview.'

  try {
    return await callClaude(system, user)
  } catch (err) {
    console.error('generateQuestion AI call failed, falling back to mock:', err.message)
    return mockQuestion({ role, history, adaptiveHint })
  }
}

export async function evaluateAnswer({ role, question, answer }) {
  if (!aiEnabled) return mockEvaluate({ answer })

  const system = [
    'You are grading one answer from a mock interview.',
    `Role being interviewed for: ${role}.`,
    'Score 0-10 on correctness, clarity and structure. Give actionable feedback in 1-2 sentences, and a one-sentence hint of what an ideal answer would include.',
    'Reply with ONLY a JSON object: {"score": number, "correctness": number, "clarity": number, "structure": number, "feedback": string, "idealAnswerHint": string}.',
  ].join('\n')

  const user = `Question: ${question}\nCandidate answer: ${answer}`

  try {
    return await callClaude(system, user)
  } catch (err) {
    console.error('evaluateAnswer AI call failed, falling back to mock:', err.message)
    return mockEvaluate({ answer })
  }
}

function mockImprove({ answer }) {
  return {
    improvedAnswer:
      'Situation: name the project and context in one line. Action: what you specifically built or decided, with the tool/tech used. ' +
      `Result: a measurable outcome (time saved, bug reduced, users affected). Your answer: "${(answer || '').slice(0, 120)}"`,
    missingConcepts: ['A measurable outcome or result', 'Why you chose that approach over an alternative'],
    structureTips: 'Use STAR: Situation, Task, Action, Result. Lead with the result if it is strong.',
    mock: true,
  }
}

function mockReviewCode({ code, allPassed }) {
  const lines = code.split('\n').filter((l) => l.trim())
  const hasComments = /\/\/|\/\*/.test(code)
  const maxNesting = (code.match(/\{/g) || []).length
  const tips = []
  if (!allPassed) tips.push('Get all test cases passing first — correctness before style.')
  if (lines.length > 40) tips.push('This solution is long for the problem — look for a simpler approach.')
  if (maxNesting > 4) tips.push('There is deep nesting here — consider early returns to flatten it.')
  if (!hasComments && lines.length > 15) tips.push('A short comment on the overall approach would help a reviewer follow it faster.')
  if (!tips.length) tips.push('Clean and reasonably concise. Think about edge cases: empty input, duplicates, very large input.')
  return { feedback: tips.join(' '), mock: true }
}

export async function reviewCode({ role, problemTitle, code, allPassed }) {
  if (!aiEnabled) return mockReviewCode({ code, allPassed })

  const system = [
    'You review a candidate\'s coding-interview submission for code quality, not just correctness.',
    `Role: ${role}. Problem: ${problemTitle}. Tests passed: ${allPassed}.`,
    'Comment on readability, time/space complexity, and edge cases they may have missed. 2-3 sentences, direct and specific to this code.',
    'Reply with ONLY a JSON object: {"feedback": string}.',
  ].join('\n')

  try {
    return await callClaude(system, `Code:\n${code}`)
  } catch (err) {
    console.error('reviewCode AI call failed, falling back to mock:', err.message)
    return mockReviewCode({ code, allPassed })
  }
}

export async function improveAnswer({ role, question, answer }) {
  if (!aiEnabled) return mockImprove({ answer })

  const system = [
    'You help interview candidates improve a specific answer they already gave.',
    `Role being interviewed for: ${role}.`,
    'Rewrite their answer into a stronger version (keep it truthful to what they said, just better structured — do not invent facts they did not mention), list concepts or details missing from the original, and give one structural tip (e.g. STAR method).',
    'Reply with ONLY a JSON object: {"improvedAnswer": string, "missingConcepts": string[], "structureTips": string}.',
  ].join('\n')

  const user = `Question: ${question}\nOriginal answer: ${answer}`

  try {
    return await callClaude(system, user)
  } catch (err) {
    console.error('improveAnswer AI call failed, falling back to mock:', err.message)
    return mockImprove({ answer })
  }
}
