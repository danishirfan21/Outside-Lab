# Outside Lab: an AI experiment designed to get me off my phone

> Hacktoberfest 2026 — Touch Grass
>
> This is a publication draft. Replace every bracketed item with real evidence before posting. Use the DEV submission template so `#devchallenge` and `#hf26challenge` are applied.

## What I Built

Outside Lab is a small outdoor-experiment journal. It asks for a before-session mood rating, a chosen activity, and a short duration; then it encourages the person to put their phone away. When they return, it records the actual timestamped duration, an after-session mood rating, and an optional observation.

The journal is local to the browser. It shows factual, self-reported history and mood changes; it does not claim GPS verification, medical benefits, or causal proof.

The open-weight model is used for one specific job: after a person has real history, it proposes the next small experiment and explains its limited evidence. A conventional timer can count minutes. It cannot use the sequence of chosen activity, reported duration, mood change, and note to choose a different next comparison.

## Demo

- Demo recording: [ADD REAL RECORDING URL]
- Outdoor screenshots: [ADD REAL SCREENSHOTS]
- Real device and outdoor observations: [ADD AFTER TESTING]
- Live Backboard output: [PASTE A REAL, SUCCESSFUL OUTPUT]

Do not use simulated timer screenshots or an invented recommendation as evidence.

## Code

Repository: https://github.com/danishirfan21/Outside-Lab

The primary frontend is React and TypeScript. FastAPI keeps the Backboard key on the server. Browser storage holds sessions; only a bounded summary of the most recent sessions is sent when the person explicitly asks for an AI idea.

## How I Built It

- Timestamp-based session timing survives backgrounding better than a counter: elapsed time is derived from `startedAt`, and the return timestamp is captured before reflection.
- Refresh recovery returns to an in-progress timer or an unfinished reflection, rather than silently losing it.
- Completed sessions are idempotent by ID, so a repeated save cannot duplicate a journal entry.
- The FastAPI adapter uses Backboard's `POST /api/threads/messages`, an `X-API-Key` only on the server, `memory: "off"`, `web_search: "off"`, and `json_output: true`.
- The response is parsed as JSON and validated against a bounded recommendation schema. An upstream failure produces an error state, never a fabricated AI suggestion.

Automated verification on October 12, 2026: 8 frontend domain tests, 9 backend tests, and the React production build passed. The Backboard catalog listed `openrouter/qwen/qwen3-8b` with JSON support. One live request was attempted but returned the app's safe AI-unavailable response; therefore this draft does **not** claim successful live inference or a real personalization example yet.

## Why Does Open Innovation Matter?

Outside Lab uses Qwen3-8B, an Apache-2.0 open-weight model, through Backboard. Its model route is configuration rather than a hidden application constant, so the project can inspect, evaluate, and replace its model choice without changing the personal-journal logic. The model's role is narrow and inspectable: turn user-provided history into one suggested comparison, not manufacture wellness statistics.

This prototype uses hosted inference, so it is not an offline or on-device AI application. That is a current limitation, not a claim to hide. The Qwen weights remain separately licensed and are not bundled with this repository.

## Prize Categories

- Overall Touch Grass category.
- Best Use of Backboard — enter only after a real successful Backboard response is captured and shown in the demo.

## What I Still Need to Do Personally

1. Complete at least one genuine outdoor session and record only what actually happened.
2. Test the Android flow: background/lock the phone, return, save, and inspect history.
3. Resolve the live Backboard error, then capture the model's real output based on real saved history.
4. Add the demo URL, screenshots, and honest observations above.

## Future Work

Weather context, more activity types, cloud sync, wearable sensing, and local inference are ideas only. They are not part of the submitted prototype.
