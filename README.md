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

**Phase 4 — Collaboration, Accessibility & Security**
- [x] Secure authentication — signup/login (bcrypt + JWT), rate-limited, SQLite-backed accounts, account deletion cascades all of a user's data
- [x] Peer Mock Interviews — shareable room code, live question/answer/feedback exchange over WebSocket, cross-room leaderboard for signed-in users
- [x] College Placement Dashboard — role-gated `/admin` page with aggregate stats, a skill-gap report, and per-student activity
- [x] Accessibility & practice controls — adjustable text size (sidebar), keyboard-reachable controls, a skip-to-content link, a repeat-question button, and a pause/resume per-question timer

**Phase 5 — Final Supporting Features**
- [x] Smart Interview Setup — company (optional) and duration (10/15/20/30 min, maps to question count) added to role/round/difficulty
- [x] Real-Time Interview Controls — pause/resume timer, repeat question (Phase 4) plus skip question and end interview early (new)
- [x] Text-to-Speech & Voice Selection — pick the AI interviewer's voice and speaking speed in Settings
- [x] Notifications & Reminders — opt-in daily practice reminder (Notification API, fires once/day while the app is open — not true push) and a weekly progress report with a practice streak
- [x] Offline Question Practice — download the question bank for offline use; browsing and answers work with no network once downloaded
- [x] User Profile & Settings — skills, target role, preferred language, voice preferences, account deletion

All 30 originally-specified features are now implemented, with the scoping notes below.

## Project layout
- `src/` — frontend (React + Vite + Tailwind). Landing page at `/`, interview flow at `/interview`, coding + question bank at `/practice`, peer rooms at `/peer`, placement dashboard at `/admin`, your progress at `/reports`, profile/voice/notifications at `/settings`, auth at `/login` and `/signup`.
- `server/` — backend (Express). Generates interview questions, evaluates answers, parses resumes, runs coding submissions in a sandboxed process, serves the question bank, handles auth, persists results to SQLite, and runs peer-room REST + WebSocket endpoints.

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

### Auth configuration
Accounts are stored in a local SQLite file at `server/data/app.db` (created automatically). Sessions are signed JWTs.

Set `JWT_SECRET` in `server/.env` for production — without it the server generates a random secret at startup, which means **every restart signs everyone out**. Fine for local dev, not for a real deployment:
```
JWT_SECRET=<a long random string>
```

## Deploy
- Frontend: import the repo on Vercel — framework preset **Vite**, build `npm run build`, output `dist`.
- Backend: deploy `server/` separately (Render, Railway, Fly.io, etc.) with `ANTHROPIC_API_KEY` and `JWT_SECRET` set, and point the frontend's `VITE_API_URL` at it. **Needs a host with a persistent disk** (Render/Railway/Fly all have one) — a stateless/serverless platform (plain Vercel functions) will reset the SQLite file on every cold start, so avoid that for the backend specifically.
- The peer-interview WebSocket (`/ws/peer`) needs a host that keeps a long-lived process and supports WS upgrades — true of Render/Railway/Fly, not of a serverless function.

## Known limitations
- **Code execution sandbox**: the Live Coding Interview runs submitted JavaScript in a separate child process with a memory cap and a hard timeout — isolation for one trusted user running their own practice code, not a hardened multi-tenant sandbox (it does not block network or file-system access from inside that process). Don't expose it as a public, unauthenticated service.
- **react-router-dom**: there's an open advisory (open-redirect in `<Link>`/`useNavigate`, SSR-hydration issue) with no fix yet on the 6.x line — only 7.x is patched. Not exploitable here since this is a client-only SPA with no SSR and no route targets built from untrusted input, but worth a deliberate v7 migration later.
- **Placement-cell signup is self-service** (feature 22 needs some way to create that role without a full invite system to demo it): signup lets anyone pick "Placement cell". Fine for a personal/demo project; a real deployment should replace this with admin-invited accounts.
- **SQLite, single file**: fine for one deployment's worth of users; a multi-instance/horizontally-scaled deployment would need a networked database (Postgres, etc.) instead.
- **Daily reminder is in-tab only**: it uses the browser Notification API, not a real push service (no service worker, no VAPID keys) — it only fires once a day while InterviewAI is open in a tab, not when the device is locked or the tab is closed. Upgrading to true push would mean adding a service worker and a push subscription backend.
- **Offline practice covers the question bank only**: there's no service worker/app-shell caching, so the app itself still needs network to load; once loaded, a downloaded question bank works fully offline (browsing, categories, answers). The AI-graded interview and coding flows always need the backend reachable.
