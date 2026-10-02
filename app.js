/**
 * STUDYBUDDY — Core Application Logic
 * Featuring: Zero-Drift Pomodoro Timer, 3D Flashcards Deck Engine,
 * Smart Quiz Generator with Multiple Choice / Rapid Recall, and LocalStorage Sync.
 */

// ==========================================
// 1. DEFAULT DATA & STARTER DECKS
// ==========================================
const DEFAULT_DECKS = [
  {
    id: "deck-web-dev",
    title: "Web Development Essentials",
    emoji: "💻",
    description: "Core frontend concepts: DOM, Event Loop, Closures, CSS & APIs.",
    cards: [
      {
        id: "c-1",
        front: "What is a JavaScript Closure and why is it useful?",
        back: "A closure is the combination of a function bundled together with references to its surrounding lexical environment. It gives inner functions access to an outer function's scope, enabling data privacy, state encapsulation, and factory functions.",
        category: "JavaScript",
        mastery: 0
      },
      {
        id: "c-2",
        front: "What is the difference between Microtasks and Macrotasks in the Event Loop?",
        back: "Microtasks (Promises, queueMicrotask, MutationObserver) have higher priority and are completely drained before the next render or Macrotask (setTimeout, setInterval, I/O events).",
        category: "JavaScript",
        mastery: 0
      },
      {
        id: "c-3",
        front: "Explain the CSS Box Model components from inside out.",
        back: "1. Content (text/image) -> 2. Padding (space around content) -> 3. Border (frame around padding) -> 4. Margin (spacing between element and outside elements). With `box-sizing: border-box`, padding and border are included in width/height.",
        category: "CSS",
        mastery: 0
      },
      {
        id: "c-4",
        front: "What is the difference between `==` (loose) and `===` (strict) equality in JS?",
        back: "`==` performs type coercion before comparison (e.g. '5' == 5 is true). `===` checks both value and type without coercion ('5' === 5 is false). Strict equality is recommended to avoid subtle bugs.",
        category: "JavaScript",
        mastery: 0
      },
      {
        id: "c-5",
        front: "What is the Nullish Coalescing Operator (`??`) and how is it different from `||`?",
        back: "`??` returns the right-hand operand only when the left-hand operand is `null` or `undefined`. Unlike `||`, it does not treat falsy values like `0`, `\"\"`, or `false` as triggers.",
        category: "JavaScript",
        mastery: 0
      },
      {
        id: "c-6",
        front: "What is CSS Specificity and how is it calculated?",
        back: "Specificity determines which CSS rule applies when selectors conflict. Hierarchy: Inline styles (1,0,0,0) > IDs (0,1,0,0) > Classes/attributes/pseudo-classes (0,0,1,0) > Elements/pseudo-elements (0,0,0,1).",
        category: "CSS",
        mastery: 0
      },
      {
        id: "c-7",
        front: "What is Debouncing vs Throttling in event handling?",
        back: "Debouncing delays execution until a certain amount of time has elapsed since the last call (e.g., search input autocomplete). Throttling enforces a maximum frequency of executions over time (e.g., scroll listeners).",
        category: "Web Perf",
        mastery: 0
      }
    ]
  },
  {
    id: "deck-cognitive",
    title: "Cognitive Science & Study Tactics",
    emoji: "🧠",
    description: "Evidence-based techniques for deep learning and long-term retention.",
    cards: [
      {
        id: "cog-1",
        front: "What is Active Recall and why is it superior to passive rereading?",
        back: "Active recall forces the brain to retrieve information from memory rather than passively reviewing notes. This effort strengthens neural pathways and memory consolidation through the testing effect.",
        category: "Study Tactics",
        mastery: 0
      },
      {
        id: "cog-2",
        front: "How does the Ebbinghaus Forgetting Curve describe memory loss?",
        back: "It shows that humans halve their memory of newly learned knowledge within days unless reviewed. Reviewing at spaced intervals flattens the curve, transferring knowledge to permanent long-term storage.",
        category: "Memory",
        mastery: 0
      },
      {
        id: "cog-3",
        front: "What is the Leitner System of spaced repetition?",
        back: "A flashcard sorting technique using boxes. Correctly answered cards move to higher boxes reviewed less frequently; incorrectly answered cards return to box 1 for immediate review.",
        category: "Study Tactics",
        mastery: 0
      },
      {
        id: "cog-4",
        front: "What is Interleaving Practice vs Blocked Practice?",
        back: "Blocked practice studies one topic repeatedly (AAA, BBB). Interleaving mixes related concepts (ABC, BCA). Though it feels harder initially, interleaving produces vastly superior long-term discrimination and recall.",
        category: "Cognition",
        mastery: 0
      },
      {
        id: "cog-5",
        front: "What is the Feynman Technique for understanding complex subjects?",
        back: "1. Choose a concept. 2. Teach it to a 10-year-old in simple, jargon-free words. 3. Identify gaps in your explanation. 4. Review source material and simplify until effortless.",
        category: "Mastery",
        mastery: 0
      }
    ]
  }
];

const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  cycles: 4,
  theme: "midnight",
  soundEnabled: true,
  autoBreak: false
};

// ==========================================
// 2. STORE & PERSISTENCE
// ==========================================
class Store {
  constructor() {
    this.decks = this.loadDecks();
    this.settings = this.loadSettings();
    this.stats = this.loadStats();
    this.activeDeckId = this.decks[0]?.id || "";
  }

  loadDecks() {
    try {
      const data = localStorage.getItem("studybuddy_decks");
      return data ? JSON.parse(data) : DEFAULT_DECKS;
    } catch (e) {
      console.warn("Could not load decks from localStorage", e);
      return DEFAULT_DECKS;
    }
  }

  saveDecks() {
    try {
      localStorage.setItem("studybuddy_decks", JSON.stringify(this.decks));
    } catch (e) {
      console.error("Could not save decks", e);
    }
  }

  loadSettings() {
    try {
      const data = localStorage.getItem("studybuddy_settings");
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem("studybuddy_settings", JSON.stringify(this.settings));
    } catch (e) {
      console.error("Could not save settings", e);
    }
  }

