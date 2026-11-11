# MindTrace — Visual Design Audit (Stage 1)

**Project:** `mindtrace/` (React 19 + Vite + Tailwind v4 + Express/Drizzle, offline-first)
**Audit date:** 12 November 2026
**Scope:** Visual design system adoption only. No changes to auth, database schema, teacher verification, scoring/XP, diagnostic engine, IndexedDB, offline sync, service worker, permissions, or routes.
**Status of this document:** Replaces the earlier aspirational audit with findings from direct source inspection.

---

## 1. Baseline verification (before any change)

| Check | Command | Result |
|---|---|---|
| Dependency install | `npm install --no-audit --no-fund` | PASS (after restoring missing platform binaries — see §6) |
| Type check | `npm run lint` (`tsc --noEmit`) | **PASS** — 0 errors |
| Production build | `npm run build` | **PASS** — client `dist/client` (977 kB JS / 113 kB CSS), server `api/index.js` (2.4 MB) |
| Build warning | Vite chunk-size warning | Pre-existing: single JS chunk > 500 kB. Not caused by this work; recorded, not "fixed" by splitting routes. |

No runtime code was modified before this baseline was captured.

---

## 2. What already conforms

The following files already use the official palette and light surfaces, and were verified by reading source:

- `index.html` — body `#F8FAFC`, theme color `#2563EB`, Plus Jakarta Sans / Outfit / JetBrains Mono loaded.
- `src/index.css` — `@theme` already defines brand primary `#2563EB`, hover `#1D4ED8`, mastery `#059669`, diagnostic `#D97706`, AI `#6366F1`, learning `#0EA5E9`, surfaces, text, border tokens, plus `.card-modern`, `.btn-primary`, `.btn-secondary`, and four `.math-step-*` classes.
- `src/App.tsx` — shell background `#F8FAFC`, light footer/header layout, routes unchanged.
- `Header.tsx`, `MobileBottomNav.tsx` — blue/white navigation, official tokens.
- `WelcomeScreen`, `RoleSelectionScreen`, `LoginScreen`, `RegistrationScreen`, `SplashScreen`, `OnboardingCarousel` — already migrated to blue/light.
- `PWAInstallButton`, `PWAInstallBanner`, `NetworkStatusBar`, `MathVisuals` — already on official palette.

**Conclusion:** the token foundation exists and must be extended, not replaced. The remaining work is overwhelmingly *component-level* migration.

---

## 3. Actual findings (measured, not estimated)

Legacy-style occurrences counted by source scan (`#6755E8`, `#5140CA`, `#F3F1FF`, `#252641`, `#74788E`, `#E9EAF3`, `#F5F6FC`, `#F8F9FF`, `#B8BCD4`, `#B27B08`, `#E4E0FD`, `#FDDDD7`, `#D64D31`, `#FFF1EE`, `bg-slate-800/900/950`, `bg-black`, `indigo-*`, `violet-*`, `rose-*`):

