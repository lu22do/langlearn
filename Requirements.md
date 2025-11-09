# Adaptive Language Learning App — Requirements v1.0

## Product vision

Help learners turn any text they encounter into something they can get back to later in the form of personalized micro‑lessons. The app adapts to each learner’s pace and preferences via a new style of “flash card” that offer progressive disclosure of meaning (examples → explanation → translation) when the user does not remember or wants to deep dive in the details. The app should also offer a way for the user to indicate if they have acquired the content of the snippet. There should also be some ways on user asks to generate some quizzes based on all the snippets that are not yet acquired.

## Core concepts & glossary

- **Snippet**: a learner‑selected token or phrase (single word or multi‑word expression) clipped from any source text along with its context.
- **Prompt box**: a text input area where learners paste any string to mine snippets.
- **Context**: the original sentence/paragraph and optionnaly some metadata about the source (URL, title, author, date, import method).
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

- Present due snippets in a micro-lesson lane based on scheduling (see §8).
- Per snippet, provide on‑demand actions:
  - `Get example(s)` (in learning language)
  - `Get explanation` (in learning language)
  - `Get translation` (into base language; default English)
- Capture user interaction telemetry: which hints used, correctness, latency, confidence.
- Optional production modes: typing, speaking (ASR), or selecting from close distractors.

### Personalization & adaptation

- Maintain a **difficulty score d ∈ [0,1]** per snippet per learner, updated after each attempt using performance (accuracy), hesitation time, and hint usage.
- Schedule review using a hybrid of stability‑based spaced repetition and short‑term interleaving (see §8).
- Content selection balances: due date, difficulty, and topical diversity (avoid back‑to‑back homogenous items).
- Language‑specific features: gender, cases, aspect/tense, separable prefixes, collocations; tracked as attributes to drive targeted prompts.

### Content generation (examples/explanations/translations)

- Examples and explanations must be **in learning language** and graded to CEFR level target set in User Preferences.
- Translation defaults to English; user can set another default per profile or per collection.
- Provide **source citations** for examples when pulled from external corpora (future release) or mark as AI‑generated.
- Disallow translation auto‑reveal; it is only shown on tap.

### Organization & discovery

- Collections: user‑defined sets (e.g., “Cooking”, “Train announcements”).
- Smart lists: `New`, `Due`, `Trouble words` (high d), `Mastered` (low d for 3+ recent sessions), `From Article X`.
- Full‑text search across snippet text, lemmas, tags, and context.

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
- Audio: TTS voice, speed; ASR on/off.

## UX & UI requirements (MVP)

- **Home**: prompt box + recent sources + quick “Review now” CTA.
- **Annotator**: paste area → tokenized text → drag‑select to create snippets → "Save".
- **Review (Micro-lesson lane)**: list of tiles with progressive disclosure chips and response inputs.
- **Snippet detail**: full context, morphology, tags, history, edit.
- **Search/Collections** and **Settings**.
- Keyboard‑first navigation; all actions reachable without a mouse.
- Mobile first, but responsive up to desktop.

## 8) Scheduling & scoring (adaptation engine)

- **Per‑attempt inputs**: correctness (0/1/partial), response time, hints used (E/X/T), self‑assessment (Easy/Struggled/Unknown).
- **Update rule (illustrative)**:
  - Base delta = +0.15 for incorrect, −0.12 for correct; clamp d to [0,1].
  - Add +0.05 if Translation was used; +0.03 if Explanation used; +0.02 if Example used.
  - Add +0.04 if response time > 2× median; subtract −0.04 if < 0.5× median.
- **Next due interval** (minutes → days):
  - `interval = f(1−d, stability)` where stability increases on easy wins and decreases on struggles.
  - Map to tiers: 10m, 1h, 1d, 3d, 1w, 3w, 2m, 6m, 1y (configurable).
- **Session composition**: 70% due items, 20% near‑due with high d, 10% new.

## 9) Data model (MVP)

**User**

- id, email, display\_name, locales[], l1\_default (ISO‑639‑1), cefr\_targets{lang→level}, preferences{hint\_policy, tts\_rate, …}

**Source**

- id, type{paste,url,upload}, title, metadata{url, author, date}, raw\_text

**Snippet**

- id, user\_id, source\_id, lang, text, lemma, pos, start\_idx, end\_idx, context\_sentence, context\_paragraph, tags[], created\_at
- attributes{gender, case, tense, aspect, collocations[], audio\_url?}
- difficulty\_d, stability\_s, last\_reviewed\_at, next\_due\_at

**Attempt**

- id, snippet\_id, user\_id, timestamp, correctness, latency\_ms, hints{example\:boolean, explanation\:boolean, translation\:boolean}, self\_assessment{easy|struggled|unknown}

**Collection**

- id, user\_id, name, snippet\_ids[], rules?

## 10) API (REST, illustrative)

- `POST /sources` {type, raw\_text, metadata}
- `POST /snippets` {source\_id, range, lang, tags}
- `GET /snippets?query=…&tag=…&due=true`
- `POST /review/next` {session\_id} → returns ordered snippet IDs
- `POST /attempts` {snippet\_id, correctness, latency\_ms, hints, self\_assessment}
- `POST /hints/examples` {snippet\_id, cefr\_target}
- `POST /hints/explanation` {snippet\_id, cefr\_target}
- `POST /hints/translation` {snippet\_id, target\_lang}
- `PATCH /users/{id}/prefs` {l1\_default, cefr\_targets, hint\_policy}

## 11) Content quality rules

- Examples must be natural, concise (≤20 words), and include the snippet.
- Explanations must define usage, register, and typical collocations; avoid metalanguage for A1–A2.
- Translations must be literal unless flagged as idiomatic; include note when idiomatic.

## 12) Accessibility & internationalization

- WCAG 2.2 AA: keyboard focus visible, ARIA for chips and drill controls, sufficient contrast.
- RTL support.
- Numeric & date localization; IETF language tags for all content.

## 13) Privacy & safety

- All user text and snippets are private by default; opt‑in sharing.
- Data retention: raw sources can be deleted while keeping anonymized snippet stats.
- If AI‑generated hints are used, label outputs and provide a "Report issue" flow.

## 14) Telemetry & success metrics

- Metrics: daily active learners, session length, snippets added/learned, hint mix (E/X/T rates), retention at D7/D30.
- Learning KPIs: decrease of average d over 30 days, production accuracy without hints.

## 15) Offline & performance (stretch)

- Local cache of due snippets and last 20 sources for offline review; sync on reconnect.
- Target P95 interaction latency < 150ms for hint reveals.

## 16) MVP scope

- Paste → highlight → save snippets.
- Micro-lesson lane with progressive disclosure (E/X/T) and typing response.
- Basic adaptation: d‑score update + tiered intervals; due list.
- Settings for default translation language and hint policy.
- Search and simple collections.