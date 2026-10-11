# Outside Lab — Final Release Report

Date: October 12, 2026 (PKT)

## 1. Implementation status

The core prototype is implemented: mood check-in, activity and duration selection, timestamp-derived session timing, return/reflection, local journal, deterministic statistics, and an optional server-side Backboard recommendation path. There are no accounts, GPS checks, social features, or fabricated history.

## 2. Changes made in final integration

- Corrected the footer repository link.
- Added full catalog pagination to `backend/check_models.py`; it now fails clearly when the configured model is missing or lacks JSON support.
- Set the safe default model identifier to `qwen/qwen3-8b` after the current catalog showed the earlier Qwen3-4B identifier was unavailable.
- Confirmed Qwen3-8B is Apache-2.0 open-weight according to its model card and listed by Backboard with JSON support.
- Fixed navigation so a stopped-but-unsaved session returns to reflection rather than treating it as a running timer.
- Added a timestamp-recovery assertion and updated the submission, Android, and release documentation.

## 3. Test results

| Check | Result |
| --- | --- |
| `npm test` | Pass — 8 frontend domain tests |
| `npm run build` | Pass — production Vite build |
| `python -m pytest backend/tests -q` | Pass — 12 backend tests |
| `python check_models.py` | Pass — configured Qwen3-8B found with JSON support |
| Three bounded live checks (plain text, JSON mode, full route) | Failed safely — Backboard run status `FAILED`; no recommendation claimed |
| Android / physical outdoor testing | Not executed |

The automated test suite verifies timer calculations, malformed timestamps, duplicate prevention, mood/API validation, missing credentials, malformed model output, access-code protection, upstream downtime, and the mocked history/request contract. It does not prove a physical phone's browser lifecycle behavior.

## 4. Backboard configuration and inference status

Set these only in `backend/.env` or the host secret store:

```env
BACKBOARD_API_KEY=your_real_key
BACKBOARD_PROVIDER=openrouter
BACKBOARD_MODEL=qwen/qwen3-8b
```

Run `python check_models.py` from `backend/` before recording. The implementation uses Backboard's non-streaming messages endpoint with `X-API-Key`, model/provider overrides, memory and web search disabled, and JSON output requested. The returned `content` is schema-validated before the frontend uses it.

A configured key was detected during this review. The catalog lookup succeeded, but the three permitted progressive requests all returned HTTP 200 with Backboard terminal status `FAILED`; the full route surfaced the deliberate `upstream_not_completed_failed` development diagnostic. This means the failure occurs at upstream model execution, before JSON parsing or schema validation. The exact upstream detail is not surfaced or logged to avoid leaking request data or credentials. Live personalization is therefore **not verified**. The mocked contract confirms saved browser sessions are serialized into the request, but a real personalized result must be captured after resolving the service response.

## 5. Android testing instructions

```powershell
# Window 1
cd 'D:\Outside Lab\backend'
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000

# Window 2
cd 'D:\Outside Lab\frontend'
npm run dev

# Window 3
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike '127.*'} | Format-Table IPAddress,InterfaceAlias
```

On the same Wi-Fi, open `http://<LAPTOP_IPV4>:5173` in Android Chrome. Allow Vite/Node through Windows Firewall on Private networks if prompted. Vite listens on the LAN because the npm `dev` script uses `--host 0.0.0.0`; `/api` remains same-origin from the phone and Vite proxies it to the laptop's `127.0.0.1:8000`. Do not make port 8000 public.

Physical-device checklist:

- Open the LAN URL in Android Chrome.
- Start a real outdoor session, lock/background the phone, and return after several minutes.
- Confirm displayed duration matches elapsed wall-clock time.
- End, reflect, save once, refresh, and verify one journal entry and accurate statistics.
- Request a real AI recommendation only after the model catalog check succeeds.

## 6. Remaining blockers

1. Live Backboard inference currently returns the safe error state despite a valid catalog lookup.
2. No physical Android, browser-background, or real outdoor session has been performed.
3. No authentic demo, screenshots, personal observations, or successful live AI output have been captured.

## 7. Steps the owner must perform before submission

1. Diagnose and resolve the live 502 with the Backboard account/configuration, without exposing the key.
2. Run an actual outdoor session and Android checklist.
3. Capture an authentic Qwen recommendation that uses the completed session history.
4. Replace all placeholders in `DEV_ARTICLE_DRAFT.md` with real URLs, screenshots, observations, and output.
5. Publish the DEV post using the official template and tags only if the challenge is still accepting entries.

## 8. Submission readiness assessment

The repository is code-ready for local review: build and automated tests pass, source control excludes secrets and generated dependencies, and the documented model is open-weight and JSON-capable. It is **not evidence-ready for a final Hacktoberfest submission** until live inference and physical/outdoor evidence are completed. The official Week 1 page lists submissions due October 11, 2026 and currently marks the challenge as ended; confirm the submission state before investing in publication.