| File | Legacy matches | Observed problem |
|---|---:|---|
| `teacher/TeacherDashboard.tsx` | 78 | Entire workspace dark slate + indigo; dark table; dark KPI cards; rose "At Risk"; inline indigo gradients |
| `profile/StudentProfileView.tsx` | 135 | Violet profile header, violet chips, dark panels |
| `profile/StudentProfileSetup.tsx` | 116 | Violet onboarding form, violet progress/step chips |
| `student/QuestionInterface.tsx` | 66 | **Math workspace** on violet `#6755E8`, `#F3F1FF`, `#F5F6FC`; red `#D64D31` used for keypad clear; no 4-state step styling |
| `gamification/GamificationHub.tsx` | 46 | Fully dark/indigo achievement UI |
| `teacher/ClassroomManagerModal.tsx` | 44 | Dark modal, indigo selected class, dark forms |
| `student/StudentDashboard.tsx` | 37 | Violet hero, violet/amber stat tiles, dark accents |
| `teacher/AssignmentManager.tsx` | 36 | Dark cards, indigo CTAs, dark create-assignment modal |
| `auth/PasswordRecoveryScreen.tsx` | 35 | Violet/dark auth surfaces inconsistent with LoginScreen |
| `common/AudioPlayerControl.tsx` | 31 | Violet player states; used inside every student screen |
| `teacher/SubmissionReview.tsx` | 28 | Dark table + dark detail modal, rose misconception text |
| `auth/PasswordChangeScreen.tsx` | 26 | Violet/dark auth surfaces |
| `student/DiagnosisResultView.tsx` | 24 | Dark gradient result banner; **red** faulty-step blocks; dark evidence cards |
| `student/motion/LessonPlaybackControls.tsx` | 19 | Dark control bar |
| `teacher/StudentDetailModal.tsx` | 18 | Dark modal, indigo metrics |
| `student/motion/AnimatedMicroLessonPlayer.tsx` | 18 | Dark player shell |
| `student/StudentProgressView.tsx` | 17 | Dark cards + indigo bars |
| `student/motion/AnimatedRainbowStage.tsx` | 15 | Dark stage chrome |
| `student/StudentClassroomsModal.tsx` | 14 | Dark modal, indigo accents |
| `student/FollowUpAssessmentView.tsx` | 12 | Dark surfaces, inconsistent with QuestionInterface |
| `student/RemedyLibraryView.tsx` | 12 | Dark cards |
| `student/SubjectOverview.tsx` | 10 | Dark topic cards |
| `student/LearningHistoryView.tsx` | 10 | Dark history rows |
| `student/SessionSummaryView.tsx` | 10 | Dark summary cards |
| `student/TargetedInterventionView.tsx` | 10 | Dark sandbox tabs/cards |
| `student/motion/ComprehensionCheckCard.tsx` | 10 | Dark quiz card |
| `teacher/ChalkboardScriptModal.tsx` | 10 | Dark slate modal (chalkboard metaphor is intentional but must be restyled consistently) |
| `student/motion/AnimatedBalanceScaleStage.tsx` | 5 | Dark stage chrome |
| `common/PWAInstallBanner.tsx` / `PWAInstallButton.tsx` | 1 each | Isolated legacy colour remnant |

### Cross-cutting issues

1. **Two visual languages coexist.** Global shell/auth are light blue; core student/teacher workspaces are dark slate/indigo. Transitioning from `StudentDashboard` into `QuestionInterface` currently reads as a different product.
2. **Red is used for ordinary math mistakes.** `DiagnosisResultView` marks faulty lines with `rose-*` and `#D64D31`; `QuestionInterface` uses red for the keypad clear key. This violates the "no red for math mistakes" rule and increases math anxiety.
3. **Math step states are not implemented in the actual workspace.** `.math-step-*` exists in CSS but `QuestionInterface` renders every line identically. Completed / current / misconception / AI states are not visually or semantically distinguishable, and they rely on violet rather than the semantic palette.
4. **Diagnosis result has no non-colour signifiers.** Correct/faulty/ambiguous differ mainly by hue; icons exist but badges are low-contrast dark-on-dark.
5. **Tables and modals are dark-only.** Teacher `SubmissionReview` and `TeacherDashboard` tables, plus five modals, have no light surface variant and use low-contrast `slate-500` on `slate-950`.
6. **Inconsistent focus treatment in components.** Global `:focus-visible` exists, but many inputs use `focus:outline-hidden` with only a dark border change; several icon buttons have no visible focus ring.
7. **No reduced-motion support.** `animate-fade-in`, `animate-bounce`, `animate-pulse`, and motion library transitions run unconditionally.
8. **Typography drift.** Page titles vary between `text-xl`, `text-2xl`, and `text-3xl`; body copy often `text-xs`. Target: 28px page titles, 20px section headings, 15–16px body.
9. **Avatar fallback is initials-first in places.** `Header` renders `<img src={avatarSeed}>` then an initials span; presets must be real illustrated artwork with initials only on failure.
10. **Pre-existing data placeholders (not introduced here).** `TeacherDashboard` contains `submissionRate: 100`, `avgCorrectness: 75`, `atRiskCount: 0`; `SubmissionReview` shows `Total Enrolled: --`; `StudentProgressView` has hardcoded topic scores. These are documented as existing limitations and are **not** replaced with fabricated values.

---

## 4. Target design system (to be centralised in `src/index.css`)

