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

**Phase 3 — Coding & Technical Practice**
- [x] Live Coding Interview — in-browser editor (CodeMirror), 5 DSA problems, sandboxed test execution with a timeout, AI code-quality feedback
- [x] AI Question Bank — DSA, SQL, DBMS, OS, Computer Networks, OOPs and HR, browsable by category with expandable answers

**Later phases**
- [ ] Auth & accounts, progress dashboard across sessions
- [ ] Peer mock interviews, college placement dashboard, accessibility & security
- [ ] Settings, notifications, offline practice

## Project layout
- `src/` — frontend (React + Vite + Tailwind). Landing page at `/`, interview flow at `/interview`, coding + question bank at `/practice`.
- `server/` — backend (Express). Generates interview questions, evaluates answers, parses resumes, runs coding submissions in a sandboxed process, serves the question bank.

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

## Known limitations
- **Code execution sandbox**: the Live Coding Interview runs submitted JavaScript in a separate child process with a memory cap and a hard timeout — isolation for one trusted user running their own practice code, not a hardened multi-tenant sandbox (it does not block network or file-system access from inside that process). Don't expose it as a public, unauthenticated service.
- **react-router-dom**: there's an open advisory (open-redirect in `<Link>`/`useNavigate`, SSR-hydration issue) with no fix yet on the 6.x line — only 7.x is patched. Not exploitable here since this is a client-only SPA with no SSR and no route targets built from untrusted input, but worth a deliberate v7 migration later.
