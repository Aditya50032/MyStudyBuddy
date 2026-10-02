## What I Built

I built **StudyBuddy** for my close friend **Rohan**, who is currently juggling a grueling preparation schedule for software engineering technical interviews and system design certifications while working a demanding job.

### The Problem Rohan Faced
Whenever Rohan sat down to study in the evenings, he hit three recurring roadblocks:
1. **Focus Fragmentation & Tab Drifting**: Traditional web timers drift by several seconds or stall entirely when backgrounded in another tab during coding exercises, ruining pomodoro rhythms.
2. **The "Illusion of Competence"**: Passively rereading notes or documentation gave him a false sense of mastery, only for the knowledge to evaporate days later (the classic *Ebbinghaus Forgetting Curve*).
3. **App Bloat & Paywalls**: Popular flashcard and quiz apps are clunky, loaded with subscription paywalls, require mandatory account sign-ups, or bombard the user with ads right when deep focus is needed most.

### The Solution: StudyBuddy
**StudyBuddy** is a zero-bloat, distraction-free study companion that unites the three most scientifically backed learning methods into one unified, offline-first web experience:

* ⏱️ **Zero-Drift Pomodoro Timer**: Engineered with monotonic delta timing and tab visibility recalibration, paired with native Web Audio chime alerts and a soothing synthesized Lo-Fi ambient rain generator.
* 🗂️ **Interactive 3D Flip Flashcards**: Tactile 3D perspective flip cards with 4-level Leitner-inspired recall feedback (*Again*, *Hard*, *Good*, *Easy*) that dynamically calculates deck mastery.
* 📝 **Smart Quiz Engine**: Instantly transforms any flashcard deck into an interactive 4-option multiple choice test or rapid recall drill with automated distractor generation, countdown timers, and celebration confetti.
* 🎨 **Deep Customization**: 4 curated themes (*Midnight Nebula*, *Daylight Paper*, *Forest Calm*, *Sunset Glow*), custom timer durations, and full JSON import/export so Rohan owns all his study notes with zero cloud lock-in.

---

## Demo

StudyBuddy runs instantly in any modern web browser with zero build steps or external dependencies.

* **Live Local Demo**: `http://localhost:3000`
* **Zero Installation**: Simply open `index.html` in your browser.

### Key Interactive Highlights
* **Pomodoro Dial**: Glowing circular SVG progress ring, session cycle tracker (e.g. 🍅 1 of 4), and quick preset chips (15m, 25m, 45m, 50m).
* **3D Flip Interaction**: Press <kbd>Space</kbd> or click to flip the card in 3D space with subtle ambient lighting.
* **Smart Quiz**: Instant feedback highlighting correct answers in emerald green and mistakes in ruby red with full explanations.
* **Sound Design**: Pure Web Audio synthesis — dual-harmonic sine bells (528Hz Solfeggio + 660Hz) and brown-noise rain generator.

---

## Code

{% github Aditya50032/MyStudyBuddy %}

🔗 **GitHub Repository**: [github.com/Aditya50032/MyStudyBuddy](https://github.com/Aditya50032/MyStudyBuddy/tree/main)

The entire codebase is open-source, standalone, and built with pure HTML5, Vanilla CSS, and modern JavaScript:

```
DEV project/
├── index.html       # Semantic layout, SVG dials, accessible modals & tab controls
├── styles.css       # 4 theme palettes, 3D card transforms, glassmorphic surfaces
└── app.js           # Zero-drift timer, Web Audio synthesis, Leitner rating & quiz engine
```

### Core Architecture Highlights

#### 1. High-Precision Zero-Drift Clock Math (`app.js`)
Standard `setInterval(counter--, 1000)` drifts severely due to main-thread event loop lag and background tab throttling. StudyBuddy derives remaining time from monotonic wall-clock deltas and hooks into the `visibilitychange` event:

```javascript
recalibrate() {
  if (!this.isRunning) return;
  const now = performance.now();
  this.remainingMs = Math.max(0, this.targetEndTime - now);
  if (this.remainingMs <= 0) {
    this.finishSession();
  } else {
    this.onTick(this.getState());
  }
}
```

#### 2. Asset-Free Native Audio Synthesis
Rather than loading heavy MP3 files that fail or get blocked by browser autoplay policies, sounds are synthesized dynamically:

```javascript
playTimerChime() {
  const now = this.ctx.currentTime;
  const osc1 = this.ctx.createOscillator();
  const osc2 = this.ctx.createOscillator();
  const gain = this.ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(528, now); // Solfeggio frequency
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(660, now + 0.1);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(this.ctx.destination);
  osc1.start(now);
  osc2.start(now + 0.1);
  osc1.stop(now + 2.2);
  osc2.stop(now + 2.2);
}
```

#### 3. Automated Distractor Generation for Quizzes
When a quiz starts, the engine extracts the correct answers and dynamically synthesizes plausible distractors from the remaining deck pool to challenge active recall.

---

## How I Built It

I built StudyBuddy through an interactive agentic pair-programming workflow using **Google Antigravity** and **Gemini 3.8 Flash**, grounding architectural decisions in proven open community patterns:

1. **Community Research Pass**: Before writing a single line of code, we queried developer wisdom on [dev.to](https://dev.to) to address known pitfalls with web timers. RayLabs' article, *[Build a Zero-Drift Web Timer](https://dev.to/raylabs/build-a-zero-drift-web-timer-3bip)*, provided the foundation for our monotonic clock delta math and Page Visibility recalibration.
2. **Cognitive Science Principles**: We pre-loaded starter decks covering the *Ebbinghaus Forgetting Curve*, *Leitner Spaced Repetition*, and *Active Recall* so that users immediately experience why testing beats rereading.
3. **Local-First & Resilient**: We avoided heavy frontend dependencies (like React or Webpack) in favor of zero-dependency modern vanilla web standards, ensuring instantaneous 60fps load times and absolute portability.

---

## Why Does Open Innovation Matter?

Open innovation is what made building StudyBuddy possible in a single weekend:

1. **Complete Privacy & Zero Data Harvesting**: Rohan's study notes, interview questions, and focus logs belong strictly to him. In an era where educational platforms monetize user data and lock essential features behind paywalls, an open-source, local-first app guarantees 100% data sovereignty.
2. **Works Everywhere, Even Offline**: Open web standards mean this app runs without internet connectivity on a subway commute, in a quiet library corner, or on an airplane.
3. **Extensibility for the Community**: Because the code is open and cleanly decoupled, anyone can fork it, contribute new flashcard packs, add LaTeX math formatting, or integrate local open-weight AI models (like **Gemma 2** via Ollama) to automatically generate flashcards directly from lecture PDFs and raw notes.

---

## My Agent Session

This entire application was designed, researched, implemented, and verified in an agentic coding session with DevRelay. You can inspect the full prompt trajectory, research calls, and implementation steps below:

{% agent_session 378 %}

🔗 **Direct Session Link**: [View Agent Session on DEV](https://dev.to/agent_sessions/building-studybuddy-zero-drift-pomodoro-3d-flashcards-quiz-engine-6c2e3g)

---

## Prize Categories

* **Hacktoberfest Weekend Challenge: Build for a Friend** (Primary Entry)
* **Best Use of Open Tools & Local AI Architecture**

---

*Built with ❤️ for Rohan and lifelong learners everywhere.*
