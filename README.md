# Operation Dark Spot: Detective Agency 🕵️‍♂️🔍

> **Important:** AI findings are potential signals, not guaranteed facts. Always verify requirements directly with the official source.

**Operation Dark Spot** is a web app that reviews several sources about a topic and shows what is missing, conflicting or outdated before you decide. Every finding links to an exact quote that the server has checked against the source text. A Shinchan-inspired detective game makes verifying the checklist more engaging.

Built for the Shinchan Online Hackathon 2026 (problem: *Digital Dark Spot*).

**Demo video:** [Watch the walkthrough](https://drive.google.com/file/d/1UefwqoW8RWFIGtJeK3QJSkbC-M3jNfUl/view?usp=sharing)

**Live demo:** [operation-dark-spot.vercel.app](https://operation-dark-spot.vercel.app/) (use "Play as guest")

---

## The Problem It Solves

When people prepare applications for major life opportunities—such as applying for the **HDFC Bank Parivartan ECSS Scholarship** or filing for specified international visas—they typically search Google and consult multiple articles, blogs, forums, and portals.

This creates dangerous "dark spots":
1. **Factual Conflicts:** Unofficial articles state conflicting eligibility numbers (e.g., claiming 60% cutoff when official policy is 55%, or claiming a 6 Lakh income ceiling instead of 2.5 Lakhs).
2. **Regulatory Gaps:** Crucial details are omitted by secondary summaries (e.g., whether siblings can co-apply, or how pending exam marks are verified).
3. **Outdated Clauses & Scams:** Aggregators repeat defunct pilot rules or advertise paid broker submission services that violate official zero-fee policies.
4. **Hallucination & Ungrounded Claims:** Standard AI summaries synthesize answers without quote verification, sometimes fabricating policies or dates.

Operation Dark Spot eliminates these hazards by treating all source documents as untrusted, extracting only verifiable verbatim quotes, and cross-examining citations in server code.

---

## The 3-Step Forensic Pipeline

The application backend (`server.ts`) executes a strict three-phase investigation pipeline:

```
[User Query + URLs / Pasted Text]
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ Phase 1: Parallel Fetch & Sanitization                 │
│ • 5-second per-URL timeout                             │
│ • blocks localhost and private IP address literals     │
│ • Strips scripts, styles, navigation menus, ads        │
│ • Fallback to r.jina.ai for JS-rendered/PDF pages      │
│ • Code-computed freshness from page-declared dates     │
└────────────────────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Parallel Claim Extraction & Quote Validation  │
│ • Gemini Flash extracts verbatim factual sentences     │
│ • Untrusted prompt isolation                           │
│ • IN-CODE quote verification (exact match & 5-word     │
│   n-gram sliding window >= 85%)                        │
│ • Noise filter: Rejects quotes < 4 words               │
│   or > 50% uppercase words as navigational noise       │
└────────────────────────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: Forensic Cross-Examination & Dossier Creation │
│ • Discrepancy comparison across verified claims        │
│ • Information gap detection against expected topics    │
│ • Identification of outdated circulars/deadlines       │
│ • Interactive XP Dark Spots resolution checklist       │
│ • Automatic referral to the official source            │
└────────────────────────────────────────────────────────┘
```

### 1. Fetch & Declared Date Extraction (`/api/fetch-sources`)
- Runs parallel network fetches with strict 5-second timeouts.
- Never reads HTTP `Last-Modified` headers (which often just reflect CDN caching).
- Inspects real page-declared dates: `meta article:published_time`, `article:modified_time`, `og:updated_time`, Schema.org JSON-LD `datePublished`/`dateModified`, and `<time datetime>` tags.
- Categorizes freshness in code:
  - **Fresh** (<= 180 days)
  - **Aging** (<= 540 days)
  - **Old** (> 540 days, or undated with older year references)
  - **Undated**

### 2. Extract Claims & In-Code Quote Verification (`/api/extract-claims`)
- Prompts Gemini to return up to 14 claims explicitly stated in the text.
- Rejects noise: ignores headers, navigation menus, ads, and footers.
- **Noise filter:** Claims with quotes under 4 words or with >50% capitalized words are rejected as navigational noise.
- Every quote is checked in server code: normalized whitespace, case, dash, and curly quote matching, with an 85% overlapping 5-word n-gram fallback. Only verified quotes advance to the dossier.

### 3. Cross-Examination & Comparative Synthesis (`/api/analyze`)
- Maps discrepancies between sources. When one source is official, the analysis designates it as the authoritative benchmark.
- Identifies missing critical topics (gaps) and dated clauses (outdated).
- Generates an actionable, prioritised Dark Spots Resolution Checklist with assigned detective XP rewards.

---

## Evidence & Uncertainty Hierarchy

Operation Dark Spot never presents AI-generated text as absolute truth. Every finding is labeled with a clear confidence badge:

| Badge | Meaning | Applied To |
|-------|---------|------------|
| 🟢 **Sourced** | High confidence: Both opposing quotes were verified word-for-word in their respective source texts, or date-based outdated flags were computed in code. | Fact conflicts with two verified quotes; date-based outdated flags computed in code |
| 🟡 **Uncertain** | Needs review: One of the quotes could not be completely verified against source text. | Conflicts with an unverified citation |
| 🔵 **AI suggestion** | Inferred hypothesis: Identified by the AI model based on what is missing from the provided sources. | Gaps, only the AI's own outdated signals, and checklist tasks |

In addition, each source card displays its **page-declared publication and modification date**, accompanied by a color-coded freshness pill (`Fresh`, `Aging`, `Old`, or `Undated`).

---

## Detective Personas

All detective avatars share the exact same underlying forensic engine, but each tailors the UI experience:
- 🕵️ **Shin-chan** (`#FFD21F`, `#E03A3A`) — Prioritizes **Gaps** ("What's missing?")
- 👩 **Misae** (`#F7B3B0`, `#B3261E`) — Prioritizes **Checklist** ("Did we verify every document?")
- 🤓 **Kazama** (`#BFD9FF`, `#1F3A8A`) — Prioritizes **Conflicts** ("Evidence records must be consistent!")
- 😰 **Masao** (`#DDD6C6`, `#1B7F79`) — Prioritizes **Outdated** ("Check the dates carefully!")
- 🐶 **Shiro** (`#FFE3C2`, `#E07B00`) — Prioritizes **Outdated** ("Woof! Sniff out stale breadcrumbs!")

---

## Setup & Environment

### Prerequisites
- Node.js 18+
- A Google Gemini API Key (`GEMINI_API_KEY`). Note: `GEMINI_API_KEY` must be set as an environment variable on the host.
- Optional: Firebase project for cloud profile persistence (Google Auth + Firestore)

### 1. Environment Variables
Create a `.env` file in the project root (see `.env.example`):

```bash
# Required for Gemini AI calls (server-side only)
GEMINI_API_KEY="your-gemini-api-key"

# Optional Cloud Run / hosting URL
APP_URL="http://localhost:3000"

# Port (defaults to 3000)
PORT=3000
```

### 2. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Firebase Configuration (Optional)
If Firebase is configured, user profiles (`displayName`, `avatar`, `xp`, `badges`, `casesClosed`) persist in Firestore under `users/{uid}`.
- If Firebase is not configured or fails, **Guest Mode** automatically provides full functionality in local memory without errors.

---

## Security & Architecture Highlights

- **Server-Side AI Secrets:** The `GEMINI_API_KEY` is kept strictly on the Express backend (`server.ts`); it is never exposed to client-side bundles.
- **SSRF Defense:** URL fetching explicitly resolves domains and blocks localhost and private IP address literals.
- **Internal ID Sanitization:** All internal claim IDs (e.g. `S1-C1`) are sanitized from visible UI text via `stripClaimIds()`.
- **Keyboard & Mobile Accessibility:** All modal drawers, tabs, and interactive buttons feature high-contrast visible focus rings (`focus-visible:ring-4`), accessible ARIA attributes, and fluid responsive styling.
