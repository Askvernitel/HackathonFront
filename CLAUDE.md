# EduTech AI Tutor — Hackathon MVP Spec

> Build a MERN-stack EduTech platform where students learn university curriculum through AI tutoring, with a differentiating **Reverse Tutor** mode (student teaches the AI). For this hackathon MVP, lecturer curriculum is pre-seeded; only the student role is functional.

---

## 1. Product Overview

### Concept
Students log in (hardcoded demo users), pick a course, and progress through chapters in a **Duolingo-style fixed sequence**:

```
Tutor → Exercises → Reverse Tutor → Exercises → Quiz → Chapter Summary
```

Each chapter is gated: a stage must be completed before the next unlocks. After completing all chapters of a course, the student receives a **mock-blockchain certificate** (PDF with fake Solana tx hash).

### Differentiator: Reverse Tutor
The student explains the chapter's concepts to the AI. The AI probes each learning objective with follow-up "why" / "what if" / "explain like I'm five" questions. If the student fails to convincingly explain **≥65% of learning objectives**, the session is marked failed and the student is sent back to Tutor mode for that chapter.

### Demo User Story
1. Student `demo@student.io` logs in (password: `demo123`)
2. Sees course library: **Intro to CS** and **Data Structures & Algorithms**
3. Opens "DSA" → Chapter 1 (Big O) → starts in Tutor mode
4. Chats with AI tutor about Big O, sees an animated complexity-comparison visualization
5. Completes 3 exercises (mix of multiple-choice and short-answer)
6. Enters Reverse Tutor mode → explains Big O back to AI → AI probes
7. Completes more exercises, then a 5-question quiz
8. Views chapter summary, progress bar updates, streak increments
9. After finishing all chapters, downloads PDF certificate with mock Solana tx hash

---

## 2. Tech Stack (Locked)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18 + Vite | Vite over CRA — faster dev, modern |
| UI | Material UI v5 (MUI) | Chosen per requirement |
| Routing | react-router-dom v6 | Standard |
| State | React Context + hooks | No Redux — MVP scope |
| HTTP | axios | With interceptor for demo-user header |
| Backend | Node.js + Express | REST API |
| Database | MongoDB Atlas (free tier) | Mongoose ODM |
| LLM | Google Gemini `gemini-2.5-flash` | Free tier, fast |
| Visualizations | recharts (Big O, charts), react-flow (trees, flowcharts), framer-motion (sorting/binary anims) | Three libs cover everything |
| PDF Certificate | pdfkit (Node) | Server-generated PDF |
| Frontend Host | Vercel | |
| Backend Host | Render (free tier) | Persistent Express + MongoDB connection |
| Auth | Hardcoded demo users | No JWT, no sessions — just a header `x-demo-user-id` |

### Why split frontend/backend deploy
Vercel serverless functions are awkward for stateful Express + MongoDB connection pooling. Render's free tier runs persistent Node easily. Frontend → Vercel; backend → Render; DB → MongoDB Atlas.

---

## 3. Repository Structure

