MindTrace: Project Brief & Strategic Overview
1. Executive Summary
MindTrace is an offline-first, AI-assisted learning diagnostic platform engineered for secondary school STEM education in resource-constrained environments. Developed for Track 1 (AI for Zero-Bandwidth & Localized Learning) of the Wale Lab NextGen AI Hackathon (November 7–12, 2026), MindTrace shifts educational technology from passive answer checking ($0/5$, "Wrong") to deep cognitive diagnosis ("Sign Reversal on Transposition").


Operating completely offline via a client-edge deterministic rule engine and synchronizing seamlessly via lightweight data payloads when connectivity is available, MindTrace solves two critical bottlenecks in African education: the high cost of mobile data and extreme teacher-to-student ratios ($1:50+$).


________________


2. Hackathon Track & Challenge Alignment
* Track 1: AI for "Zero-Bandwidth" & Localized Learning
* Target Context: Secondary schools across Nigeria and Sub-Saharan Africa facing data poverty, erratic electricity, and limited device access.
* Challenge Mapping:
   * Unreliable internet $\rightarrow$ 100% offline edge diagnosis parser.
   * Shared/low-spec devices $\rightarrow$ Zero-dependency lightweight progressive web app.
   * Curriculum mismatch $\rightarrow$ Mapped directly to WAEC/JAMB secondary math standards.
   * Overcrowded classrooms $\rightarrow$ Class-wide misconception heatmaps for teachers.


________________


3. Problem Statement & African Context
In secondary schools across Sub-Saharan Africa, mathematics pass rates remain critically low because of unaddressed foundational misconceptions. When 60 students in an overcrowded classroom complete an algebra quiz, teachers lack the time to review every student's intermediate steps. A student who makes a sign transposition error receives a zero without knowing why their logic failed. Standard EdTech requires continuous 4G data streaming or simple multiple-choice quizzes, excluding low-income students who cannot afford continuous data bundles.


________________


4. MindTrace Solution & How It Works
1. Step-by-Step Submission: The student inputs their solution steps into a lightweight interface.
2. Deterministic Edge Diagnosis: MindTrace parses operational logic locally using a pre-cached mathematical rule library—identifying misconceptions in $< 50\text{ms}$ with zero data usage.
3. Targeted Micro-Remedy: Delivers a 2-minute visual explanation specifically targeting the operational error, followed by a single follow-up check.
4. Teacher Macro-Leverage: When internet connection becomes briefly available, student devices sync micro-JSON payloads ($<15\text{KB}$) to the cloud, giving teachers a class-wide cognitive heatmap.


________________


5. Innovation & Key Differentiators
* A Wrong Answer is a Symptom: Focuses on root cognitive misconceptions rather than binary scoring.
* Evidence-Based Abstention: Never guesses or hallucinates; prompts for clarification when evidence is insufficient.
* Hybrid Diagnostic Architecture: Combines deterministic, zero-cost client-side rule parsing with structured cloud intelligence for edge cases.


________________


6. Offline-First Methodology & Technical Credibility
* The Client Edge (100% Offline): Holds a pre-cached library of algebraic rules, an IndexedDB storage engine (Dexie.js), and a local JavaScript string/AST parser.
* The Micro-Sync Engine (Zero-Bandwidth Optimized): Queued diagnostic records are packaged into a single compressed JSON batch ($<15\text{KB}$) upon reconnection.
* The Cloud AI Layer (Online Enhancement): Acts purely as an auxiliary interpreter for complex text reasoning using strict JSON schema enforcement.


________________


7. Team Structure & Individual Contributions
* Racheal (Technical Lead & Backend/AI Engineer): Architected the dual deterministic-AI diagnostic engine, Express REST API, Prisma PostgreSQL database models, cloud LLM structured fallback pipeline, and offline-to-online data synchronization protocol.
* Ruka (Frontend Engineer & Product Experience Lead): Engineered the responsive React (Vite) PWA interface, student step-by-step submission workflow, client-side IndexedDB persistence layer (Dexie.js), and Teacher Class Misconception Aggregation Dashboard.


________________


8. Development Timeline (Nov 8–12, 2026)
* Nov 7 (Day 1): Ideation & Competitive Analysis
* Nov 8 (Day 2): PRD, System Architecture & API Contracts
* Nov 9 (Day 3): Core Rule Engine & Student Input UI
* Nov 10 (Day 4): Cloud LLM Integration & Teacher Dashboard
* Nov 11 (Day 5): 100% Airplane Mode Testing & Benchmarking
* Nov 12 (Day 6): Demo Video Recording & Final Submission


________________


9. Conclusion & Vision
MindTrace proves that cutting-edge artificial intelligence and cognitive science do not require expensive 5G connections or high-end smartphones. By coupling client-edge deterministic parsing with structured cloud intelligence, MindTrace turns offline constraints into an opportunity for high-impact educational equity.