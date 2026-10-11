# Outside Lab 🌿

**Less screen. More sky.** A Hacktoberfest 2026 *Touch Grass* prototype that asks one small question: *Which kinds of short outdoor breaks feel worthwhile to you?*

Instead of rewarding phone usage, Outside Lab asks the user to check in, put the phone away, spend a few minutes outdoors, return, and reflect. The app keeps a factual personal journal. An **open-weight Qwen model**, accessed through **Backboard**, suggests the next experiment based on real user-submitted session summaries.

## What works now

- 3-stage flow: mood check-in → outdoor session → reflection.
- Timestamp-based timer that can recover if the browser page refreshes in the React version.
- Sitting, gentle walking, or spending time with a pet, including within a private courtyard.
- Local session history and minutes **self-reported** outdoors.
- Real (not simulated) Backboard integration endpoint with typed JSON validation and error handling.
- Model requests use only the last 12 short session summaries; no GPS, microphone, photos, accounts, or health records.
- A clearly labeled starter activity works when AI is not configured; it is **never passed off as an AI response**.
- Backend cost-control rate limiting and an optional access code for private deployments.

## Fastest possible preview (no npm required)

Open `preview/index.html` in a browser. It implements the end-to-end check-in, timing, reflection and local journal without dependencies. For live Backboard calls, run a local web server instead of opening it as `file://`:

```bash
cd preview
python -m http.server 8787
```

Open http://localhost:8787. The preview calls the backend at `http://127.0.0.1:8000` (requires the separate backend below). If AI is unconfigured, the preview explains the missing integration and still runs non-AI sessions.

## React + TypeScript frontend (primary version)

Requires Node.js 20+, internet access to install npm dependencies:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. During development Vite proxies `/api` to port 8000. If backend is hosted elsewhere, set `VITE_API_BASE` in `frontend/.env` and ensure its CORS allows your frontend origin.

The React frontend uses Tailwind's toolchain plus a custom responsive stylesheet.

## FastAPI + Backboard backend

Requires Python 3.10+:

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env  # Windows: copy .env.example .env
```

Edit `backend/.env` (never commit it):

```env
BACKBOARD_API_KEY=your_real_key
BACKBOARD_PROVIDER=openrouter
BACKBOARD_MODEL=qwen/qwen3-4b
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8787,http://127.0.0.1:5173,http://127.0.0.1:8787
# For deployment, use a long private value:
API_ACCESS_CODE=
```

**Important:** The Qwen3-4B OpenRouter model slug is documented publicly, but availability and JSON-mode support **inside your own Backboard account are unverified** until you check your live model catalog. If unavailable, use an available open-weight Qwen model from your actual catalog and set `BACKBOARD_MODEL` accordingly. Don't silently fall back to a proprietary model.

Check catalog:

```bash
python check_models.py
```

Start backend from `backend/`:

```bash
uvicorn app.main:app --reload --port 8000
```

Test it:

```bash
curl http://localhost:8000/api/health
```

The API uses Backboard's documented `POST https://app.backboard.io/api/threads/messages` with `X-API-Key`, `llm_provider`, `model_name`, `json_output`, `stream:false`, and memory disabled. Each request is independent; session context comes from your browser. The model must return a strictly validated recommendation object; if it doesn't, the server returns an error rather than a fabricated answer.

## Run tests

```bash
# From repository root
PYTHONPATH=. pytest backend/tests -q
# From frontend/ with npm dependencies available
npm test
npm run build
```

**Verification recorded at packaging:** backend 8/8 tests passed; standalone browser implementation passed a simulated flow (check-in, start, stop, save, journal) in Node. The React production build was **not executed** in this sandbox because npm package downloads timed out. A real Backboard call was **not executed** without an API key. Real outdoor testing is also still outstanding. These items are not claimed as complete.

## Why the open model matters

Without the Qwen model, the app can still time sessions and draw statistics. With the open-weight model, it can use the user's actual history to choose *which experiment to try next* and *what to notice*, without us authoring rigid suggestions for every combination of past experiences. The model is interchangeable; routing and prompts are plain source code.

- Qwen3-4B weights: https://huggingface.co/Qwen/Qwen3-4B (Apache-2.0)
- Backboard API message docs: https://docs.backboard.io/concepts/messages
- Backboard model catalog docs: https://docs.backboard.io/concepts/models
- Challenge: https://dev.to/challenges/hacktoberfest-week1-2026-10-05

Backboard is a hosted inference platform, so AI requests **are sent to an external provider**. Outside Lab does not claim to run the model locally or offline. Users choose to press an AI button; no background AI calls are made.

## Privacy and limitations

- This does not detect outdoor presence. Outdoor minutes are **declared by the user**.
- Mood ratings are personal reflections; they do **not** establish causality, diagnose conditions, or guarantee mental-health benefits.
- Timing is based on wall-clock timestamps, which are convenient but can be changed by device clock changes.
- Local browser storage isn't synced across devices; clearing storage erases it.
- Sending an AI request transmits recent session summaries (mood, timing, activity, optional notes) to Backboard. Do not enter sensitive information in notes.
- In-memory IP rate limiting is a prototype safeguard only. For public deployment, set `API_ACCESS_CODE` and use proper abuse protection. Never put `BACKBOARD_API_KEY` in frontend or screenshots.
- Be sensible about location and weather; use a safe accessible place and stop if conditions feel unsafe. No outdoor location is required beyond your own property.
- Avoid shipping a publicly accessible backend until secrets, CORS, and abuse protection are configured.

## Challenge submission checklist

- [ ] Create and publish a **new GitHub repository** within the challenge window.
- [ ] Set real Backboard API key and verify an open-weight model is selected.
- [ ] Capture **real** screenshots of the running app.
- [ ] Perform two genuine outdoor sessions and record unembellished results.
- [ ] Record a short demo showing the phone put away during the activity and AI suggestion changing when history changes.
- [ ] Publish DEV post using challenge submission template and `#devchallenge` + `#hf26challenge`, including repo and demo.
- [ ] Clearly identify prototype features versus future roadmap; disclose any untested aspects.

The official Week 1 cutoff is **October 11, 2026 at 11:59 PM PDT** (October 12 at **11:59 AM PKT**). See https://dev.to/page/hacktoberfest-week1-2026-10-05-contest-rules/ for rules and geographic eligibility.

## Future work (not implemented)

Optional wearable sensing, weather context, more activities, longitudinal A/B experiment plans, nudges, Urdu guidance, and cloud sync. These are future directions, **not current capabilities**.

## License

This prototype's original code is MIT-licensed (see `LICENSE`). Qwen model weights are separately licensed Apache-2.0 and are **not bundled** with this repository.