```
edutech-ai/
├── client/                          # React + Vite frontend (deploys to Vercel)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js            # axios instance with demo-user header
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   └── ChatInput.jsx
│   │   │   ├── exercises/
│   │   │   │   ├── MCQExercise.jsx
│   │   │   │   └── ShortAnswerExercise.jsx
│   │   │   ├── visualizations/
│   │   │   │   ├── BigOChart.jsx
│   │   │   │   ├── SortingViz.jsx
│   │   │   │   ├── BSTViz.jsx
│   │   │   │   ├── BinaryRepViz.jsx
│   │   │   │   ├── MemoryBoxViz.jsx
│   │   │   │   └── ControlFlowViz.jsx
│   │   │   ├── progress/
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   ├── StreakBadge.jsx
│   │   │   │   └── ChapterStepper.jsx
│   │   │   └── certificate/
│   │   │       └── CertificateModal.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx        # course library + streaks
│   │   │   ├── CoursePage.jsx           # chapter list with stepper
│   │   │   ├── ChapterStagePage.jsx     # the active stage (tutor/exercise/etc)
│   │   │   └── ProfilePage.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # holds demo user id
│   │   │   └── ProgressContext.jsx
│   │   ├── hooks/
│   │   │   ├── useChapter.js
│   │   │   └── useProgress.js
│   │   ├── utils/
│   │   │   └── stageFlow.js             # constants for stage sequence
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node + Express backend (deploys to Render)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # mongoose connect
│   │   │   └── gemini.js            # Gemini client setup
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Course.js
│   │   │   ├── Chapter.js
│   │   │   ├── Progress.js
│   │   │   └── Streak.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── course.routes.js
│   │   │   ├── chapter.routes.js
│   │   │   ├── tutor.routes.js
│   │   │   ├── exercise.routes.js
│   │   │   ├── quiz.routes.js
│   │   │   ├── progress.routes.js
│   │   │   └── certificate.routes.js
│   │   ├── controllers/
│   │   │   ├── tutor.controller.js
│   │   │   ├── reverseTutor.controller.js
│   │   │   ├── exercise.controller.js
│   │   │   ├── quiz.controller.js
│   │   │   ├── progress.controller.js
│   │   │   └── certificate.controller.js
│   │   ├── services/
│   │   │   ├── gemini.service.js        # all LLM calls
│   │   │   ├── progress.service.js
│   │   │   ├── streak.service.js
│   │   │   └── certificate.service.js   # pdfkit + mock tx hash
│   │   ├── middleware/
│   │   │   ├── demoAuth.js              # reads x-demo-user-id header
│   │   │   └── errorHandler.js
│   │   ├── prompts/
│   │   │   ├── tutor.prompt.js
│   │   │   ├── reverseTutor.prompt.js
│   │   │   ├── exerciseGen.prompt.js
│   │   │   ├── exerciseGrade.prompt.js
│   │   │   └── quizGen.prompt.js
│   │   ├── seed/
│   │   │   ├── seed.js                  # entry point: node seed/seed.js
│   │   │   ├── users.seed.js
│   │   │   ├── courses/
│   │   │   │   ├── introCS.seed.js
│   │   │   │   └── dsa.seed.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 4. Data Model (Mongoose)

### User
```js
{
  _id: ObjectId,
  email: String,        // unique
  name: String,
  avatar: String,       // optional URL
  createdAt: Date
}
```

### Course
```js
{
  _id: ObjectId,
  slug: String,         // 'intro-cs' | 'dsa'
  title: String,
  description: String,
  coverColor: String,   // MUI palette key for card
  chapters: [ObjectId], // refs Chapter, ordered
  createdAt: Date
}
```

### Chapter
```js
{
  _id: ObjectId,
  courseId: ObjectId,
  order: Number,        // 1, 2, 3...
  title: String,
  description: String,
  content: String,      // markdown body — the "lecture material"
  learningObjectives: [String],  // 3–5 items
  visualizations: [{    // which viz components to render in tutor mode
    type: String,       // 'bigO' | 'sorting' | 'bst' | 'binaryRep' | 'memoryBox' | 'controlFlow'
    props: Object       // viz-specific config
  }]
}
```

### Progress
```js
{
  _id: ObjectId,
  userId: ObjectId,
  courseId: ObjectId,
  chapterProgress: [{
    chapterId: ObjectId,
    currentStage: String,  // 'tutor' | 'exercise-1' | 'reverse-tutor' | 'exercise-2' | 'quiz' | 'summary' | 'completed'
    stages: {
      tutor:         { completed: Boolean, completedAt: Date },
      exercise1:     { completed: Boolean, score: Number, completedAt: Date },
      reverseTutor:  { completed: Boolean, score: Number, objectivesCovered: [String], completedAt: Date },
      exercise2:     { completed: Boolean, score: Number, completedAt: Date },
      quiz:          { completed: Boolean, score: Number, completedAt: Date },
      summary:       { completed: Boolean, completedAt: Date }
    }
  }],
  overallPercent: Number,    // derived: completed chapters / total
  certificateIssued: Boolean,
  certificateTxHash: String,  // mock — populated when issued
  updatedAt: Date
}
```

### Streak
```js
{
  _id: ObjectId,
  userId: ObjectId,
  currentStreak: Number,
  longestStreak: Number,
  lastActivityDate: Date,    // YYYY-MM-DD (any activity counts: tutor/exercise/quiz/reverse-tutor)
  activityDates: [Date]      // for displaying a heatmap if time allows
}
```

---

## 5. Stage Flow Logic

Stages run in this fixed order **per chapter**:

| # | Stage | Pass Condition | On Fail |
|---|---|---|---|
| 1 | `tutor` | Student clicks "I'm ready" after ≥3 message exchanges | n/a |
| 2 | `exercise1` | Score ≥60% on 3 generated exercises | Retry (regenerate exercises) |
| 3 | `reverseTutor` | **≥65% of objectives covered convincingly** (Gemini judges) | Kick back to `tutor` stage |
| 4 | `exercise2` | Score ≥60% on 3 generated exercises | Retry |
| 5 | `quiz` | Score ≥70% on 5 questions | Retry |
| 6 | `summary` | View summary, click "Continue" | n/a |

**On chapter completion**: increment progress, advance to next chapter. **On final chapter completion**: trigger certificate generation.

**On reverse-tutor fail**: clear progress for that chapter back to `tutor`. Student must redo the loop. Show a friendly message: *"Looks like a few concepts need more practice. Let's revisit the tutor."*

---

## 6. API Endpoints

All authenticated endpoints require header `x-demo-user-id: <userId>`. Middleware reads it and attaches `req.user`.

### Auth (fake)
- `POST /api/auth/login` — body `{ email, password }`. Validates against hardcoded users, returns `{ userId, name, email }`. No token issued; client stores `userId` and sends it as header on subsequent calls.
- `GET /api/auth/me` — returns current user from header.

### Courses
- `GET /api/courses` — list all courses (id, title, description, coverColor, chapterCount)
- `GET /api/courses/:slug` — single course with chapters populated (titles + order only)

### Chapters
- `GET /api/chapters/:id` — full chapter content + learning objectives + visualizations

### Tutor Mode
- `POST /api/tutor/message` — body `{ chapterId, history: [{role, content}], message }`. Returns AI response. **Chat history is sent by client each call (no DB persistence per spec).**

### Reverse Tutor
- `POST /api/reverse-tutor/start` — body `{ chapterId }`. Returns AI opening prompt: *"Pretend I'm a curious 5-year-old. Teach me [topic]."*
- `POST /api/reverse-tutor/message` — body `{ chapterId, history, message }`. AI probes with follow-up. Returns `{ reply, sessionComplete: boolean }`. After ~6–8 exchanges OR student says "I'm done", sessionComplete=true on next call.
- `POST /api/reverse-tutor/evaluate` — body `{ chapterId, history }`. Returns `{ score: 0–100, objectivesCovered: [{objective, covered: bool, evidence: string}], passed: bool }`. Pass threshold: **65%**.

### Exercises
- `POST /api/exercises/generate` — body `{ chapterId, stage: 'exercise1' | 'exercise2', difficulty: 'easy' | 'medium' }`. Returns array of 3 exercises:
  ```js
  [
    { type: 'mcq', question, options: [...], correctIndex, explanation },
    { type: 'short', question, expectedAnswerKeywords: [...], idealAnswer }
  ]
  ```
- `POST /api/exercises/grade` — body `{ exercises: [...], answers: [...] }`. For MCQ: exact match. For short answer: Gemini grades against keywords + ideal answer, returns `{ score, feedback }` per item.

### Quiz
- `POST /api/quiz/generate` — body `{ chapterId }`. Returns 5 MCQs (harder than exercises, mixed objectives).
- `POST /api/quiz/submit` — body `{ chapterId, answers }`. Returns `{ score, perQuestion: [...], passed: bool }`.

### Progress
- `GET /api/progress/:courseId` — full progress object for user/course
- `POST /api/progress/advance` — body `{ courseId, chapterId, stage, payload: { score?, objectivesCovered? } }`. Marks stage complete, advances `currentStage`. Updates streak. Returns updated progress.
- `POST /api/progress/fail-reverse-tutor` — body `{ courseId, chapterId }`. Resets chapter to `tutor` stage.

### Certificate
- `POST /api/certificate/issue` — body `{ courseId }`. Verifies all chapters complete, generates mock tx hash (random 64-hex string prefixed `0x`), generates PDF with pdfkit, stores hash in Progress, returns `{ pdfUrl, txHash }`. PDF served from `/certificates/<userId>-<courseId>.pdf` static route.

---

## 7. Gemini Integration

### Setup
- Use `@google/generative-ai` npm package
- Model: `gemini-2.5-flash`
- API key in `GEMINI_API_KEY` env var on server only (never expose to client)

### System Prompts (in `server/src/prompts/`)

**`tutor.prompt.js`** — explains the chapter to the student conversationally.
```
You are a patient, encouraging university tutor teaching the following chapter.