**Foundation:** app bg `#F8FAFC`; surface `#FFFFFF`; muted `#F1F5F9`; text `#0F172A` / `#475569` / `#94A3B8`; border `#E2E8F0`; focus `#2563EB`.

**Semantics:** primary `#2563EB` / hover `#1D4ED8`; mastery `#059669` on `#D1FAE5`; diagnostic `#D97706` on `#FEF3C7`; AI `#6366F1` on `#EEF2FF`; learning `#0EA5E9` on `#E0F2FE`. Red reserved for destructive/security actions only.

**Type scale:** page title 28px/700; section heading 20px/600; body 15–16px; metadata 13px; UI font Plus Jakarta Sans, display Outfit, math JetBrains Mono.

**Math step states (colour + icon + label, never colour alone):**
| State | Surface | Border | Signifier |
|---|---|---|---|
| Completed | `#FFFFFF` | `#E2E8F0` | emerald check badge + "Completed" |
| Current | `#EFF6FF` | `#2563EB` 2px | numbered blue badge + "Current step" |
| Misconception | `#FEF3C7` | `#D97706` left rule | amber alert icon + "Concept misconception" |
| AI guidance | `#EEF2FF` | `#6366F1` left rule | sparkles icon + "AI guidance" |

**Shared primitives to add:** `.page-title`, `.section-title`, `.body-text`, `.badge` variants, `.input-modern`, `.table-modern`, `.modal-surface`, `.progress-track/.progress-fill`, `.icon-btn`, `.skip-link`, reduced-motion overrides.

---

## 5. Migration plan (execution order)

1. **Tokens & primitives** — extend `src/index.css`; add reduced-motion, focus, badge/table/modal/input/progress utilities.
2. **Shared components** — `AudioPlayerControl`, `NetworkStatusBar`, `PWAInstallBanner`; avatar preset artwork.
3. **Math workspace (highest priority)** — `QuestionInterface`, `DiagnosisResultView`, `TargetedInterventionView`, `FollowUpAssessmentView`, `SessionSummaryView`, motion lesson components.
4. **Student hub** — `StudentDashboard`, `SubjectOverview`, `StudentProgressView`, `RemedyLibraryView`, `LearningHistoryView`, `StudentClassroomsModal`, `GamificationHub`.
5. **Profile & remaining auth** — `StudentProfileSetup`, `StudentProfileView`, `PasswordChangeScreen`, `PasswordRecoveryScreen`.
6. **Teacher workspace** — `TeacherDashboard`, `AssignmentManager`, `SubmissionReview`, `ClassroomManagerModal`, `StudentDetailModal`, `ChalkboardScriptModal`.
7. **QA** — `npm run lint`, `npm run build`, run app, exercise student + teacher journeys in browser, capture screenshots, write `mindtrace_visual_modernization_report.md`.

**Constraints honoured throughout:** props, state, services, scoring, diagnostic calls, storage keys, and routes stay byte-identical in behaviour; only markup/classes/styles change. No mock metrics are added; existing placeholders are left untouched and reported.

---

## 6. Environment note

`npm install` on this Windows machine did not place three optional native binaries, so the first `tsc`/`vite` runs failed with "cannot find module":

- `@typescript/typescript-win32-x64@7.0.2`
- `@rolldown/binding-win32-x64-msvc@1.2.18`
- `lightningcss-win32-x64-msvc@1.33.0`
- `@tailwindcss/oxide-win32-x64-msvc@4.3.5`

They were installed with `--no-save` for local verification only. `package.json` was not modified for this, because the failure is a local optional-dependency resolution issue, not an application defect.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| Large mechanical class rewrites could drop behaviour | Rewrite presentation only; keep every handler, prop, and conditional. Re-run `tsc` after each batch. |
| Tailwind arbitrary values already in use | Standardise on existing token utilities/`#hex` used elsewhere; avoid inventing new colours. |
| Dark chalkboard metaphor in `ChalkboardScriptModal` | Keep a deliberate dark reading surface inside an otherwise light modal shell; document as intentional. |
| Mobile layouts in dark components use fixed widths | Re-check at 375 px and 768 px during QA. |
| Existing placeholder metrics could look "new" | Leave data untouched; list them explicitly in the final report as pre-existing. |
