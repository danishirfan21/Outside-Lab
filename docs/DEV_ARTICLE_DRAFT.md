# I Built an AI That Wants Me to Put My Phone Away

> **Hacktoberfest 2026 · Touch Grass**
>
> Tags when posting: `#devchallenge` and `#hf26challenge`
>
> **Before publishing:** This is an article DRAFT. Replace bracketed placeholders with **actual** links, measurements, screenshots, and observations. Open the official challenge's submission template and use its required sections.

## The problem I didn't expect

I work at a computer. On many days, almost everything I need is delivered through a screen: messages, work, groceries, and entertainment. I wanted to create something with AI that would make the world outside feel worth visiting, even if 'outside' only meant the courtyard at home.

I considered GPS-powered experiences, satellite maps, bird sounds, gardening and microclimates. Most could be explored from indoors, or required specialized sensing that a phone browser cannot reliably provide.

Eventually I asked a different question: **What if AI didn't give me more to look at, but gave me a reason to close the app?**

## What I built

Meet **Outside Lab**. It helps you try a small outdoor activity and observe how you personally feel afterward.

1. Select your current mood, an activity, and a short duration.
2. Start a session, put the phone away, and spend time in a safe outdoor spot.
3. Return to the app, record your mood, and optionally write one sentence about the experience.
4. Ask an open-weight AI model to suggest the next experiment based on real sessions.

The app shows elapsed time and self-reported mood changes, not invented productivity scores or automatic GPS-based outdoor detection.

**Repository:** [ADD REAL REPO LINK]

**Live demo or recording:** [ADD LINK]

**Actual outdoor screenshots:** [ADD SCREENSHOTS]

## Why open-weight AI is essential to my experiment

A normal timer doesn't know what you've tried. A rigid habit app tells you to hit the same number every day. I wanted a model to consider a sequence of real sessions and propose a new, manageable experiment: sit instead of walk, compare being outdoors with a pet, or change one variable at a time.

I used **Qwen3-4B**, an Apache-2.0 open-weight model, accessed through **Backboard's unified API**. The model is responsible for proposing next experiments and explaining why the next one is worth trying. Ordinary deterministic code calculates session duration and the difference between the person's self-reported before/after ratings.

The model route is configurable. Open weights matter because the app's behavior can be inspected, evaluated, and eventually served outside the hosted provider. This prototype **does not** claim the inference currently runs on-device or offline.

**Actual Backboard model/provider verified:** [ENTER MODEL AFTER LIVE TEST]

**Proof the model used the previous session:** [ADD REAL BEFORE/AFTER PROMPT + OUTPUT COMPARISON]

## How I built it

- React + TypeScript frontend, mobile-first responsive design.
- FastAPI endpoint with server-side Backboard credentials.
- Local browser storage for user-reported sessions.
- Independent Backboard requests with recent session summaries, no need for remote agent memory.
- Schema-validation and honest error handling: if Backboard fails, the UI does not invent AI output.

The prototype also includes a dependency-free browser preview to reduce setup friction.

## My actual outdoor test

> Fill this in after doing the test outdoors. Don't invent a positive outcome.

**Location type:** [Courtyard / garden / accessible rooftop, no exact address]

**Session 1:** [Activity, actual start/end, duration, mood before and after, observations]

**Session 2:** [Activity, actual start/end, duration, mood before and after, observations]

**What the AI suggested afterward:** [Paste the actual model output]

**Did I want to continue?** [Honest reflections, what was awkward, what surprised you]

A change in self-reported mood after a short session is not proof that outdoor time caused it. That's why Outside Lab frames its suggestions as experiments rather than medical conclusions.

## What didn't work, and what I cut

This is a prototype, not a completed wellness platform. It does not detect whether someone is truly outdoors, infer air quality at five-foot resolution, or prove mental-health outcomes. Automatic location verification, notifications, wearable sensors, public-route planning, and cloud accounts were all cut.

**Technical challenges discovered during final testing:** [ADD ACTUAL ISSUES]

**Current tests:** Backend automated tests and a scripted flow for the dependency-free preview. React production build and live model behavior must be verified before describing them as tested.

## Future roadmap

With more time, I would test whether users return to the app after a week and whether AI-proposed comparisons teach them anything useful. Later enhancements could include weather-aware suggestions, more outdoor activities, optional activity sensors, better longitudinal analysis, and Urdu-language coaching.

But the guiding idea stays the same: the best moment in Outside Lab is when you close it and go outside.

---

## Prize categories

- Best Use of Backboard **only if the actual open-weight model call has been tested and demonstrated**.
- Overall Touch Grass category.

**Acknowledgements:** This project used AI coding assistance. The source repository and tests document the implementation; all on-device/outdoor observations are independently reported and not simulated.