CHAPTER: {chapterTitle}
LEARNING OBJECTIVES:
{objectives bullet list}
CONTENT REFERENCE:
{chapter.content — 1st 3000 chars}

RULES:
- Keep replies concise (3–6 sentences).
- Use analogies and examples.
- Never give away exercise/quiz answers.
- If asked off-topic things, politely redirect.
- When the student seems to understand, suggest they try exercises.
```

**`reverseTutor.prompt.js`** — the differentiating prompt.
```
You are a curious learner. The student will teach you the following chapter.
Your goal is to probe the student's understanding of EACH learning objective.

CHAPTER: {chapterTitle}
LEARNING OBJECTIVES (these are what you must verify):
{objectives bullet list}

RULES:
- Ask follow-up questions like "why does that work?", "what if X changed?", "can you explain that more simply?"
- Stay in character as a learner — never reveal the answer yourself.
- After each student message, internally track which objectives they've addressed.
- Vary questions — don't repeat phrasings.
- After ~6–8 exchanges OR if the student says "I'm done", respond with: "Got it, that was helpful! Let me think about what I learned." and set sessionComplete=true.
- If the student gives a wrong explanation, ask a clarifying question rather than correcting them.
```

**`reverseTutorEval.prompt.js`** — judges the session after completion. Must return strict JSON.
```
You evaluated the following Reverse Tutor session where a student taught these objectives:
{objectives}

