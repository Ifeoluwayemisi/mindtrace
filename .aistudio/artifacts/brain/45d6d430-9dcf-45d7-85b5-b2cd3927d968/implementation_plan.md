# MindTrace — Product Experience Redesign, Authentication Integration & Production Engineering Plan

MindTrace is an AI-assisted, offline-first mathematics learning diagnostic platform designed for Nigerian secondary school learners (SS1–SS3 preparing for WAEC/JAMB) and their STEM teachers. This plan details the visual design elevation, authentication and session journey integration, mathematical learning experience redesign, and production hardening across 7 controlled implementation stages.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Authentication & Offline-First Architectural Trade-Off**:
> MindTrace operates under a strict **Zero-Bandwidth & Localized Learning** constraint (Track 1). Full production security cannot rely on real-time remote cloud identity servers (e.g. Firebase Auth or OAuth) while students are solving algebra offline in classrooms without cellular data.
> - **Recommended Architecture**: Implement a **Local Cryptographic Identity Vault** using Web Crypto API (`PBKDF2` / `AES-GCM` or `SHA-256` salted hashes) stored in IndexedDB for 100% offline authentication and credentials validation. When connectivity is detected, sessions can synchronize with an upstream school server via the existing micro-sync queue (`syncService.ts`).
> - **Teacher Verification Gate**: Prevent students from simply toggling into the Teacher Dashboard by requiring a verified teacher license key/passcode or school accreditation PIN, persisted securely.
> - **Evaluator Demo Bypasses**: Preserve clearly segregated, explicit "Hackathon Evaluator Quick-Access" chips on login screens, ensuring judges can inspect both Student and Teacher workflows in one click without compromising the real credential validation flow.

---

## 1. Overview & Core Concept

- **Core Problem**: Secondary school students in low-connectivity environments struggle with mathematics misconceptions (e.g. sign inversion during transposition, incomplete distribution, precedence errors). Current tools are either cartoonish child apps, generic chat bots requiring constant 4G data, or dry enterprise dashboards.
- **Target Persona**:
  - *Secondary Students (SS1–SS3, ages 14–18)*: Preparing for high-stakes exams (WAEC, JAMB, NECO). Need focused, credible, high-agency mathematical practice with instant cognitive feedback, visual balance models, and audio assistance.
  - *Secondary Mathematics Teachers*: Need aggregated diagnostic visibility into class-wide error patterns, at-risk students, and targeted chalkboard intervention scripts without managing complex IT infrastructure.
- **Key Value**: Evidence-based mathematical diagnosis executed in <50ms completely on-device, pairing symbolic diagnostics with intuitive visual balance models and zero-bandwidth micro-sync telemetry.

---

## 2. User Experience & Visual Design

### Aesthetic Direction & Visual Identity
- **Design Philosophy**: Academic, modern, engaging, and dignified. Avoid childlike cartoon gamification and cold corporate SaaS enterprise styles.
- **Palette & Contrast (60-30-10 Rule)**:
  - *60% Dominant Canvas*: Deep midnight navy (`#090D16` / `slate-950`) with warm off-white light mode counterpart (`#F8FAFC`).
  - *30% Structural Surfaces*: Subtle indigo-tinted slate containers (`#0F172A` / `#1E293B`), hairline borders (`rgba(255,255,255,0.08)`), and mathematical coordinate grids.
  - *10% Semantic Focal Accents*: Electric violet/indigo (`#6366F1`), vibrant cyan (`#06B6D4`), and educational gold/amber (`#F59E0B`) for key mathematical discoveries.
- **Typography**:
  - *Display / Headings*: `Outfit` (Geometric, confident, modern).
  - *Body Prose*: `Plus Jakarta Sans` (Clean, legible, balanced line-height).
  - *Mathematics & Telemetry*: `JetBrains Mono` with `tabular-nums` for mathematical steps and numerical alignments.
