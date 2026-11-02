# Standardized Engineering Catalog, Pedagogical Engine & Verified Code Execution

Transform Skillsoul into an educationally rigorous, technically reliable engineering platform by combining a **2-Tab Standardized Catalog** (*Career Roles* + *Language Mastery*), a **Golden Reference Track** rollout strategy, **Scored Diagnostic Placement**, **Versioned Curriculum Caching**, **Web Worker Sandboxed Execution**, and **Hybrid Deterministic + Staff Engineer Pro Grading**.

## User Review & Critical Decisions

> [!IMPORTANT]
> This revised plan incorporates your architectural and pedagogical improvements:

- **Pedagogical Depth Over Rigid Quotas**: Replaced the rigid "6 chapters / 18 labs" quota with **domain-appropriate chapter progressions (4–6 chapters per track, 1–3 progressive labs per chapter)** featuring explicit learning objectives, interactive concept checkpoints before lab unlock, common pitfalls (*Bad vs. Good Code*), and targeted failure remediation hints tied back to theory sections.
- **Golden Reference Track First (Incremental Rollout)**: Prioritizes building **Python Mastery (Basic → Advanced)** and **Frontend Engineer (TypeScript/JS)** as complete, end-to-end **Golden Reference Tracks** (pre-authored chapters, multi-case unit tests, diagnostic items, and remediation ladders) while providing versioned canonical blueprints and Chapter 1 instant foundations for the remaining catalog tracks.
- **Scored Diagnostic Placement (Not Self-Reported Skip)**: Users only fast-track foundational chapters (`completedViaPlacement: true`) by passing **scored code-reading and debugging diagnostic questions ($\ge 80\%$ accuracy per tier)**. Self-reported experience only determines whether the user is offered the placement challenge or starts directly at Chapter 1.
- **Realistic Pro Scope at Launch**: Focuses **Staff Engineer Pro** on two reliable, high-value capabilities ready for immediate launch: **Staff Engineer Deep Code Reviews** (Big-O complexity, edge-case/security audit, and refactored code diff) and **Verified Portfolio & Certificate Credentials**, deferring multi-turn live Mock Interviews to a later phase.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a structured engineering learning environment where learners choose between **Career Role Paths** and **Language Mastery Paths**, prove existing competency through a scored diagnostic to calibrate their starting chapter on a **versioned canonical syllabus**, practice in a **timeout-protected Web Worker IDE sandbox**, and receive **hybrid deterministic + AI Staff Engineer code reviews**.
- **Target Audience / Persona**: Aspiring software engineers, CS students, and working developers upskilling in core languages (Python, TypeScript/JS, Java, C++, C#, Go, SQL, HTML/CSS) or job roles.
- **Key Value**:
  1. **Genuine Learning Efficacy**: Every chapter enforces an active learning loop (*Mental Model → Worked Examples & Pitfalls → Concept Checkpoint Quiz → Progressive Coding Labs with Hint Ladders*).
  2. **Standardized, Versioned Curriculum (`curriculumVersion`)**: Every learner on a track Version `1.1.0` shares the exact same syllabus and test suites, making certificates verifiable while safely migrating existing user progress when content evolves.
  3. **Reliable Execution & Grading**: User code runs in an isolated Web Worker with a `3,000ms` infinite-loop watchdog, and final scores combine **60% deterministic unit test pass rate** with **40% schema-constrained AI rubric evaluation** (backed by a 100% deterministic fallback if the LLM is unreachable).

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **2-Tab Standardized Track Catalog (`Career Roles` vs. `Language Mastery`)**:
     - Users browse either **Career Roles** (Frontend Engineer, Full-Stack Developer, Backend Systems Architect, Python AI & Data Engineer, DevOps & Cloud Engineer, Cybersecurity Engineer) or **Language Mastery: Basic → Advanced** (Python, TypeScript/JavaScript, Java, C++, C#, Go, SQL, HTML & CSS).
     - Each track card displays its `curriculumVersion` (`v1.1`), chapter count, lab count, and whether it is a **Full Golden Track** or **Canonical Blueprint Track**.
  2. **Competency-Based Diagnostic Placement**:
     - Learners who select *Beginner* go straight to **Chapter 1** with zero friction.
     - Learners who select *Intermediate* or *Advanced* take a **4-question Scored Diagnostic Challenge** (code output prediction, bug identification, and complexity selection) mapped to Tier 1 (Beginner) and Tier 2 (Intermediate) competencies:
       - **Score $< 50\%$**: Placed at **Chapter 1** with a supportive diagnostic breakdown showing which foundational concepts need review.
       - **Score $50\%\text{–}79\%$ (or Tier 1 passed)**: Chapters in Tier 1 are marked **`PASSED VIA DIAGNOSTIC`**, starting the learner at the first **Intermediate** chapter.
       - **Score $\ge 80\%$ across both tiers**: Foundational and Intermediate chapters are marked **`PASSED VIA DIAGNOSTIC`**, placing the learner directly at **Advanced** chapters while keeping earlier chapters unlocked for optional practice.
  3. **Active Learning & Remediation Flow (`RoadmapPage` → `IDEWorkspace`)**:
     - Inside each chapter, learners study the interactive sections, review *Common Pitfalls*, and complete the **Concept Checkpoint** before entering the IDE lab.
     - Inside the IDE, running tests executes the suite and displays per-test input, expected output, actual output, and—on failure—a **Progressive Remediation Hint** linking back to the relevant concept section.
  4. **Staff Engineer Pro Code Review (`IDEWorkspace` & `ProUpgradeModal`)**:
     - Submitting a lab computes the hybrid score. Toggling **Staff Engineer Pro** unlocks the **Deep Architecture & Complexity Review** card inside the grading drawer (`timeComplexity`, `spaceComplexity`, `edgeCaseAudit`, and a side-by-side `refactoredCode` comparison).

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-craft dark technical workspace (`#0A0A0B` obsidian canvas, `#121318` structural panels, `1px solid rgba(255,255,255,0.08)` hairline borders).
  - *Typography & Hierarchy*: `Outfit` / `Plus Jakarta Sans` for display headings (`text-wrap: balance`), `JetBrains Mono` with `tabular-nums` for test runner metrics, latency counters, and code diffs. Metadata uses clean typographic separators (`·`) with zero decorative pill clutter.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Golden Reference Track First vs. Shallow Bulk Generation**
  - *Chosen Approach*: Fully author **Python Mastery** (all 5 chapters from *Variables & Memory Model* to *Asyncio, Generators & Concurrency*, with 2–3 progressive labs per chapter) and **Frontend Engineer (TypeScript/JS)** as complete Golden Reference Tracks first. The remaining 12 tracks use locked canonical syllabuses (`v1.1.0`), pre-authored Chapter 1 modules, and versioned on-demand caching for subsequent chapters.
  - *Why*: Authoring 14 tracks × 6 chapters simultaneously leads to shallow, repetitive boilerplate. Proving high pedagogical craft on the Golden Reference Tracks establishes the exact schema and quality bar while keeping bundle size lean.

- **Decision 2: Scored Diagnostic Placement vs. Self-Reported Skipping**
  - *Chosen Approach*: Require learners claiming *Intermediate* or *Advanced* experience to pass track-specific diagnostic code questions before auto-passing chapters (`completedViaPlacement: true`).
  - *Why*: Self-reported skill levels are notoriously inaccurate; learners frequently overestimate their fundamentals and get stuck on Advanced labs. A 90-second scored diagnostic verifies actual code-reading competency and protects certificate integrity.

- **Decision 3: Web Worker Sandbox + Hybrid Deterministic/AI Grading**
  - *Chosen Approach*:
    - Run JS/TS code inside a dedicated browser **Web Worker** with a `3,000ms` timeout and shadowed globals (`window`, `document`, `fetch` blocked).
    - For Python, SQL, C++, Java, C#, and Go, clearly label execution as **Structured Test Case & AST Verification** combined with deterministic output normalization.
    - Calculate final project scores as **60% Deterministic Test Pass Rate + 40% Constrained AI Rubric (`temperature: 0.1`)**, with an automatic **Deterministic Fallback Grader** if the AI request fails.
  - *Why*: Running `new Function()` on the main thread allows an accidental `while(true)` loop to freeze the entire browser tab, and 100% LLM-based grading produces inconsistent scores across identical submissions.

- **Decision 4: Versioned Curriculum Cache & Measurable Targets**
  - *Chosen Approach*: Embed `curriculumVersion: "1.1.0"` in all track blueprints and cache keys (`{trackSlug}__v1_1_0__ch{levelId}`).
  - *Measurable Targets*:
    - **L1 Pre-Bundled & LocalStorage Hits**: `0 network calls`, `<15ms` synchronous load time.
    - **L2 Firestore Shared Cache Hits**: `<400ms` p95 read latency, maximum `1 Gemini API generation` per `(trackSlug, curriculumVersion, levelId)` across all users.
    - **Schema Migration**: Existing user roadmaps missing `curriculumVersion` are non-destructively upgraded in `db.ts` while preserving all `isCompleted` flags and `projectHistory` entries.

---

## 4. Technical Architecture & Implementation Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                  2-TAB STANDARDIZED CATALOG & DIAGNOSTIC ENGINE              │
│                                                                              │
│  ┌────────────────────────────────┐     ┌─────────────────────────────────┐  │
│  │  Golden Reference Tracks       │     │  Canonical Blueprint Tracks     │  │
│  │  • Python Mastery (Full Ch 1-5)│     │  • 6 Career Roles + 7 Languages │  │
│  │  • Frontend Engineer (TS/JS)   │     │  • Locked v1.1.0 Syllabuses     │  │
│  └───────────────┬────────────────┘     └────────────────┬────────────────┘  │
│                  └───────────────────┬───────────────────┘                   │
│                                      ▼                                       │
│        ┌───────────────────────────────────────────────────────────┐         │
│        │         Scored Competency Diagnostic (Placement)          │         │
│        │  • Beginner choice → Start Ch. 1 directly                 │         │
│        │  • Intermediate/Advanced → 4 Scored Code Questions        │         │
│        │  • Score ≥ 80% on Tier → Mark Tier completedViaPlacement  │         │
│        └─────────────────────────────┬─────────────────────────────┘         │
│                                      ▼                                       │
│        ┌───────────────────────────────────────────────────────────┐         │
│        │     Versioned Curriculum Cache ({slug}__v1_1_0__ch{id})   │         │
│        │  • L1: Bundled / LocalStorage (<15ms, 0 network calls)    │         │
│        │  • L2: Firestore Shared Doc (<400ms p95) → L3: Gemini API │         │
│        └─────────────────────────────┬─────────────────────────────┘         │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │              IDE WORKSPACE: SANDBOX & HYBRID GRADING ENGINE            │  │
│  │  1. Web Worker Sandbox (JS/TS): 3,000ms timeout, isolated global scope │  │
│  │  2. Hybrid Grader: 60% Unit Test Pass Rate + 40% Constrained AI Rubric │  │
│  │  3. Deterministic Fallback: Offline/error resilience without data loss │  │
│  │  4. Staff Engineer Pro: Big-O Audit, Edge Cases & Refactored Code Diff │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Versioned State Enhancements

- **`CurriculumVersion` & Catalog Metadata**:
  - `CURRICULUM_VERSION = "1.1.0"`
  - `TrackCatalogItem`: `{ slug, title, category: 'role' | 'language', primaryLanguage, curriculumVersion, isGoldenTrack, chaptersCount, labsCount, description, tags }`
  - `CareerRoadmap`: adds `curriculumVersion?: string`, `trackCategory?: 'role' | 'language'`, and `placementSummary?: { diagnosticScore: number; placedAtLevelId: number; autoPassedLevelIds: number[] }`.
- **Level & Remediation Enhancements**:
  - `Level`: adds `completedViaPlacement?: boolean`, `learningObjectives?: string[]`, and `estimatedMinutes?: number`.
  - `ProjectTestCase`: adds `failureHint?: string` and `relatedSectionTitle?: string` so failed test cases guide the learner back to the exact concept they missed.
- **Staff Engineer Pro Review Schema (`GradingResult.proReview`)**:
  - `{ timeComplexity: string; spaceComplexity: string; edgeCaseAudit: string[]; securityNotes: string; refactoredSnippet: string }`

### Incremental Implementation & Preservation Steps

1. **Step 1 — Non-Destructive Schema & Versioned Cache Upgrade**:
   - Extend data types with `curriculumVersion`, `completedViaPlacement`, `placementSummary`, and `proReview` while keeping all existing fields backward-compatible.
   - Update cache key generation to `{trackSlug}__v1_1_0__ch{levelId}` and add a safe migration helper so existing saved roadmaps in `localStorage` / Firestore continue working without data loss.
2. **Step 2 — Golden Reference Track (`Python Mastery`) & 2-Tab Catalog**:
   - Build the complete **Python Mastery (Basic → Advanced)** Golden Track (5 deep chapters with worked examples, pitfalls, concept checks, and multi-test labs with failure hints) alongside the **Frontend Engineer** Golden Track and canonical v1.1.0 blueprints for the remaining Career Roles and Languages.
3. **Step 3 — Scored Diagnostic Placement Flow**:
   - Upgrade the onboarding/track-start modal with the 2-Tab Catalog selector and a track-aware **Scored Diagnostic Quiz** that calculates actual accuracy to assign `completedViaPlacement` badges and set the starting chapter.
4. **Step 4 — Web Worker Sandbox & Hybrid Deterministic/Pro Grader**:
   - Replace synchronous main-thread `new Function()` execution with an isolated **Web Worker** enforcing a `3,000ms` timeout for JS/TS, add failure remediation hints in the test runner UI, and implement the **60/40 Hybrid Grader + Deterministic Fallback + Staff Engineer Pro Review** panel.

### Concrete Verification, Testing & Rollback Plan

- **Verification & Acceptance Tests**:
  1. **Infinite Loop Sandbox Test**: Run `while(true) {}` in the IDE editor and verify the Web Worker terminates execution cleanly at `3,000ms` with a clear `Execution Timed Out (3000ms limit exceeded)` error while the browser UI remains 100% responsive.
  2. **Diagnostic Placement Accuracy Test**: Complete the diagnostic quiz with 0/4 correct vs. 4/4 correct and verify that `0/4` places the learner at Chapter 1 with zero auto-passed chapters, while `4/4` badges foundational chapters as `PASSED VIA DIAGNOSTIC` and highlights the target chapter.
  3. **Hybrid Grader & Offline Fallback Test**: Submit both passing and failing solutions in the IDE, verify the 60/40 deterministic-plus-rubric score calculation, and verify that if the AI endpoint throws an error, the Deterministic Fallback Grader still returns a valid `GradingResult` and awards XP.
  4. **Versioned Cache & Backward Compatibility Test**: Load an existing user profile and roadmap from `localStorage`, verify zero runtime crashes, and confirm `L1` cache hits resolve in `<15ms` with `0` network calls.
- **Rollback Strategy**:
  - All new fields on `CareerRoadmap`, `Level`, and `GradingResult` are optional (`?`), and versioned cache keys (`__v1_1_0__`) coexist alongside legacy keys without overwriting user progress.
  - If the Web Worker sandbox encounters a browser CSP restriction in any embedded environment, `codeRunner.ts` includes a guarded fallback to the bounded synchronous runner for loop-safe expressions.
