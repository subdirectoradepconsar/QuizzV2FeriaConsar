/**
 * CONSAR - Quizz Lucha Libre Financiera
 * Core Logic, Dual Sync Engine (Firebase Realtime Database Compat SDK + BroadcastChannel + LocalStorage),
 * Boxing Ring Bell Audio Player (Sonidocampanadebox.mp3), Confetti & State Management.
 */

const DEFAULT_STATE = {
  versionId: "version1",
  questionIndex: 0,
  isQuestionVisible: true,
  isAnswerRevealed: false,
  scores: { tecnica: 0, ruda: 0 },
  caidas: { tecnica: 0, ruda: 0 }, // Rounds ganados por equipo
  lastEvent: null,
  timestamp: Date.now()
};

// Credenciales Oficiales de Firebase Realtime Database
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDkKAiVlq_th7eXqb_5F6f25uFO4ZliYIk",
  authDomain: "quizz-consar.firebaseapp.com",
  databaseURL: "https://quizz-consar-default-rtdb.firebaseio.com",
  projectId: "quizz-consar",
  storageBucket: "quizz-consar.firebasestorage.app",
  messagingSenderId: "676594424004",
  appId: "1:676594424004:web:ce949462ddae2e80545191"
};

class TriviaApp {
  constructor() {
    this.channelName = "consar_lucha_trivia_sync";
    this.storageKey = "consar_lucha_state_v1";
    this.broadcast = null;
    this.audioCtx = null;
    this.bellAudio = null;

    // Firebase Realtime Database Reference
    this.firebaseDb = null;
    this.dbRef = null;

    this.state = this.loadState();
    this.listeners = [];

    this.initSync();
    this.initBoxingBellAudio();
  }