- **Imagery & Mathematical Diagrams**:
  - Purposeful, authentic geometric figures, algebraic balance scales, coordinate planes, and authentic African student educational representations.
  - Zero broken image frames; local SVG diagrams bundled for 100% offline availability.

### Integrated Screen-by-Screen Flow
```
[Splash Screen] ──────────► [Welcome Landing]
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
   [Sign In Screen]                              [Role Gatekeeper]
    ├── Real credentials (IDB)                    ├── Student Path
    ├── Quick Demo Evaluator                       └── Teacher Path
    └── Forgot Password Recovery                          │
          │                                               ▼
          ▼                                     [Registration Screen]
   [Active Session Established]                  ├── School & Class (SS1-SS3)
          │                                      ├── Username & Credential Vault
          ├──────────────────────────┐           └── Teacher Accreditation PIN
          ▼                          ▼                    │
 [Student Experience]       [Teacher Experience]          ▼
  ├── Onboarding Tour        ├── Class Overview    [Profile & Audio Setup]
  ├── Interactive Dashboard  ├── Misconception Map        │
  ├── Step Working Canvas    ├── Roster Drilldown         ▼
  ├── Cognitive Diagnosis    └── Chalkboard Guide  [Student Dashboard]
  ├── Visual Balance Remedy
  └── Follow-Up Assessment
```

---

## 3. Key Product Decisions & Trade-Offs

1. **Authentication Engine (Offline-First Crypto vs Remote OAuth)**:
   - *Decision*: Build a local credentials store inside `MindTraceOfflineDB.users` using Web Crypto API hashing.
   - *Rationale*: A remote OAuth/Firebase requirement breaks the zero-bandwidth mandate in rural or low-connectivity schools. Local vaulting enables full sign-up, sign-in, session persistence, and password reset entirely on-device, with telemetry ready for opportunistic upload.
2. **Mathematical Step Input (Structured Multi-Step Canvas + Virtual Math Pad)**:
   - *Decision*: Provide clean mathematical symbol insertion keys (`+`, `-`, `×`, `÷`, `( )`, `x`, `=`) and dedicated step rows rather than raw unstructured textareas.
   - *Rationale*: Mobile secondary students often struggle with mobile keyboards when typing equations. Accessible buttons ensure clean formatting for the edge rule engine.
3. **Teacher Authorization Security**:
   - *Decision*: Require a school access code (default demo code: `MINDTRACE-TEACHER-2026` or registered PIN) before establishing a teacher session.
   - *Rationale*: Stops students from simply toggling role switches in headers to view class answer keys or classmate diagnostics.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                        MindTrace Client Shell                          │
├────────────────────────────────────────────────────────────────────────┤
│ Navigation Router & Session Gate (App.tsx & authService.ts)            │
│  ├─ Public Routes: Splash, Welcome, Login, Register, Recovery          │
│  ├─ Protected Student: Dashboard, Solve, Diagnosis, Remedy, History    │
│  └─ Protected Teacher: Heatmap, Roster, Curriculum, Chalkboard         │
├──────────────────────────────────┬─────────────────────────────────────┤
│        Student Subsystem         │          Teacher Subsystem          │
│  ├─ QuestionInterface.tsx        │  ├─ TeacherDashboard.tsx            │
│  ├─ AudioPlayerControl.tsx       │  ├─ ClassOverviewView.tsx           │
│  ├─ TargetedInterventionView.tsx │  ├─ MisconceptionTrendsView.tsx     │
│  └─ GamificationHub.tsx          │  └─ StudentDrilldownModal.tsx       │
├──────────────────────────────────┴─────────────────────────────────────┤
│                     Core Services & Storage Engines                    │
│  ├─ edgeRuleEngine.ts   : Deterministic cognitive error classifier     │
│  ├─ speechService.ts    : Offline Web Speech phonetic math translator  │
│  ├─ gamificationService : XP ledger, streak counter, 10 badges         │
│  ├─ storageService.ts   : IndexedDB multi-store + user credential vault│
│  └─ syncService.ts      : Micro-batch sync queue (<500B payloads)      │
├────────────────────────────────────────────────────────────────────────┤
│ Progressive Web App Layer: sw.js (Cache-first/SWR) & manifest.json     │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Schema Enhancements (`src/types/index.ts`)
- **`AuthUser`**: Enhanced with `passwordHash`, `salt`, `createdAt`, `lastLogin`, `schoolCode`.
- **`StudentProfile`**: Includes `preferredPresentation: ('visual' | 'audio' | 'interactive')[]`, `audioSupport: boolean`, `diagnosticHistoryCount`.
- **`TeacherProfile`**: Includes `verifiedTeacher: boolean`, `schoolAccreditationCode: string`.

