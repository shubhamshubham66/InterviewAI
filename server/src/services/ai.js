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

function mockQuestion({ role, history }) {
  const bank = MOCK_BANK[role] || MOCK_BANK['SDE Intern']
  const asked = history.filter((h) => h.role === 'interviewer').length
  if (asked < bank.length) {
    return { question: bank[asked], isFollowUp: false, topic: role, mock: true }
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

// ---- Public API ----

export async function generateQuestion({ role, interviewType, difficulty, resumeContext, history }) {
  if (!aiEnabled) return mockQuestion({ role, history })

  const system = [
    'You are an experienced technical interviewer conducting a mock interview.',
    `Role: ${role}. Interview type: ${interviewType}. Difficulty: ${difficulty}.`,
    resumeContext ? `Candidate resume context:\n${resumeContext}` : 'No resume was provided.',
    'Ask one question at a time. If the candidate\'s last answer was vague or shallow, ask a sharper follow-up on the same topic instead of moving on.',
    'Reply with ONLY a JSON object: {"question": string, "isFollowUp": boolean, "topic": string}.',
  ].join('\n')

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
    return mockQuestion({ role, history })
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