  loadStats() {
    const today = new Date().toISOString().split("T")[0];
    try {
      const raw = localStorage.getItem("studybuddy_stats");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.date === today) {
        return parsed;
      }
      return {
        date: today,
        streak: parsed?.streak || 1,
        focusMinutes: 0,
        cardsReviewed: 0,
        quizScores: []
      };
    } catch (e) {
      return { date: today, streak: 1, focusMinutes: 0, cardsReviewed: 0, quizScores: [] };
    }
  }

  saveStats() {
    try {
      localStorage.setItem("studybuddy_stats", JSON.stringify(this.stats));
    } catch (e) {
      console.error("Could not save stats", e);
    }
  }

  getActiveDeck() {
    return this.decks.find(d => d.id === this.activeDeckId) || this.decks[0];
  }

  addDeck(title, emoji, description) {
    const newDeck = {
      id: "deck-" + Date.now(),
      title: title.trim(),
      emoji: emoji.trim() || "📚",
      description: description.trim() || "Custom study deck",
      cards: []
    };
    this.decks.push(newDeck);
    this.saveDecks();
    return newDeck;
  }

  deleteDeck(deckId) {
    if (this.decks.length <= 1) return false;
    this.decks = this.decks.filter(d => d.id !== deckId);
    if (this.activeDeckId === deckId) {
      this.activeDeckId = this.decks[0].id;
    }
    this.saveDecks();
    return true;
  }

  addCard(deckId, front, back, category = "General") {
    const deck = this.decks.find(d => d.id === deckId);
    if (!deck) return null;
    const newCard = {
      id: "c-" + Date.now(),
      front: front.trim(),
      back: back.trim(),
      category: category.trim() || deck.title,
      mastery: 0
    };
    deck.cards.push(newCard);
    this.saveDecks();
    return newCard;
  }

  updateCard(deckId, cardId, front, back) {
    const deck = this.decks.find(d => d.id === deckId);
    if (!deck) return;
    const card = deck.cards.find(c => c.id === cardId);
    if (card) {
      card.front = front.trim();
      card.back = back.trim();
      this.saveDecks();
    }
  }

  deleteCard(deckId, cardId) {
    const deck = this.decks.find(d => d.id === deckId);
    if (!deck) return;
    deck.cards = deck.cards.filter(c => c.id !== cardId);
    this.saveDecks();
  }

  updateCardMastery(deckId, cardId, rating) {
    // rating: 1 (again) -> 0, 2 (hard) -> +1, 3 (good) -> +2, 4 (easy) -> +3
    const deck = this.decks.find(d => d.id === deckId);
    if (!deck) return;
    const card = deck.cards.find(c => c.id === cardId);
    if (!card) return;

    if (rating === 1) {
      card.mastery = Math.max(0, (card.mastery || 0) - 1);
    } else if (rating === 2) {
      card.mastery = Math.min(3, (card.mastery || 0) + 1);
    } else if (rating === 3) {
      card.mastery = Math.min(4, (card.mastery || 0) + 2);
    } else if (rating === 4) {
      card.mastery = 5;
    }
    this.stats.cardsReviewed = (this.stats.cardsReviewed || 0) + 1;
    this.saveDecks();
    this.saveStats();
  }

  resetAllToDefault() {
    this.decks = JSON.parse(JSON.stringify(DEFAULT_DECKS));
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.activeDeckId = this.decks[0].id;
    this.saveDecks();
    this.saveSettings();
  }
}

// ==========================================
// 3. AUDIO SYNTHESIZER (Asset-Free Web Audio)
// ==========================================
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.ambientNode = null;
    this.ambientGain = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Harmonic chime for timer completion (two resonant sine waves)
  playTimerChime() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(528, now); // C5 Solfeggio frequency
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(660, now + 0.1); // E5
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(792, now + 0.2); // G5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc1.connect(gain);
      osc2.connect(gain);
      osc3.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.1);
      osc3.start(now + 0.2);

      osc1.stop(now + 2.2);
      osc2.stop(now + 2.2);
      osc3.stop(now + 2.2);
    } catch (e) {
      console.warn("Audio chime playback error:", e);
    }
  }

  // Pleasant click/flip tone
  playFlipTone() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Correct answer bell
  playSuccessTone() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.1);
      osc.frequency.setValueAtTime(659.25, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }

  // Wrong answer soft note
  playErrorTone() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // Continuous synthesized Brown/Rain Lo-Fi Ambient Noise
  toggleAmbient(enable) {
    this.init();
    if (!this.ctx) return false;

    if (!enable) {
      if (this.ambientNode) {
        try {
          this.ambientNode.stop();
          this.ambientNode.disconnect();
        } catch (e) {}
        this.ambientNode = null;
      }
      this.isAmbientPlaying = false;
      return false;
    }

    try {
      // Generate 5 seconds of brown noise buffer and loop it
      const bufferSize = this.ctx.sampleRate * 4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain boost
      }

      this.ambientNode = this.ctx.createBufferSource();
      this.ambientNode.buffer = buffer;
      this.ambientNode.loop = true;

      // Filter to create warm rain / cafe frequency
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.ambientNode.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientNode.start(0);
      this.isAmbientPlaying = true;
      return true;
    } catch (e) {
      console.warn("Could not start ambient noise:", e);
      this.isAmbientPlaying = false;
      return false;
    }
  }
}