---

## 5. Controlled Implementation Stages

- **Stage 1 (Shared Visual Design System & Global UI Consistency)**: [COMPLETED]
  - Semantic CSS tokens (`--color-midnight`, `--color-surface-card`, `--color-accent-indigo`, `--color-accent-cyan`, `--color-accent-gold`).
  - High-fidelity offline SVG assets: `HeroStudentIllustration`, `BalanceScaleVisual`, `RainbowDistributionVisual`.
  - Redesigned `WelcomeScreen.tsx` with split hero, unboxed metadata, and high-contrast styling.
- **Stage 2 (Authentication Journey & Role Protection Integration)**: [COMPLETED]
  - `authService.ts`: Real client-side cryptographic hashing (`SHA-256` with unique salt per user via Web Crypto API).
  - Pre-seeded evaluation accounts (`aminat_diallo` / `pass1234`, `chinedu_okafor` / `teacher123`) with quick-fill evaluators.
  - Teacher Accreditation Gate requiring code `MINDTRACE-TEACHER-2026` to access supervisor records.
  - Password recovery flow with 6-digit PIN verification.
- **Stage 3 (Student Dashboard & Learning Experience Redesign)**: [COMPLETED]
  - `StudentDashboard.tsx`: Redesigned welcome hero tailored for WAEC/JAMB secondary students.
  - `QuestionInterface.tsx`: Added accessible on-screen **Virtual Mathematics Keypad** with $\ge 44\text{px}$ touch targets.
  - `DiagnosisResultView.tsx` & `TargetedInterventionView.tsx`: Integrated offline vector `BalanceScaleVisual` and `RainbowDistributionVisual`.
  - `FollowUpAssessmentView.tsx`: Integrated immediate verification and XP mastery awards.
- **Stage 4 (Teacher Dashboard Refinement)**: [COMPLETED]
  - Aligned with Nebular design specification (Screenshot 1): 4 metric cards, Insights/Students/Problems tabs, Micro-skill spider radar, Performance trends line chart, Time spent & Hints used histograms, Top misconceptions cards.
  - Roster syncs live from local diagnostic submissions in `storageService`.
  - Offline class report export (JSON download).
- **Stage 5 (Accessibility, Responsive Behavior & Offline Asset Optimization)**: [COMPLETED]
  - All interactive controls have $\ge 44\text{px}$ touch targets.
  - Web Speech API integration with explicit toggles in profile setup and edit screens.
  - Zero external network image dependencies; 100% offline SVG vectors.
- **Stage 6 (Security, Persistence & Production Infrastructure)**: [COMPLETED]
  - IndexedDB storage engine (`profiles`, `diagnoses`, `syncQueue`, `teacherAnalytics`) with localStorage backup and memory fallback.
  - Salted SHA-256 password hashing; no plaintext credentials stored.
  - Clean logout and session state reset.
- **Stage 7 (Automated Tests, Quality Assurance & Final Verification)**: [COMPLETED]
  - `compile_applet`: Succeeded.
  - `lint_applet` (`tsc --noEmit`): 0 errors, passed cleanly.
  - `npm run build`: Succeeded in 1.07s.
  - Dev server verified responsive on port 3000 (`HTTP/1.1 200 OK`).