  initSync() {
    // 1. Local BroadcastChannel (Mismo navegador)
    if ('BroadcastChannel' in window) {
      try {
        this.broadcast = new BroadcastChannel(this.channelName);
        this.broadcast.onmessage = (event) => {
          if (event.data && event.data.state) {
            this.updateStateLocal(event.data.state, false, event.data.actionEvent);
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel error, falling back to LocalStorage:", e);
      }
    }

    // 2. LocalStorage Storage Listener (Mismo navegador/pestañas)
    window.addEventListener("storage", (e) => {
      if (e.key === this.storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          this.updateStateLocal(parsed.state, false, parsed.actionEvent);
        } catch (err) {
          console.error("Error parsing storage state:", err);
        }
      }
    });

    // 3. Firebase Realtime Database (Sincronización en Tiempo Real Multidispositivo Tablet <-> PC)
    this.initFirebaseRealtime();
  }

  initFirebaseRealtime() {
    if (window.firebase) {
      try {
        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.firebaseDb = window.firebase.database();
        this.dbRef = this.firebaseDb.ref('triviaState');

        // Escucha en vivo de cambios en la base de datos
        this.dbRef.on('value', (snapshot) => {
          const data = snapshot.val();
          if (data && data.state) {
            // Evita bucles infinitos aplicando cambios recibidos de forma local
            this.updateStateLocal(data.state, false, data.actionEvent);
          }
        });

        console.log("🔥 Firebase Realtime Database Conectado en nodo 'triviaState'");
      } catch (e) {
        console.warn("Firebase Realtime Database Error:", e);
      }
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed.state };
      }
    } catch (e) {
      console.warn("Could not read state from localStorage:", e);
    }
    return { ...DEFAULT_STATE };
  }

  saveAndSyncState(actionEvent = null) {
    this.state.timestamp = Date.now();
    const syncData = { state: this.state, actionEvent };

    // Save to LocalStorage
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(syncData));
    } catch (e) {
      console.error("LocalStorage write error:", e);
    }

    // Sync via BroadcastChannel
    if (this.broadcast) {
      try {
        this.broadcast.postMessage(syncData);
      } catch (e) {
        console.error("BroadcastChannel postMessage error:", e);
      }
    }

    // Sync via Firebase Realtime Database (Tablet <-> PC)
    if (this.dbRef) {
      try {
        this.dbRef.set({
          state: this.state,
          actionEvent: actionEvent,
          timestamp: Date.now()
        });
      } catch (e) {
        console.error("Firebase Realtime Database write error:", e);
      }
    }

    this.notifyListeners(actionEvent);
  }

  updateStateLocal(newState, doSync = true, actionEvent = null) {
    this.state = { ...this.state, ...newState };
    if (doSync) {
      this.saveAndSyncState(actionEvent);
    } else {
      this.notifyListeners(actionEvent);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state, null);
  }

  notifyListeners(actionEvent) {
    this.listeners.forEach(cb => cb(this.state, actionEvent));
  }

  setVersion(versionId) {
    this.state.versionId = versionId;
    this.state.questionIndex = 0;
    this.state.isAnswerRevealed = false;
    this.state.isQuestionVisible = true;
    this.saveAndSyncState({ type: "SET_VERSION", versionId });
  }

  setQuestionIndex(index) {
    const currentQuestions = TRIVIA_QUESTIONS[this.state.versionId].questions;
    if (index >= 0 && index < currentQuestions.length) {
      this.state.questionIndex = index;
      this.state.isAnswerRevealed = false;
      this.state.isQuestionVisible = true;
      this.saveAndSyncState({ type: "CHANGE_QUESTION", index });
    }
  }

  toggleQuestionVisible(visible = null) {
    this.state.isQuestionVisible = visible !== null ? visible : !this.state.isQuestionVisible;
    this.saveAndSyncState({ type: "TOGGLE_QUESTION", visible: this.state.isQuestionVisible });
  }

  toggleAnswerReveal(revealed = null) {
    this.state.isAnswerRevealed = revealed !== null ? revealed : !this.state.isAnswerRevealed;
    if (this.state.isAnswerRevealed) {
      this.playVictorySound();
    }
    this.saveAndSyncState({ type: "TOGGLE_ANSWER", revealed: this.state.isAnswerRevealed });
  }

  addPoint(team, amount = 1) {
    if (this.state.scores[team] !== undefined) {
      this.state.scores[team] += amount;
      
      // Cada 3 puntos son un round ganado
      if (this.state.scores[team] >= 3 && this.state.scores[team] % 3 === 0) {
        this.state.caidas[team] += 1;
      }

      this.playPointSound();
      this.saveAndSyncState({ type: "ADD_POINT", team, amount });
    }
  }

  triggerIncorrect() {
    this.playBuzzerSound();
    this.saveAndSyncState({ type: "TRIGGER_INCORRECT" });
  }

  ringBell() {
    this.playBellSound();
    this.saveAndSyncState({ type: "RING_BELL" });
  }

  resetAll(pinCode) {
    if (pinCode !== "1234") return false;
    
    this.state.scores = { tecnica: 0, ruda: 0 };
    this.state.caidas = { tecnica: 0, ruda: 0 };
    this.state.questionIndex = 0;
    this.state.isAnswerRevealed = false;
    this.state.isQuestionVisible = true;
    
    this.playBellSound();
    this.saveAndSyncState({ type: "RESET_ALL" });
    return true;
  }

  // --- AUDIO PRELOAD: Sonidocampanadebox.mp3 ---

  initBoxingBellAudio() {
    try {
      this.bellAudio = new Audio("Sonidocampanadebox.mp3");
      this.bellAudio.preload = "auto";
    } catch (e) {
      console.warn("Could not load Sonidocampanadebox.mp3:", e);
    }
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playBellSound() {
    this.initAudio();

    if (this.bellAudio) {
      try {
        this.bellAudio.currentTime = 0;
        const promise = this.bellAudio.play();
        if (promise !== undefined) {
          promise.catch(() => this.playSynthBellFallback());
        }
        return;
      } catch (e) {
        console.warn("Audio play error, using synth fallback:", e);
      }
    }

    this.playSynthBellFallback();
  }

  playSynthBellFallback() {
    if (!this.audioCtx) return;

    const playStrike = (timeOffset) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + timeOffset + 0.8);

      gain.gain.setValueAtTime(0.8, this.audioCtx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + timeOffset + 0.8);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + timeOffset);
      osc.stop(this.audioCtx.currentTime + timeOffset + 0.85);
    };

    playStrike(0);
    playStrike(0.25);
    playStrike(0.5);
  }

  playPointSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.4, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }

  playBuzzerSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  playVictorySound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const fanfare = [
      { f: 440.00, t: 0, d: 0.15 },
      { f: 554.37, t: 0.15, d: 0.15 },
      { f: 659.25, t: 0.30, d: 0.15 },
      { f: 880.00, t: 0.45, d: 0.60 }
    ];

    fanfare.forEach(item => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(item.f, now + item.t);

      gain.gain.setValueAtTime(0.3, now + item.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + item.t);
      osc.stop(now + item.t + item.d + 0.05);
    });
  }

  triggerConfetti(containerId = "confettiCanvas") {
    let canvas = document.getElementById(containerId);
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = containerId;
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "99999";
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#C5A059", "#691C32", "#0284C7", "#DC2626", "#F59E0B", "#FFFFFF"];
    const particles = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 20,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let startTime = performance.now();

    function render(nowTime) {
      const elapsed = nowTime - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.rotation += p.rSpeed;
        p.opacity = Math.max(0, 1 - elapsed / 2500);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (elapsed < 2500) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(render);
  }
}

window.triviaApp = new TriviaApp();
