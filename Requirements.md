# Adaptive Language Learning App — Requirements v1.0

## Product vision

Help learners turn any text they encounter into something they can get back to later in the form of personalized micro‑lessons. The app adapts to each learner’s pace and preferences via a new style of “flash card” that offer progressive disclosure of meaning (examples → explanation → translation) when the user does not remember or wants to deep dive in the details. The app offers a way for the user to indicate if they have acquired the content of the snippet. There is also some ways on user asks to generate quizzes based on all the snippets that are not yet acquired. In general, the app prioritizes using the target language (including for the UI) rather than using the base language (although there could be quick way to translate when needed).

## Core concepts & glossary

- **Prompt box**: a text input area where learners paste any string, a prompt, to mine snippets.
- **Snippet**: a token or phrase (single word or multi‑word expression) selected from the prompt and saved (along with the orginal prompt).
- **Learnies (Learning material)**: Set of learning material associated with a snippet: examples (in learning language), explanation and grammar rules (in learning language) and  translation (base language, default English unless changed).
- **Progressive disclosure**: help surfaces learning material in escalating order of “helpfulness” and dependency on the base language: examples → explanation → translation.
- **Micro-lesson lane**: a scrollable stream where each item is treated as an individual micro‑lesson rather than part of a fixed deck for practicing snippets with quick interactions, hints, and short productions.

## Functional requirements

### Text ingestion & snippet creation

- Paste or import text (min 1 char, max 20k chars per paste in MVP).
- Tokenize text; allow user to select contiguous spans to form a snippet.
- Actions on snippet: 
  - generate learnies (one inference to generate all), progressively disclosed
  - save (just the snippet or the snippet + learnies)
- Store snippet with: raw text, lemma, Part of Speech, language code, source context, user tags, created_at.
- Support multi‑word expressions and inflected forms; link variants to a canonical lemma when available.

### Snippet review

- Present due snippets in a micro-lesson lane based on scheduling.
- Per snippet, provide on‑demand actions for progressive disclosure:
  - `Get example(s)` (in learning language)
  - `Get explanation` (in learning language)
  - `Get translation` (into base language; default English)

### Personalization & adaptation

- Maintain a **difficulty score d ∈ [0,1]** per snippet per learner, updated after each attempt using performance (accuracy), hesitation time, and hint usage.
- Schedule review using a hybrid of stability‑based spaced repetition and short‑term interleaving.
- Content selection balances: due date, difficulty, and topical diversity (avoid back‑to‑back homogenous items).
- Language‑specific features: gender, cases, aspect/tense, separable prefixes, collocations; tracked as attributes to drive targeted prompts.

### Content generation (examples/explanations/translations)

- Examples and explanations must be **in learning language** and graded to CEFR level target set in User Preferences.
- Translation defaults to English; user can set another default per profile or per collection.
- Disallow translation auto‑reveal; it is only shown on tap.

### Snippet acquisition

- Allow marking individual snippets as acquired.
- Automatically lower frequency for acquired snippets.
- Offer options to temporarily unmark as acquired if needed.

### Quiz generation

- Generate quizzes based on not-yet-acquired snippets.
- Support different quiz formats (multiple-choice, fill-in-the-blank, typing, sentence completion).
- Allow users to set quiz length and difficulty.

### Settings

- base language default for translations (default: English).
- CEFR target per language.
- Hint policy (allow/disable translation, limit number of hints per session).

## UX & UI requirements

- **Home**: prompt box + quick “Review now” CTA.
- **Annotator**: paste area → tokenized text → drag‑select to create snippets → "Save".
- **Review (Micro-lesson lane)**: list of tiles with progressive disclosure chips and response inputs.
- **Snippet detail**: full context, morphology, tags, history, edit.
- **Search/Collections** and **Settings**.
- Keyboard‑first navigation; all actions reachable without a mouse.
- Mobile first, but responsive up to desktop.

## Scheduling & scoring (adaptation engine)

- **Per‑attempt inputs**: correctness (0/1/partial), response time, hints used (E/X/T), self‑assessment (Easy/Struggled/Unknown).
- **Update rule (illustrative)**:
  - Base delta = +0.15 for incorrect, −0.12 for correct; clamp d to [0,1].
  - Add +0.05 if Translation was used; +0.03 if Explanation used; +0.02 if Example used.
  - Add +0.04 if response time > 2× median; subtract −0.04 if < 0.5× median.
- **Next due interval** (minutes → days):
  - `interval = f(1−d, stability)` where stability increases on easy wins and decreases on struggles.
  - Map to tiers: 10m, 1h, 1d, 3d, 1w, 3w, 2m, 6m, 1y (configurable).
- **Session composition**: 70% due items, 20% near‑due with high d, 10% new.

## Data model (MVP)

**User**

- id, email, display_name, locales[], l1_default (ISO‑639‑1), cefr_targets{lang→level}, preferences{hint_policy, tts_rate, …}

**Snippet**

- id, user_id, lang, text, context_sentence, created_at
- attributes{gender, case, tense, aspect, collocations[]}
- difficulty_d, stability_s, last_reviewed_at, next_due_at

**Attempt**

- id, snippet_id, user_id, timestamp, correctness, latency_ms, hints{example\:boolean, explanation\:boolean, translation\:boolean}, self_assessment{easy|struggled|unknown}

## API (REST, illustrative)

- `POST /snippets` {text, lang, context_sentence}
- `GET /snippets?query=…&tag=…&due=true`
- `POST /review/next` {session_id} → returns ordered snippet IDs
- `POST /attempts` {snippet_id, correctness, latency_ms, hints, self_assessment}
- `POST /hints/examples` {snippet_id, cefr_target}
- `POST /hints/explanation` {snippet_id, cefr_target}
- `POST /hints/translation` {snippet_id, target_lang}
- `PATCH /users/{id}/prefs` {l1_default, cefr_targets, hint_policy}

## Content quality rules

- Examples must be natural, concise (≤20 words), and include the snippet.
- Explanations must define usage, register, and typical collocations; avoid metalanguage for A1–A2.
- Translations must be literal unless flagged as idiomatic; include note when idiomatic.

## User journeys

- Paste text → highlight → save snippets.
- Micro-lesson lane with progressive disclosure (E/X/T) and typing response.
- Basic adaptation: d‑score update + tiered intervals; due list.
- Settings for default translation language and hint policy.
- Search and simple collections.