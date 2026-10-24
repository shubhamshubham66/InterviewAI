# InterviewAI

AI mock interview practice: an AI interviewer asks role-specific questions, listens to your answers and gives a scored feedback report.

## Status
**Phase 1 — Core MVP**
- [x] Landing page (React + Vite + Tailwind)
- [x] AI mock interview (role, round, difficulty)
- [x] Resume-based question generation (PDF/DOCX upload)
- [x] Voice-based interview (browser speech-to-text) with text fallback
- [x] Smart follow-up questions
- [x] AI answer evaluation & scoring, session report

**Phase 2 — Advanced AI Intelligence**
- [x] Adaptive interview engine (harder questions on strong answers, reinforcement follow-ups on weak ones)
- [x] AI Interviewer voice (text-to-speech reads questions aloud, mute toggle)
- [x] Speech & Communication Coach (filler-word count, speaking pace, per-answer tips)
- [x] Answer Improvement Coach (STAR-structured rewrite + missing concepts, on demand in the report)

**Later phases**
- [ ] Auth & accounts, progress dashboard across sessions
- [ ] Live coding round, AI question bank
- [ ] Peer mock interviews, college placement dashboard, accessibility & security
- [ ] Settings, notifications, offline practice

## Project layout
- `src/` — frontend (React + Vite + Tailwind). Landing page at `/`, interview flow at `/interview`.
- `server/` — backend (Express). Generates interview questions, evaluates answers, parses resumes.

## Run locally
Frontend and backend run as separate processes.

```bash
# install both
npm install
npm --prefix server install

# run both together (frontend on :5173, backend on :8787)
npm run dev:all

# or separately
npm run dev          # frontend only
npm run dev:server   # backend only
```

The frontend proxies `/api/*` to the backend in dev (see `vite.config.js`).

### AI configuration
The backend works out of the box in **mock mode** — sample questions and heuristic scoring, clearly labelled in the UI — so the full flow is testable with no setup.

To enable real AI-generated questions and evaluation, copy `server/.env.example` to `server/.env` and set:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Deploy
- Frontend: import the repo on Vercel — framework preset **Vite**, build `npm run build`, output `dist`.
- Backend: deploy `server/` separately (Render, Railway, Fly.io, a Vercel serverless function, etc.) with `ANTHROPIC_API_KEY` set, and point the frontend's `VITE_API_URL` at it.