CONVERSATION:
{history transcript}

For each learning objective, decide if the student demonstrated genuine understanding (covered=true) or not (covered=false). Provide one-line evidence (the student's words or paraphrase).

Output STRICT JSON only:
{
  "objectives": [
    {"objective": "...", "covered": true|false, "evidence": "..."}
  ],
  "score": <0–100, % of objectives covered>,
  "passed": <true if score >= 65 else false>,
  "feedback": "1-sentence encouragement or suggestion"
}
```

**`exerciseGen.prompt.js`** — generates 3 exercises mixing MCQ + short answer.
```
Generate 3 exercises for the chapter "{title}" covering: {objectives}.
Difficulty: {difficulty}.
Mix: 2 multiple-choice (4 options each) + 1 short-answer.

Output STRICT JSON array:
[
  {"type":"mcq","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."},
  {"type":"mcq", ...},
  {"type":"short","question":"...","expectedAnswerKeywords":["...","..."],"idealAnswer":"..."}
]
```

**`exerciseGrade.prompt.js`** — for short-answer grading only.
```
Grade this short answer.
QUESTION: {question}
IDEAL ANSWER: {idealAnswer}
EXPECTED KEYWORDS: {keywords}
STUDENT ANSWER: {answer}

Output STRICT JSON:
{"score": <0-100>, "feedback": "1-2 sentence feedback"}
A score >= 60 is passing.
```

**`quizGen.prompt.js`** — 5 MCQs, harder, covers full chapter.
```
Generate 5 multiple-choice quiz questions covering the full chapter "{title}".
Objectives: {objectives}.
Difficulty: medium-hard. Cover different objectives across the 5.

Output STRICT JSON array of 5 MCQs in the same shape as exercises.
```

### JSON Parsing Robustness
All structured Gemini responses go through a helper:
```js
function parseJsonResponse(text) {
  // strip ```json fences, find first { or [, parse
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = Math.min(
    ...[cleaned.indexOf('{'), cleaned.indexOf('[')].filter(i => i >= 0)
  );
  return JSON.parse(cleaned.slice(start));
}
```

---

## 8. Visualizations

Each chapter declares which visualizations to render in Tutor mode. Component renders inline within the chat scaffold.

### Library mapping
| Visualization | Library | Component |
|---|---|---|
| Big O growth curves | recharts | `BigOChart.jsx` — line chart, O(1) / O(log n) / O(n) / O(n log n) / O(n²) / O(2^n) |
| Sorting animation | framer-motion + custom | `SortingViz.jsx` — bars animate during bubble/insertion sort, play/pause/step controls |
| Binary Search Tree | react-flow | `BSTViz.jsx` — interactive node tree, insert/delete |
| Binary representation | custom CSS | `BinaryRepViz.jsx` — 8 toggleable bits show decimal value |
| Variable/memory boxes | framer-motion | `MemoryBoxViz.jsx` — animated boxes show variable assignment, reassignment |
| Control flow | react-flow | `ControlFlowViz.jsx` — if/else and loop flowchart with highlighted active path |

### Per-chapter assignment
| Course | Chapter | Visualizations |
|---|---|---|
| Intro CS | 1. Variables & Memory | MemoryBoxViz |
| Intro CS | 2. Binary & Number Systems | BinaryRepViz |
| Intro CS | 3. Control Flow | ControlFlowViz |
| DSA | 1. Big O Notation | BigOChart |
| DSA | 2. Sorting Algorithms | SortingViz |
| DSA | 3. Binary Search Trees | BSTViz |

---

## 9. Seed Data

Two courses, three chapters each. Below is the **exact data** to seed.

### Demo Users (`server/src/seed/users.seed.js`)
```js
[
  { email: 'demo@student.io',  name: 'Alex Demo',   password: 'demo123' },
  { email: 'sarah@student.io', name: 'Sarah Chen',  password: 'demo123' },
  { email: 'jordan@student.io',name: 'Jordan Park', password: 'demo123' }
]
```
Passwords stored plaintext for demo only (don't ship). Validation is exact-match on login.

### Course: Intro to CS (`introCS.seed.js`)

**Chapter 1: Variables & Memory**
- Description: "How computers store data and what variables really are."
- Objectives:
  - Explain what a variable is and why we use them
  - Describe how memory holds variable values
  - Distinguish between value reassignment and copying
  - Identify different primitive data types
- Visualizations: `MemoryBoxViz`
- Content (markdown): A ~500-word explanation covering: variables as labeled boxes in memory, assignment vs comparison, primitive types (int, float, bool, string), reassignment behavior. *Claude will write this during build.*

**Chapter 2: Binary & Number Systems**
- Description: "Why computers use 0s and 1s, and how to read them."
- Objectives:
  - Convert between decimal and binary
  - Explain why computers use binary
  - Read an 8-bit number
  - Describe how text becomes binary (ASCII basics)
- Visualizations: `BinaryRepViz`
- Content: ~500 words covering: base-2 vs base-10, bits and bytes, converting decimal↔binary, ASCII encoding.

**Chapter 3: Control Flow**
- Description: "How programs make decisions and repeat actions."
- Objectives:
  - Explain conditional execution (if/else)
  - Describe loop semantics (for, while)
  - Trace execution through nested control flow
  - Identify infinite loops and how to avoid them
- Visualizations: `ControlFlowViz`
- Content: ~500 words covering: conditionals, loops, nesting, common pitfalls.

### Course: Data Structures & Algorithms (`dsa.seed.js`)

**Chapter 1: Big O Notation**
- Description: "Measuring how algorithms scale."
- Objectives:
  - Define Big O notation in plain language
  - Identify the Big O of common operations (array access, search, sort)
  - Compare growth rates across O(1), O(n), O(n²), O(log n)
  - Explain why constants are dropped
- Visualizations: `BigOChart`
- Content: ~500 words covering: asymptotic analysis, worst case, common complexities, why dropping constants matters.

**Chapter 2: Sorting Algorithms**
- Description: "Three sorting techniques and when to use them."
- Objectives:
  - Explain bubble sort step-by-step
  - Explain insertion sort step-by-step
  - Compare time complexities of bubble, insertion, and merge sort
  - Describe stable vs unstable sorts
- Visualizations: `SortingViz`
- Content: ~500 words.

**Chapter 3: Binary Search Trees**
- Description: "Hierarchical structure for fast lookup."
- Objectives:
  - Define a BST and its ordering invariant
  - Describe insert, search, and delete operations
  - Explain why BSTs can become unbalanced
  - Compare BST to sorted array for search
- Visualizations: `BSTViz`
- Content: ~500 words.

---

## 10. Frontend Pages — Detailed Behavior

### `LoginPage.jsx`
- MUI Card centered, app name, email + password fields, "Sign in" button.
- 3 quick-login buttons under the form: "Login as Alex" / "Sarah" / "Jordan" — bypasses typing for demo speed.
- On success: store `userId` + `name` in `AuthContext` + `localStorage`, navigate to `/dashboard`.

### `DashboardPage.jsx`
- App bar with avatar + name + streak badge (e.g. 🔥 5 day streak)
- Heading: "Welcome back, {name}"
- Stats row: total chapters completed, current streak, certificates earned
- Course grid (MUI Cards): each shows title, description, progress bar, "Continue" or "Start" button
- Click → `/courses/:slug`

### `CoursePage.jsx`
- Course title + description hero
- Stepper-style chapter list (MUI Stepper, vertical orientation)
- Each chapter shows: title, objectives count, completion %, current stage badge
- Locked chapters greyed out (must complete previous chapter first)
- Click active/unlocked chapter → `/courses/:slug/chapters/:chapterId`

### `ChapterStagePage.jsx`
This is the workhorse. URL: `/courses/:slug/chapters/:chapterId`. Renders the **current stage** of that chapter based on Progress.

Layout:
- Top: chapter title, sub-stepper showing 6 stages (current highlighted)
- Below: stage-specific view

**Stage: `tutor`**
- Left pane: ChatWindow (history of messages, input box at bottom)
- Right pane: chapter description + objectives checklist (visual only, not interactive) + visualization component
- Button at top right: "I'm ready to practice" — enabled after ≥3 student messages. Click → POST `/progress/advance` with `stage: tutor`, then navigates to next stage.

**Stage: `exercise1` / `exercise2`**
- On mount: POST `/exercises/generate`. Show loading skeleton.
- Renders 3 exercises one at a time. Submit each, get feedback, "Next".
- After all 3: POST `/exercises/grade` (only short-answer needs Gemini; MCQs graded client-side or in same call for symmetry).
- Show summary card with score. If ≥60%: "Continue" advances. Else: "Try Again" regenerates.

**Stage: `reverseTutor`**
- ChatWindow with reversed roles styling (student message = "Tutor" badge, AI = "Curious Student" badge)
- AI opens with: "Hi! Teach me [chapter topic]. Pretend I'm a curious 5-year-old."
- Track exchange count. After 6 exchanges, show "End session & evaluate" button.
- On end: POST `/reverse-tutor/evaluate`. Show modal:
  - If passed: green check, score %, objectives covered list, "Continue" button
  - If failed: red X, score %, missed objectives, "Back to Tutor" button → resets chapter to `tutor` stage

**Stage: `quiz`**
- POST `/quiz/generate` on mount
- 5 questions, one at a time with progress dots
- Submit all at end → POST `/quiz/submit`
- Score card. ≥70% passes. Else "Retry quiz".

**Stage: `summary`**
- Auto-generated chapter summary (can hardcode in seed for hackathon — Gemini call optional)
- Shows: what you learned (objectives), score breakdown across stages, "Continue to next chapter" button
- If last chapter of course: button becomes "Claim Certificate" → POST `/certificate/issue`, shows CertificateModal

### `ProfilePage.jsx`
- Avatar + name + email
- Streak heatmap (last 30 days, GitHub-style — use a simple grid of MUI boxes)
- All certificates earned (list with download buttons)
- All courses with progress %

### `CertificateModal.jsx`
- Modal opens with confetti animation (use `canvas-confetti`)
- Shows certificate preview image (an `<img>` of the generated PDF first page is overkill — just show a styled MUI Paper that mimics the PDF design)
- Displays mock Solana tx hash: `0x...` (64 hex chars) with copy button
- "View on Explorer" button — link to a fake URL like `https://explorer.solana.com/tx/{hash}?cluster=devnet` (it'll 404 but looks legit for demo)
- "Download PDF" button — fetches `/certificates/<userId>-<courseId>.pdf`

---

## 11. Backend — Key Service Logic

### `streak.service.js`
```js
async function recordActivity(userId) {
  const streak = await Streak.findOne({ userId }) || new Streak({ userId, currentStreak: 0, longestStreak: 0 });
  const today = new Date().toISOString().slice(0,10);
  const last = streak.lastActivityDate?.toISOString().slice(0,10);

  if (last === today) return streak; // already counted

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  streak.currentStreak = (last === yesterday) ? streak.currentStreak + 1 : 1;
  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  streak.lastActivityDate = new Date();
  streak.activityDates.push(new Date());
  await streak.save();
  return streak;
}
```
Call this from every `/progress/advance` endpoint.

### `certificate.service.js`
- Generate mock tx hash: `'0x' + crypto.randomBytes(32).toString('hex')`
- Use `pdfkit` to draw a certificate: course title, student name, completion date, "Issued on Solana devnet", tx hash at bottom, decorative border
- Save to `server/certificates/<userId>-<courseId>.pdf`
- Serve via `express.static('certificates')`

### `progress.service.js`
- `advanceStage(userId, courseId, chapterId, stage, payload)`:
  - Update Progress doc for matching chapter
  - Mark stage as complete with timestamp + score
  - Compute next stage from sequence
  - If next stage is `completed`: increment course completion check
  - Recompute overall percent
  - Return updated progress

### `demoAuth.js` middleware
```js
module.exports = async (req, res, next) => {
  const userId = req.header('x-demo-user-id');
  if (!userId) return res.status(401).json({ error: 'No demo user header' });
  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ error: 'Invalid demo user' });
  req.user = user;
  next();
};
```

---

## 12. Environment Variables

### `client/.env`
```
VITE_API_BASE_URL=http://localhost:5000/api
```
Production (Vercel): `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

### `server/.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
GEMINI_API_KEY=...
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```
Production: update `CLIENT_ORIGIN` to Vercel URL.

---

## 13. CORS

Server: `cors({ origin: process.env.CLIENT_ORIGIN, credentials: false })`. No cookies needed (header-based auth).

---

## 14. Build & Run

### Local
```bash
# Terminal 1: backend
cd server
npm install
cp .env.example .env  # fill in MONGO_URI, GEMINI_API_KEY
node src/seed/seed.js  # one-time seed
npm run dev            # nodemon src/server.js

# Terminal 2: frontend
cd client
npm install
cp .env.example .env
npm run dev            # vite on :5173
```

### Deploy
- **Backend (Render)**: connect repo, set root to `server`, build: `npm install`, start: `node src/server.js`, env vars set in dashboard. Run seed once via Render Shell: `node src/seed/seed.js`.
- **Frontend (Vercel)**: connect repo, set root to `client`, framework: Vite. Env var `VITE_API_BASE_URL` set to Render URL.

---

## 15. Demo Script (5 min)

1. **0:00** — Open Vercel URL, hit "Login as Alex"
2. **0:15** — Dashboard. Point out streak, courses, progress.
3. **0:30** — Open DSA → Chapter 1 (Big O). Tutor mode opens.
4. **0:45** — Show BigOChart visualization. Ask AI "what's the Big O of binary search?" — show response.
5. **1:15** — Click "I'm ready" → exercise stage. Answer 1 MCQ, 1 short answer. Show grading.
6. **2:00** — Enter Reverse Tutor. **This is the wow moment.** Explain Big O to the AI. AI probes with "why do we drop constants?"
7. **3:00** — End session → evaluation modal: 80% score, 3/4 objectives covered. Pass!
8. **3:30** — Quick run through quiz (have answers ready). Pass.
9. **4:00** — Chapter summary. Show progress bar advance.
10. **4:15** — *(Optionally)* skip ahead via pre-seeded "almost-complete" state on Sarah's account → claim certificate → confetti + tx hash → download PDF.
11. **4:45** — Close with elevator pitch.

**Pro tip:** seed Sarah's account with 5 of 6 chapters complete on DSA so you can demo the certificate flow without waiting.

---

## 16. Out-of-Scope (Explicit Cuts)

To stop scope creep mid-hackathon:
- ❌ Real auth (JWT, OAuth, password hashing)
- ❌ Lecturer side (curriculum upload UI, lecturer dashboard)
- ❌ PDF/markdown curriculum ingestion
- ❌ Voice input/output
- ❌ Vector database / RAG
- ❌ Real blockchain interaction (Solana SDK, wallet connect)
- ❌ Chat history persistence
- ❌ Multi-language
- ❌ Mobile responsive optimization (desktop demo only — but don't break on mobile)
- ❌ Error retry queues, rate limiting, monitoring
- ❌ Tests (write only if time at end)

---

## 17. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| Gemini returns malformed JSON | Strict prompt + `parseJsonResponse` helper with fences-strip; fallback retry once |
| Gemini free tier rate limit hit during demo | Pre-seed 1–2 sample exercises and quiz per chapter as fallback; cache LLM responses keyed by (chapterId+stage) for demo idempotency |
| Reverse Tutor eval gives weird score | Hardcode pass=true for the demo account's known-good path, OR test conversation flow extensively beforehand |
| Live API calls slow demo down | Pre-warm during intro slide; use `gemini-2.5-flash` (already fast) |
| MongoDB Atlas cold start | Hit health endpoint 30 sec before demo |
| Certificate PDF generation fails | Pre-generate a sample PDF and serve statically as fallback |

---

## 18. Build Order (Suggested for Hackathon)

If splitting work across teammates:

**Day 1 — Foundation (parallel)**
- Dev A: scaffold backend, models, seed data, demoAuth, basic routes (courses/chapters/progress)
- Dev B: scaffold frontend, MUI theme, routing, login, dashboard, course page
- Dev C: Gemini service + all prompts, test each one in isolation with curl

**Day 2 — Core Features (parallel)**
- Dev A: tutor + exercise endpoints + grading
- Dev B: ChatWindow + ChapterStagePage + exercise components
- Dev C: Reverse Tutor flow (most complex piece)

**Day 3 — Polish**
- Visualizations (split per dev)
- Certificate generation + modal + confetti
- Streak logic + profile page
- Seed Sarah's "almost done" account for demo
- Deploy to Vercel + Render
- Rehearse demo script 3×

---

## 19. Definition of Done (Demo-Ready)

- [ ] Three demo users seeded, all can log in via quick-login buttons
- [ ] Both courses visible on dashboard with correct progress
- [ ] At least one full chapter playable end-to-end: tutor → exercise → reverse-tutor → exercise → quiz → summary
- [ ] Reverse Tutor evaluation returns a real score and pass/fail
- [ ] At least one visualization renders correctly per course
- [ ] Streak increments after stage completion
- [ ] Certificate generates with mock tx hash, PDF downloads
- [ ] Confetti fires on certificate issue
- [ ] Deployed to Vercel + Render, working URL ready
- [ ] Sarah account pre-seeded near-complete for fast certificate demo
- [ ] Demo script rehearsed under 5 min

---

## 20. Implementation Notes for AI Code Generator

When generating code from this spec:

- **MUI v5 syntax**: use `sx` prop for inline styling, not styled-components.
- **React Router v6**: use `useNavigate`, `<Outlet />`, `<Routes>/<Route>` (no `Switch`).
- **Axios**: create one instance in `client/src/api/client.js` with interceptor injecting `x-demo-user-id` header from localStorage.
- **Mongoose**: use `mongoose.Schema.Types.ObjectId` for refs. Set `timestamps: true` on schemas.
- **Gemini SDK**: `const { GoogleGenerativeAI } = require('@google/generative-ai')`. Pass safety settings explicitly to avoid unexpected blocks.
- **Async error handling**: wrap all controllers in a `asyncHandler` helper that catches and forwards to error middleware.
- **All chat endpoints are stateless** — client sends full history each call. No chat persistence in DB.
- **Visualization components must be self-contained** — accept props from chapter.visualizations, no external state.
- **Don't fabricate chapter content** — generate it as 400–600 word markdown matching the objectives listed in §9 seed data.

---

End of spec.