// ==========================================
// 4. ZERO-DRIFT POMODORO ENGINE
// ==========================================
class Pomodoro {
  constructor(store, audio, onTick, onComplete) {
    this.store = store;
    this.audio = audio;
    this.onTick = onTick;
    this.onComplete = onComplete;

    this.mode = "focus"; // 'focus' | 'shortBreak' | 'longBreak'
    this.cycleCount = 1;
    this.isRunning = false;

    this.totalDurationMs = this.store.settings.focusTime * 60 * 1000;
    this.remainingMs = this.totalDurationMs;
    this.targetEndTime = null;
    this.intervalId = null;

    // Listen for tab focus change to instantly recalibrate wall clock time
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isRunning) {
        this.recalibrate();
      }
    });
  }

  setMode(mode, customMinutes = null) {
    this.pause();
    this.mode = mode;
    let mins;
    if (customMinutes) {
      mins = customMinutes;
    } else if (mode === "focus") {
      mins = this.store.settings.focusTime;
    } else if (mode === "shortBreak") {
      mins = this.store.settings.shortBreak;
    } else {
      mins = this.store.settings.longBreak;
    }

    this.totalDurationMs = mins * 60 * 1000;
    this.remainingMs = this.totalDurationMs;
    this.onTick(this.getState());
  }

  start() {
    if (this.isRunning) return;
    this.audio.init();
    this.isRunning = true;
    this.targetEndTime = performance.now() + this.remainingMs;

    this.intervalId = setInterval(() => {
      this.tick();
    }, 250); // High frequency check for smooth UI updates

    this.onTick(this.getState());
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Snap remaining
    const now = performance.now();
    this.remainingMs = Math.max(0, this.targetEndTime - now);
    this.onTick(this.getState());
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  reset() {
    this.pause();
    this.remainingMs = this.totalDurationMs;
    this.onTick(this.getState());
  }

  skip() {
    this.pause();
    this.advanceCycle(true);
  }

  tick() {
    const now = performance.now();
    this.remainingMs = Math.max(0, this.targetEndTime - now);

    if (this.remainingMs <= 0) {
      this.finishSession();
      return;
    }
    this.onTick(this.getState());
  }

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

  finishSession() {
    this.pause();
    this.remainingMs = 0;
    this.onTick(this.getState());

    if (this.store.settings.soundEnabled) {
      this.audio.playTimerChime();
    }

    if (this.mode === "focus") {
      const minutesSpent = Math.round(this.totalDurationMs / 60000);
      this.store.stats.focusMinutes = (this.store.stats.focusMinutes || 0) + minutesSpent;
      this.store.saveStats();
    }

    this.onComplete(this.mode);
    this.advanceCycle(false);
  }

  advanceCycle(isManualSkip = false) {
    if (this.mode === "focus") {
      if (this.cycleCount >= this.store.settings.cycles) {
        this.cycleCount = 1;
        this.setMode("longBreak");
      } else {
        this.cycleCount++;
        this.setMode("shortBreak");
      }
    } else {
      // Was a break, advance to focus
      this.setMode("focus");
    }

    if (!isManualSkip && this.store.settings.autoBreak) {
      this.start();
    }
  }

  getState() {
    const totalSeconds = Math.ceil(this.remainingMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const progress = this.totalDurationMs > 0 ? (1 - this.remainingMs / this.totalDurationMs) : 0;

    return {
      mode: this.mode,
      isRunning: this.isRunning,
      formattedTime: `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
      progressRatio: progress,
      cycleCount: this.cycleCount,
      totalCycles: this.store.settings.cycles
    };
  }
}

// ==========================================
// 5. FLASHCARDS CONTROLLER
// ==========================================
class FlashcardController {
  constructor(store, audio, onRender) {
    this.store = store;
    this.audio = audio;
    this.onRender = onRender;
    this.currentIndex = 0;
    this.isFlipped = false;
  }

  getActiveDeck() {
    return this.store.getActiveDeck();
  }

  getCurrentCard() {
    const deck = this.getActiveDeck();
    if (!deck || !deck.cards.length) return null;
    if (this.currentIndex >= deck.cards.length) {
      this.currentIndex = 0;
    }
    return deck.cards[this.currentIndex];
  }

  flip() {
    this.isFlipped = !this.isFlipped;
    if (this.store.settings.soundEnabled) {
      this.audio.playFlipTone();
    }
    this.onRender();
  }

  next() {
    const deck = this.getActiveDeck();
    if (!deck || !deck.cards.length) return;
    this.isFlipped = false;
    this.currentIndex = (this.currentIndex + 1) % deck.cards.length;
    this.onRender();
  }

  prev() {
    const deck = this.getActiveDeck();
    if (!deck || !deck.cards.length) return;
    this.isFlipped = false;
    this.currentIndex = (this.currentIndex - 1 + deck.cards.length) % deck.cards.length;
    this.onRender();
  }

  rateCard(rating) {
    const card = this.getCurrentCard();
    if (!card) return;
    this.store.updateCardMastery(this.store.activeDeckId, card.id, rating);
    this.next();
  }

  shuffle() {
    const deck = this.getActiveDeck();
    if (!deck || deck.cards.length <= 1) return;
    for (let i = deck.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    this.store.saveDecks();
    this.onRender();
  }

  setDeck(deckId) {
    this.store.activeDeckId = deckId;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.onRender();
  }
}

// ==========================================
// 6. QUIZ CONTROLLER & GENERATOR
// ==========================================
class QuizController {
  constructor(store, audio, onStateChange) {
    this.store = store;
    this.audio = audio;
    this.onStateChange = onStateChange;

    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.timerSeconds = 20;
    this.timerLimit = 20;
    this.timerInterval = null;
    this.mode = "multipleChoice"; // 'multipleChoice' | 'flashRecall'
    this.answered = false;
    this.history = []; // tracks answers for review screen
  }

  startQuiz(deckId, countSetting, mode, timeLimit) {
    let pool = [];
    if (deckId === "all") {
      this.store.decks.forEach(d => pool.push(...d.cards));
    } else {
      const deck = this.store.decks.find(d => d.id === deckId);
      pool = deck ? [...deck.cards] : [];
    }

    if (pool.length === 0) {
      return { success: false, message: "No cards available in this deck to generate a quiz!" };
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const count = countSetting === "all" ? shuffled.length : Math.min(parseInt(countSetting), shuffled.length);
    const selectedCards = shuffled.slice(0, count);

    // Build questions
    this.questions = selectedCards.map(card => {
      // Find 3 distractors from the remaining cards
      const otherAnswers = pool
        .filter(c => c.id !== card.id && c.back !== card.back)
        .map(c => c.back);

      let distractors = otherAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      // Fallback distractors if deck has fewer than 4 cards
      if (distractors.length < 3) {
        const fallbacks = [
          "None of the above accurately describes this concept.",
          "An outdated pattern superseded by modern browser standards.",
          "A synchronous blocking operation running outside the main thread."
        ];
        distractors.push(...fallbacks.slice(0, 3 - distractors.length));
      }

      const options = [card.back, ...distractors].sort(() => 0.5 - Math.random());

      return {
        cardId: card.id,
        deckTitle: card.category || "General",
        question: card.front,
        correctAnswer: card.back,
        options: options,
        userAnswer: null,
        isCorrect: false
      };
    });

    this.mode = mode;
    this.timerLimit = parseInt(timeLimit) || 0;
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.history = [];

    this.nextQuestion();
    return { success: true };
  }

  nextQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.finishQuiz();
      return;
    }

    this.answered = false;
    const currentQ = this.questions[this.currentIndex];

    // Timer reset
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.timerLimit > 0) {
      this.timerSeconds = this.timerLimit;
      this.timerInterval = setInterval(() => {
        this.timerSeconds--;
        if (this.timerSeconds <= 0) {
          clearInterval(this.timerInterval);
          this.handleTimeout();
        }
        this.onStateChange("timer", { seconds: this.timerSeconds });
      }, 1000);
    }

    this.onStateChange("question", {
      current: currentQ,
      index: this.currentIndex,
      total: this.questions.length,
      score: this.score,
      mode: this.mode,
      timerSeconds: this.timerLimit > 0 ? this.timerLimit : null
    });
  }

  submitAnswer(selectedAnswer) {
    if (this.answered) return;
    this.answered = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const currentQ = this.questions[this.currentIndex];
    currentQ.userAnswer = selectedAnswer;
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    currentQ.isCorrect = isCorrect;

    if (isCorrect) {
      this.score++;
      if (this.store.settings.soundEnabled) this.audio.playSuccessTone();
    } else {
      if (this.store.settings.soundEnabled) this.audio.playErrorTone();
    }

    this.history.push({ ...currentQ });
    this.onStateChange("feedback", {
      isCorrect,
      correctAnswer: currentQ.correctAnswer,
      selectedAnswer,
      score: this.score
    });
  }

  handleTimeout() {
    if (this.answered) return;
    this.answered = true;
    const currentQ = this.questions[this.currentIndex];
    currentQ.userAnswer = "(Time Expired)";
    currentQ.isCorrect = false;
    if (this.store.settings.soundEnabled) this.audio.playErrorTone();

    this.history.push({ ...currentQ });
    this.onStateChange("feedback", {
      isCorrect: false,
      isTimeout: true,
      correctAnswer: currentQ.correctAnswer,
      selectedAnswer: "(Time Expired)",
      score: this.score
    });
  }

  gradeFlashRecall(isCorrect) {
    if (this.answered) return;
    this.answered = true;
    const currentQ = this.questions[this.currentIndex];
    currentQ.isCorrect = isCorrect;
    currentQ.userAnswer = isCorrect ? currentQ.correctAnswer : "(Missed Recall)";

    if (isCorrect) {
      this.score++;
      if (this.store.settings.soundEnabled) this.audio.playSuccessTone();
    } else {
      if (this.store.settings.soundEnabled) this.audio.playErrorTone();
    }

    this.history.push({ ...currentQ });
    this.onStateChange("feedback", {
      isCorrect,
      correctAnswer: currentQ.correctAnswer,
      selectedAnswer: isCorrect ? currentQ.correctAnswer : "(Missed)",
      score: this.score
    });
  }

  finishQuiz() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const percentage = Math.round((this.score / this.questions.length) * 100);

    // Record stats
    this.store.stats.quizScores.push({
      date: new Date().toISOString(),
      score: this.score,
      total: this.questions.length,
      percentage
    });
    this.store.saveStats();

    this.onStateChange("results", {
      score: this.score,
      total: this.questions.length,
      percentage,
      history: this.history
    });
  }
}

// ==========================================
// 7. CONFETTI BURST PARTICLE EFFECT
// ==========================================
class ConfettiCannon {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 70) {
    this.resize();
    const colors = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#38bdf8", "#f59e0b"];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: this.canvas.height / 2 + (Math.random() - 0.5) * 100,
        w: Math.random() * 10 + 6,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 1.2) * 14,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        opacity: 1
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rot += p.rotSpeed;
      p.opacity -= 0.009;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rot * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      this.ctx.restore();

      if (p.opacity <= 0 || p.y > this.canvas.height) {
        this.particles.splice(idx, 1);
      }
    });

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ==========================================
// 8. MAIN UI ORCHESTRATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const store = new Store();
  const audio = new AudioSynth();
  const confetti = new ConfettiCannon(document.getElementById("confettiCanvas"));

  // Apply Theme
  document.documentElement.setAttribute("data-theme", store.settings.theme);

  // Quick stats updater
  function renderStats() {
    document.getElementById("statStreak").textContent = `${store.stats.streak || 1} Day${store.stats.streak === 1 ? "" : "s"}`;
    document.getElementById("statFocusTime").textContent = `${store.stats.focusMinutes || 0}m`;
    document.getElementById("statCardsReviewed").textContent = store.stats.cardsReviewed || 0;
  }
  renderStats();

  // Toast Helper
  function showToast(msg, icon = "✨") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // --- NAVIGATION TAB SWITCHING ---
  const navTabs = document.querySelectorAll(".nav-tab");
  const tabPanels = document.querySelectorAll(".tab-panel");

  function switchTab(tabId) {
    navTabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabId));
    tabPanels.forEach(p => {
      const isTarget = p.id === `tab-${tabId}`;
      p.classList.toggle("active", isTarget);
      if (isTarget) {
        if (tabId === "flashcards") renderFlashcards();
        if (tabId === "quiz") setupQuizView();
        if (tabId === "manage") renderManageDecks();
      }
    });
  }

  navTabs.forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // --- POMODORO CONTROLLER SETUP ---
  const timerTime = document.getElementById("timerTime");
  const timerModeTag = document.getElementById("timerModeTag");
  const timerCircleProgress = document.getElementById("timerProgressCircle");
  const pomoToggleBtn = document.getElementById("pomoToggleBtn");
  const playIcon = pomoToggleBtn.querySelector(".play-icon");
  const pauseIcon = pomoToggleBtn.querySelector(".pause-icon");
  const pomoResetBtn = document.getElementById("pomoResetBtn");
  const pomoSkipBtn = document.getElementById("pomoSkipBtn");
  const cycleDotsContainer = document.getElementById("cycleDots");
  const pomoModeBtns = document.querySelectorAll(".pomo-mode-btn");
  const adjustChips = document.querySelectorAll(".adjust-chip");
  const pomoTaskInput = document.getElementById("pomoTaskInput");

  // Load saved task if any
  const savedTask = localStorage.getItem("studybuddy_current_task");
  if (savedTask) pomoTaskInput.value = savedTask;
  pomoTaskInput.addEventListener("input", (e) => {
    localStorage.setItem("studybuddy_current_task", e.target.value);
  });

  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 140; // r=140 => 879.64
  timerCircleProgress.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE}`;

  const pomo = new Pomodoro(
    store,
    audio,
    (state) => {
      // Tick handler
      timerTime.textContent = state.formattedTime;
      document.title = `${state.formattedTime} - ${state.mode === "focus" ? "🎯 Focus" : "☕ Break"} | StudyBuddy`;

      // Update circular SVG stroke offset
      const offset = CIRCLE_CIRCUMFERENCE * (1 - state.progressRatio);
      timerCircleProgress.style.strokeDashoffset = `${offset}`;

      // Mode tag
      if (state.mode === "focus") {
        timerModeTag.textContent = "FOCUS SESSION";
      } else if (state.mode === "shortBreak") {
        timerModeTag.textContent = "SHORT BREAK";
      } else {
        timerModeTag.textContent = "LONG RECOVERY BREAK";
      }

      // Play/Pause icon
      playIcon.classList.toggle("hidden", state.isRunning);
      pauseIcon.classList.toggle("hidden", !state.isRunning);

      // Cycle dots
      renderCycleDots(state.cycleCount, state.totalCycles);
    },
    (completedMode) => {
      // On Complete
      renderStats();
      if (completedMode === "focus") {
        showToast("Great focus! Time for a well-earned break.", "🎉");
      } else {
        showToast("Break over! Ready to lock back in?", "⚡");
      }
    }
  );

  function renderCycleDots(current, total) {
    cycleDotsContainer.innerHTML = "";
    for (let i = 1; i <= total; i++) {
      const dot = document.createElement("span");
      dot.className = `cycle-dot ${i <= current ? "active" : ""}`;
      cycleDotsContainer.appendChild(dot);
    }
  }

  pomoToggleBtn.addEventListener("click", () => pomo.toggle());
  pomoResetBtn.addEventListener("click", () => pomo.reset());
  pomoSkipBtn.addEventListener("click", () => pomo.skip());

  pomoModeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      pomoModeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      pomo.setMode(btn.dataset.mode);
    });
  });

  adjustChips.forEach(chip => {
    chip.addEventListener("click", () => {
      adjustChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const mins = parseInt(chip.dataset.min);
      pomo.setMode("focus", mins);
    });
  });

  // --- AMBIENT SOUND GENERATOR TOGGLE ---
  const ambientBtn = document.getElementById("ambientSoundBtn");
  const soundOffIcon = ambientBtn.querySelector(".sound-off-icon");
  const soundOnIcon = ambientBtn.querySelector(".sound-on-icon");

  ambientBtn.addEventListener("click", () => {
    const isPlaying = audio.isAmbientPlaying;
    const nowPlaying = audio.toggleAmbient(!isPlaying);
    ambientBtn.classList.toggle("active", nowPlaying);
    soundOffIcon.classList.toggle("hidden", nowPlaying);
    soundOnIcon.classList.toggle("hidden", !nowPlaying);
    showToast(nowPlaying ? "Lo-Fi ambient noise active" : "Ambient sound paused", "🎧");
  });

  // --- FLASHCARDS CONTROLLER SETUP ---
  const activeFlashcard = document.getElementById("activeFlashcard");
  const cardFrontText = document.getElementById("cardFrontText");
  const cardBackText = document.getElementById("cardBackText");
  const cardCategory = document.getElementById("cardCategory");
  const cardCounterText = document.getElementById("cardCounterText");
  const deckMasteryText = document.getElementById("deckMasteryText");
  const studyProgressBarFill = document.getElementById("studyProgressBarFill");
  const deckSelect = document.getElementById("deckSelect");
  const flipCardBtn = document.getElementById("flipCardBtn");
  const prevCardBtn = document.getElementById("prevCardBtn");
  const nextCardBtn = document.getElementById("nextCardBtn");
  const shuffleDeckBtn = document.getElementById("shuffleDeckBtn");
  const cardRatingBar = document.getElementById("cardRatingBar");

  const flashcardCtrl = new FlashcardController(store, audio, renderFlashcards);

  function populateDeckDropdowns() {
    deckSelect.innerHTML = "";
    const quizDeckSelect = document.getElementById("quizDeckSelect");
    const cardDeckSelect = document.getElementById("cardDeckSelect");

    quizDeckSelect.innerHTML = '<option value="all">🌟 All Decks Combined</option>';
    cardDeckSelect.innerHTML = "";

    store.decks.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = `${d.emoji} ${d.title} (${d.cards.length})`;
      if (d.id === store.activeDeckId) opt.selected = true;
      deckSelect.appendChild(opt);

      const qOpt = document.createElement("option");
      qOpt.value = d.id;
      qOpt.textContent = `${d.emoji} ${d.title} (${d.cards.length} cards)`;
      quizDeckSelect.appendChild(qOpt);

      const cOpt = document.createElement("option");
      cOpt.value = d.id;
      cOpt.textContent = `${d.emoji} ${d.title}`;
      if (d.id === store.activeDeckId) cOpt.selected = true;
      cardDeckSelect.appendChild(cOpt);
    });
  }

  function renderFlashcards() {
    populateDeckDropdowns();
    const deck = flashcardCtrl.getActiveDeck();
    if (!deck || deck.cards.length === 0) {
      cardFrontText.textContent = "No cards in this deck yet. Click 'Add Card' above to get started!";
      cardBackText.textContent = "No cards to show.";
      cardCategory.textContent = "Empty";
      cardCounterText.textContent = "0 of 0";
      deckMasteryText.textContent = "Mastery: 0%";
      studyProgressBarFill.style.width = "0%";
      activeFlashcard.classList.remove("is-flipped");
      return;
    }

    const card = flashcardCtrl.getCurrentCard();
    cardFrontText.textContent = card.front;
    cardBackText.textContent = card.back;
    cardCategory.textContent = card.category || deck.title;

    activeFlashcard.classList.toggle("is-flipped", flashcardCtrl.isFlipped);

    // Progress & Mastery
    const currentIdx = flashcardCtrl.currentIndex + 1;
    cardCounterText.textContent = `Card ${currentIdx} of ${deck.cards.length}`;
    studyProgressBarFill.style.width = `${(currentIdx / deck.cards.length) * 100}%`;

    const totalMasteryPossible = deck.cards.length * 5;
    const currentMasteryTotal = deck.cards.reduce((sum, c) => sum + (c.mastery || 0), 0);
    const masteryPercent = totalMasteryPossible > 0 ? Math.round((currentMasteryTotal / totalMasteryPossible) * 100) : 0;
    deckMasteryText.textContent = `Mastery: ${masteryPercent}%`;
  }

  deckSelect.addEventListener("change", (e) => {
    flashcardCtrl.setDeck(e.target.value);
  });

  activeFlashcard.addEventListener("click", () => flashcardCtrl.flip());
  flipCardBtn.addEventListener("click", () => flashcardCtrl.flip());
  prevCardBtn.addEventListener("click", () => flashcardCtrl.prev());
  nextCardBtn.addEventListener("click", () => flashcardCtrl.next());
  shuffleDeckBtn.addEventListener("click", () => {
    flashcardCtrl.shuffle();
    showToast("Deck shuffled!", "🔀");
  });

  // Rating buttons (spaced repetition feedback)
  cardRatingBar.querySelectorAll(".rating-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const rating = parseInt(btn.dataset.rating);
      flashcardCtrl.rateCard(rating);
      renderStats();
    });
  });

  // Keyboard Shortcuts: Spacebar to flip, Arrow keys to navigate, 1-4 to rate
  window.addEventListener("keydown", (e) => {
    // If typing in input or modal is open, ignore
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
    if (!document.getElementById("cardModal").classList.contains("hidden")) return;
    if (!document.getElementById("deckModal").classList.contains("hidden")) return;
    if (!document.getElementById("settingsModal").classList.contains("hidden")) return;

    const activeTab = document.querySelector(".tab-panel.active")?.id;

    if (activeTab === "tab-pomodoro") {
      if (e.code === "Space") {
        e.preventDefault();
        pomo.toggle();
      } else if (e.code === "KeyR") {
        pomo.reset();
      } else if (e.code === "KeyS") {
        pomo.skip();
      }
    } else if (activeTab === "tab-flashcards") {
      if (e.code === "Space") {
        e.preventDefault();
        flashcardCtrl.flip();
      } else if (e.code === "ArrowRight") {
        flashcardCtrl.next();
      } else if (e.code === "ArrowLeft") {
        flashcardCtrl.prev();
      } else if (["Digit1", "Digit2", "Digit3", "Digit4"].includes(e.code)) {
        const rating = parseInt(e.code.replace("Digit", ""));
        flashcardCtrl.rateCard(rating);
      }
    }
  });

  // --- QUIZ MODE CONTROLLER SETUP ---
  const quizSetupView = document.getElementById("quizSetupView");
  const quizActiveView = document.getElementById("quizActiveView");
  const quizResultsView = document.getElementById("quizResultsView");

  const startQuizBtn = document.getElementById("startQuizBtn");
  const quizQuestionNum = document.getElementById("quizQuestionNum");
  const quizTotalQuestions = document.getElementById("quizTotalQuestions");
  const quizLiveScore = document.getElementById("quizLiveScore");
  const quizTimerPill = document.getElementById("quizTimerPill");
  const quizTimerSeconds = document.getElementById("quizTimerSeconds");
  const quizProgressBarFill = document.getElementById("quizProgressBarFill");
  const quizQuestionDeckTag = document.getElementById("quizQuestionDeckTag");
  const quizQuestionPrompt = document.getElementById("quizQuestionPrompt");
  const quizOptionsContainer = document.getElementById("quizOptionsContainer");
  const quizFlashContainer = document.getElementById("quizFlashContainer");
  const flashRecallAnswerText = document.getElementById("flashRecallAnswerText");
  const flashRecallRevealBtn = document.getElementById("flashRecallRevealBtn");
  const flashRecallGradeButtons = document.getElementById("flashRecallGradeButtons");
  const quizFeedbackBox = document.getElementById("quizFeedbackBox");
  const feedbackStatus = document.getElementById("feedbackStatus");
  const feedbackExplanation = document.getElementById("feedbackExplanation");
  const quizNextQuestionBtn = document.getElementById("quizNextQuestionBtn");
  const retakeQuizBtn = document.getElementById("retakeQuizBtn");
  const studyMissedCardsBtn = document.getElementById("studyMissedCardsBtn");

  const quizCtrl = new QuizController(store, audio, (event, data) => {
    if (event === "question") {
      renderQuizQuestion(data);
    } else if (event === "timer") {
      quizTimerSeconds.textContent = `${data.seconds}s`;
    } else if (event === "feedback") {
      renderQuizFeedback(data);
    } else if (event === "results") {
      renderQuizResults(data);
    }
  });

  function setupQuizView() {
    quizSetupView.classList.remove("hidden");
    quizActiveView.classList.add("hidden");
    quizResultsView.classList.add("hidden");
    populateDeckDropdowns();
  }

  startQuizBtn.addEventListener("click", () => {
    const deckId = document.getElementById("quizDeckSelect").value;
    const countSetting = document.getElementById("quizCountSelect").value;
    const mode = document.getElementById("quizModeSelect").value;
    const timeLimit = document.getElementById("quizTimerToggle").value;

    const res = quizCtrl.startQuiz(deckId, countSetting, mode, timeLimit);
    if (!res.success) {
      showToast(res.message, "⚠️");
      return;
    }

    quizSetupView.classList.add("hidden");
    quizActiveView.classList.remove("hidden");
    quizResultsView.classList.add("hidden");
  });

  function renderQuizQuestion(data) {
    quizFeedbackBox.classList.add("hidden");
    quizQuestionNum.textContent = `Question ${data.index + 1}`;
    quizTotalQuestions.textContent = data.total;
    quizLiveScore.textContent = data.score;
    quizProgressBarFill.style.width = `${((data.index + 1) / data.total) * 100}%`;

    quizQuestionDeckTag.textContent = data.current.deckTitle;
    quizQuestionPrompt.textContent = data.current.question;

    if (data.timerSeconds) {
      quizTimerPill.classList.remove("hidden");
      quizTimerSeconds.textContent = `${data.timerSeconds}s`;
    } else {
      quizTimerPill.classList.add("hidden");
    }

    if (data.mode === "multipleChoice") {
      quizOptionsContainer.classList.remove("hidden");
      quizFlashContainer.classList.add("hidden");
      quizOptionsContainer.innerHTML = "";

      const alphabet = ["A", "B", "C", "D"];
      data.current.options.forEach((optText, i) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.innerHTML = `<span class="opt-badge">${alphabet[i]}</span><span class="opt-text">${optText}</span>`;
        btn.addEventListener("click", () => {
          quizCtrl.submitAnswer(optText);
        });
        quizOptionsContainer.appendChild(btn);
      });
    } else {
      // Rapid Flash Recall
      quizOptionsContainer.classList.add("hidden");
      quizFlashContainer.classList.remove("hidden");
      flashRecallAnswerText.textContent = "Click 'Reveal Answer' to check your knowledge.";
      flashRecallAnswerText.style.filter = "blur(5px)";
      flashRecallRevealBtn.classList.remove("hidden");
      flashRecallGradeButtons.classList.add("hidden");
    }
  }

  flashRecallRevealBtn.addEventListener("click", () => {
    const currentQ = quizCtrl.questions[quizCtrl.currentIndex];
    flashRecallAnswerText.textContent = currentQ.correctAnswer;
    flashRecallAnswerText.style.filter = "none";
    flashRecallRevealBtn.classList.add("hidden");
    flashRecallGradeButtons.classList.remove("hidden");
  });

  flashRecallGradeButtons.querySelectorAll(".recall-grade-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const isCorrect = btn.dataset.grade === "correct";
      quizCtrl.gradeFlashRecall(isCorrect);
    });
  });

  function renderQuizFeedback(data) {
    quizLiveScore.textContent = data.score;
    quizFeedbackBox.classList.remove("hidden");

    if (quizCtrl.mode === "multipleChoice") {
      const buttons = quizOptionsContainer.querySelectorAll(".quiz-option-btn");
      buttons.forEach(btn => {
        btn.disabled = true;
        const text = btn.querySelector(".opt-text").textContent;
        if (text === data.correctAnswer) {
          btn.classList.add("correct");
        } else if (text === data.selectedAnswer) {
          btn.classList.add("wrong");
        }
      });
    }

    feedbackStatus.className = `feedback-status ${data.isCorrect ? "correct" : "wrong"}`;
    if (data.isCorrect) {
      feedbackStatus.textContent = "✅ Correct! Excellent recall.";
    } else {
      feedbackStatus.textContent = data.isTimeout ? "⏳ Time expired!" : "❌ Not quite right.";
    }
    feedbackExplanation.textContent = `Correct Answer: ${data.correctAnswer}`;
  }

  quizNextQuestionBtn.addEventListener("click", () => {
    quizCtrl.currentIndex++;
    quizCtrl.nextQuestion();
  });

  function renderQuizResults(data) {
    quizActiveView.classList.add("hidden");
    quizResultsView.classList.remove("hidden");

    document.getElementById("resultsScoreNumber").textContent = `${data.percentage}%`;
    document.getElementById("resultsFraction").textContent = `${data.score} / ${data.total} Correct`;

    const badgeIcon = document.getElementById("resultsBadgeIcon");
    const resultsTitle = document.getElementById("resultsTitle");
    const resultsSubtitle = document.getElementById("resultsSubtitle");

    if (data.percentage >= 80) {
      badgeIcon.textContent = "🏆";
      resultsTitle.textContent = "Outstanding Mastery!";
      resultsSubtitle.textContent = "Your active recall is razor sharp. Keep up the high retention momentum!";
      confetti.burst(80);
    } else if (data.percentage >= 50) {
      badgeIcon.textContent = "🌟";
      resultsTitle.textContent = "Good Progress!";
      resultsSubtitle.textContent = "You have solid retention, with just a few cards to review.";
      confetti.burst(40);
    } else {
      badgeIcon.textContent = "🌱";
      resultsTitle.textContent = "Room for Growth!";
      resultsSubtitle.textContent = "Repetition is the mother of learning. Review the missed cards below.";
    }

    // Breakdown list
    const reviewList = document.getElementById("quizReviewList");
    reviewList.innerHTML = "";
    data.history.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = `review-item ${item.isCorrect ? "correct" : "wrong"}`;
      row.innerHTML = `
        <div class="review-q">${idx + 1}. ${item.question}</div>
        <div class="review-a"><strong>Answer:</strong> ${item.correctAnswer}</div>
      `;
      reviewList.appendChild(row);
    });
  }

  retakeQuizBtn.addEventListener("click", () => {
    setupQuizView();
  });

  studyMissedCardsBtn.addEventListener("click", () => {
    switchTab("flashcards");
  });

  // --- MANAGE DECKS & FLASHCARD LIBRARY SETUP ---
  const decksGrid = document.getElementById("decksGrid");
  const currentManagingDeckTitle = document.getElementById("currentManagingDeckTitle");
  const currentManagingDeckCount = document.getElementById("currentManagingDeckCount");
  const cardsTableBody = document.getElementById("cardsTableBody");
  const createNewDeckBtn = document.getElementById("createNewDeckBtn");
  const addNewCardToDeckBtn = document.getElementById("addNewCardToDeckBtn");
  const quickAddCardBtn = document.getElementById("quickAddCardBtn");

  let managingDeckId = store.activeDeckId;

  function renderManageDecks() {
    decksGrid.innerHTML = "";
    store.decks.forEach(deck => {
      const card = document.createElement("div");
      card.className = `deck-item-card ${deck.id === managingDeckId ? "selected" : ""}`;
      card.innerHTML = `
        <div class="deck-card-top">
          <span class="deck-card-emoji">${deck.emoji}</span>
          <span class="deck-card-count">${deck.cards.length} cards</span>
        </div>
        <h4 class="deck-card-title">${deck.title}</h4>
        <p class="deck-card-desc">${deck.description}</p>
      `;
      card.addEventListener("click", () => {
        managingDeckId = deck.id;
        store.activeDeckId = deck.id;
        renderManageDecks();
      });
      decksGrid.appendChild(card);
    });

    const activeDeck = store.decks.find(d => d.id === managingDeckId) || store.decks[0];
    if (!activeDeck) return;

    currentManagingDeckTitle.textContent = `${activeDeck.emoji} ${activeDeck.title}`;
    currentManagingDeckCount.textContent = `${activeDeck.cards.length} Cards`;

    cardsTableBody.innerHTML = "";
    if (activeDeck.cards.length === 0) {
      cardsTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 24px;">No cards in this deck yet. Click "+ Add Flashcard" above!</td></tr>`;
      return;
    }

    activeDeck.cards.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHtml(c.front)}</strong></td>
        <td>${escapeHtml(c.back)}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="action-icon-btn edit-btn" title="Edit Card">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-icon-btn delete delete-btn" title="Delete Card">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </td>
      `;

      tr.querySelector(".edit-btn").addEventListener("click", () => openCardModal(c, activeDeck.id));
      tr.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this flashcard?")) {
          store.deleteCard(activeDeck.id, c.id);
          renderManageDecks();
          showToast("Card deleted", "🗑️");
        }
      });

      cardsTableBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // --- CARD MODAL (ADD / EDIT) ---
  const cardModal = document.getElementById("cardModal");
  const cardForm = document.getElementById("cardForm");
  const cardModalTitle = document.getElementById("cardModalTitle");
  const editCardId = document.getElementById("editCardId");
  const cardDeckSelect = document.getElementById("cardDeckSelect");
  const cardFrontInput = document.getElementById("cardFrontInput");
  const cardBackInput = document.getElementById("cardBackInput");
  const closeCardModalBtn = document.getElementById("closeCardModalBtn");
  const cancelCardModalBtn = document.getElementById("cancelCardModalBtn");

  function openCardModal(card = null, defaultDeckId = null) {
    populateDeckDropdowns();
    if (defaultDeckId) cardDeckSelect.value = defaultDeckId;

    if (card) {
      cardModalTitle.textContent = "Edit Flashcard";
      editCardId.value = card.id;
      cardFrontInput.value = card.front;
      cardBackInput.value = card.back;
    } else {
      cardModalTitle.textContent = "Add New Flashcard";
      editCardId.value = "";
      cardFrontInput.value = "";
      cardBackInput.value = "";
    }
    cardModal.classList.remove("hidden");
    cardFrontInput.focus();
  }

  function closeCardModal() {
    cardModal.classList.add("hidden");
  }

  addNewCardToDeckBtn.addEventListener("click", () => openCardModal(null, managingDeckId));
  quickAddCardBtn.addEventListener("click", () => openCardModal(null, store.activeDeckId));
  closeCardModalBtn.addEventListener("click", closeCardModal);
  cancelCardModalBtn.addEventListener("click", closeCardModal);

  cardForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const deckId = cardDeckSelect.value;
    const front = cardFrontInput.value;
    const back = cardBackInput.value;
    const existingId = editCardId.value;

    if (existingId) {
      store.updateCard(deckId, existingId, front, back);
      showToast("Card updated!", "💾");
    } else {
      store.addCard(deckId, front, back);
      showToast("New card added!", "✨");
    }

    closeCardModal();
    renderManageDecks();
    renderFlashcards();
  });

  // --- DECK MODAL (CREATE NEW DECK) ---
  const deckModal = document.getElementById("deckModal");
  const deckForm = document.getElementById("deckForm");
  const deckNameInput = document.getElementById("deckNameInput");
  const deckIconInput = document.getElementById("deckIconInput");
  const deckDescInput = document.getElementById("deckDescInput");
  const closeDeckModalBtn = document.getElementById("closeDeckModalBtn");
  const cancelDeckModalBtn = document.getElementById("cancelDeckModalBtn");

  function openDeckModal() {
    deckNameInput.value = "";
    deckIconInput.value = "📚";
    deckDescInput.value = "";
    deckModal.classList.remove("hidden");
    deckNameInput.focus();
  }

  function closeDeckModal() {
    deckModal.classList.add("hidden");
  }

  createNewDeckBtn.addEventListener("click", openDeckModal);
  closeDeckModalBtn.addEventListener("click", closeDeckModal);
  cancelDeckModalBtn.addEventListener("click", closeDeckModal);

  deckForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newDeck = store.addDeck(deckNameInput.value, deckIconInput.value, deckDescInput.value);
    managingDeckId = newDeck.id;
    store.activeDeckId = newDeck.id;
    closeDeckModal();
    renderManageDecks();
    populateDeckDropdowns();
    showToast(`Deck "${newDeck.title}" created!`, "🎉");
  });

  // --- SETTINGS MODAL SETUP ---
  const settingsModal = document.getElementById("settingsModal");
  const openSettingsBtn = document.getElementById("openSettingsBtn");
  const closeSettingsModalBtn = document.getElementById("closeSettingsModalBtn");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");

  const settingFocusTime = document.getElementById("settingFocusTime");
  const settingShortBreak = document.getElementById("settingShortBreak");
  const settingLongBreak = document.getElementById("settingLongBreak");
  const settingCycles = document.getElementById("settingCycles");
  const settingSoundToggle = document.getElementById("settingSoundToggle");
  const settingAutoBreak = document.getElementById("settingAutoBreak");
  const themeCards = document.querySelectorAll(".theme-card");

  let selectedTheme = store.settings.theme;

  function openSettingsModal() {
    settingFocusTime.value = store.settings.focusTime;
    settingShortBreak.value = store.settings.shortBreak;
    settingLongBreak.value = store.settings.longBreak;
    settingCycles.value = store.settings.cycles;
    settingSoundToggle.checked = store.settings.soundEnabled;
    settingAutoBreak.checked = store.settings.autoBreak;

    themeCards.forEach(c => {
      c.classList.toggle("active", c.dataset.themeVal === store.settings.theme);
    });

    settingsModal.classList.remove("hidden");
  }

  function closeSettingsModal() {
    settingsModal.classList.add("hidden");
  }

  openSettingsBtn.addEventListener("click", openSettingsModal);
  closeSettingsModalBtn.addEventListener("click", closeSettingsModal);

  themeCards.forEach(card => {
    card.addEventListener("click", () => {
      themeCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedTheme = card.dataset.themeVal;
      document.documentElement.setAttribute("data-theme", selectedTheme);
    });
  });

  saveSettingsBtn.addEventListener("click", () => {
    store.settings.focusTime = Math.max(1, parseInt(settingFocusTime.value) || 25);
    store.settings.shortBreak = Math.max(1, parseInt(settingShortBreak.value) || 5);
    store.settings.longBreak = Math.max(1, parseInt(settingLongBreak.value) || 15);
    store.settings.cycles = Math.max(1, parseInt(settingCycles.value) || 4);
    store.settings.soundEnabled = settingSoundToggle.checked;
    store.settings.autoBreak = settingAutoBreak.checked;
    store.settings.theme = selectedTheme;

    store.saveSettings();
    pomo.setMode(pomo.mode);
    closeSettingsModal();
    showToast("Settings applied!", "⚙️");
  });

  // Export / Import / Reset
  const exportDataBtn = document.getElementById("exportDataBtn");
  const importDataBtn = document.getElementById("importDataBtn");
  const importFileInput = document.getElementById("importFileInput");
  const resetDataBtn = document.getElementById("resetDataBtn");

  exportDataBtn.addEventListener("click", () => {
    const backup = {
      decks: store.decks,
      settings: store.settings,
      stats: store.stats
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studybuddy_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported to JSON", "📥");
  });

  importDataBtn.addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.decks) store.decks = data.decks;
        if (data.settings) store.settings = data.settings;
        store.saveDecks();
        store.saveSettings();
        location.reload();
      } catch (err) {
        showToast("Invalid JSON file", "❌");
      }
    };
    reader.readAsText(file);
  });

  resetDataBtn.addEventListener("click", () => {
    if (confirm("Reset all decks, flashcards, and settings to factory defaults?")) {
      store.resetAllToDefault();
      location.reload();
    }
  });

  // Initial renders
  renderFlashcards();
});
