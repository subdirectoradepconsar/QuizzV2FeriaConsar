/**
 * CONSAR - Quizz Lucha Libre Financiera
 * Core Logic, Dual Sync Engine (Firebase Realtime Database Compat SDK + BroadcastChannel + LocalStorage),
 * Boxing Ring Bell Audio Player (Sonidocampanadebox.mp3), Confetti & State Management.
 */

const ROUND_GOALS = {
  1: 5, // Round 1: Meta 5 aciertos (de 8 preguntas)
  2: 6, // Round 2: Meta 6 aciertos (de 10 preguntas)
  3: 4  // Round 3: Meta 4 aciertos (de 6 preguntas)
};

const DEFAULT_STATE = {
  round_activo: 1,
  versionId: "version1",
  questionIndex: 0,
  isQuestionVisible: true,
  isAnswerRevealed: false,
  marcador_global: { equipoA: 0, equipoB: 0 }, // Rounds ganados
  aciertos_round: { equipoA: 0, equipoB: 0 },  // Aciertos parciales del round activo
  // Propiedades de retrocompatibilidad
  scores: { tecnica: 0, ruda: 0 },
  caidas: { tecnica: 0, ruda: 0 },
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
          if (event.data) {
            const incState = event.data.estado_trivia || event.data.state;
            if (incState) {
              this.updateStateLocal(incState, false, event.data.actionEvent);
            }
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
          const incState = parsed.estado_trivia || parsed.state;
          if (incState) {
            this.updateStateLocal(incState, false, parsed.actionEvent);
          }
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
        // Escucha principal en el nodo 'estado_trivia' de Firebase
        this.dbRef = this.firebaseDb.ref('estado_trivia');

        this.dbRef.on('value', (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Maneja la lectura directa de estado_trivia o wrappers
            const incomingState = data.estado_trivia || data.state || data;
            const actionEvt = data.accion || (data.actionEvent ? data.actionEvent.type : "ACTUALIZAR_MARCADOR");
            if (incomingState && incomingState.round_activo !== undefined) {
              this.updateStateLocal(incomingState, false, typeof actionEvt === 'object' ? actionEvt : { type: actionEvt, action: actionEvt });
            }
          }
        });

        console.log("🔥 Firebase Realtime Database Conectado en nodo 'estado_trivia'");
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
        const loaded = parsed.estado_trivia || parsed.state || parsed;
        return {
          ...DEFAULT_STATE,
          ...loaded,
          marcador_global: { ...DEFAULT_STATE.marcador_global, ...(loaded.marcador_global || {}) },
          aciertos_round: { ...DEFAULT_STATE.aciertos_round, ...(loaded.aciertos_round || {}) }
        };
      }
    } catch (e) {
      console.warn("Could not read state from localStorage:", e);
    }
    return { ...DEFAULT_STATE };
  }

  saveAndSyncState(actionEvent = null) {
    this.state.timestamp = Date.now();

    // Actualizar alias retrocompatibles (tecnica = equipoA, ruda = equipoB)
    this.state.caidas = {
      tecnica: this.state.marcador_global.equipoA || 0,
      ruda: this.state.marcador_global.equipoB || 0
    };
    this.state.scores = {
      tecnica: this.state.aciertos_round.equipoA || 0,
      ruda: this.state.aciertos_round.equipoB || 0
    };

    const actionStr = typeof actionEvent === 'string' 
      ? actionEvent 
      : (actionEvent?.action || actionEvent?.type || "ACTUALIZAR_MARCADOR");

    // Estructura exacta requerida para Firebase 'estado_trivia'
    const estadoTriviaData = {
      round_activo: this.state.round_activo || 1,
      marcador_global: {
        equipoA: this.state.marcador_global.equipoA || 0,
        equipoB: this.state.marcador_global.equipoB || 0
      },
      aciertos_round: {
        equipoA: this.state.aciertos_round.equipoA || 0,
        equipoB: this.state.aciertos_round.equipoB || 0
      },
      versionId: this.state.versionId || "version1",
      questionIndex: this.state.questionIndex || 0,
      isQuestionVisible: this.state.isQuestionVisible !== undefined ? this.state.isQuestionVisible : true,
      isAnswerRevealed: this.state.isAnswerRevealed !== undefined ? this.state.isAnswerRevealed : false,
      accion: actionStr,
      timestamp: this.state.timestamp
    };

    const syncData = {
      state: this.state,
      estado_trivia: estadoTriviaData,
      actionEvent: typeof actionEvent === 'string' ? { type: actionEvent, action: actionEvent } : actionEvent
    };

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

    // Sync via Firebase Realtime Database
    if (this.dbRef) {
      try {
        this.dbRef.set(estadoTriviaData);
      } catch (e) {
        console.error("Firebase Realtime Database write error:", e);
      }
    }

    this.notifyListeners(syncData.actionEvent);
  }

  updateStateLocal(newState, doSync = true, actionEvent = null) {
    if (newState.marcador_global) {
      this.state.marcador_global = { ...this.state.marcador_global, ...newState.marcador_global };
    }
    if (newState.aciertos_round) {
      this.state.aciertos_round = { ...this.state.aciertos_round, ...newState.aciertos_round };
    }

    // Adaptador para llaves legacy
    if (newState.scores && !newState.aciertos_round) {
      this.state.aciertos_round = { equipoA: newState.scores.tecnica || 0, equipoB: newState.scores.ruda || 0 };
    }
    if (newState.caidas && !newState.marcador_global) {
      this.state.marcador_global = { equipoA: newState.caidas.tecnica || 0, equipoB: newState.caidas.ruda || 0 };
    }

    this.state = { ...this.state, ...newState };

    if (!this.state.marcador_global) this.state.marcador_global = { equipoA: 0, equipoB: 0 };
    if (!this.state.aciertos_round) this.state.aciertos_round = { equipoA: 0, equipoB: 0 };

    if (this.state.round_activo) {
      this.state.versionId = `version${this.state.round_activo}`;
    } else if (this.state.versionId) {
      const match = this.state.versionId.match(/\d+/);
      if (match) this.state.round_activo = parseInt(match[0]);
    }

    this.state.caidas = {
      tecnica: this.state.marcador_global.equipoA || 0,
      ruda: this.state.marcador_global.equipoB || 0
    };
    this.state.scores = {
      tecnica: this.state.aciertos_round.equipoA || 0,
      ruda: this.state.aciertos_round.equipoB || 0
    };

    if (doSync) {
      this.saveAndSyncState(actionEvent);
    } else {
      this.notifyListeners(typeof actionEvent === 'string' ? { type: actionEvent, action: actionEvent } : actionEvent);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state, null);
  }

  notifyListeners(actionEvent) {
    this.listeners.forEach(cb => cb(this.state, actionEvent));
  }

  setRound(roundNum) {
    if (roundNum >= 1 && roundNum <= 3) {
      this.state.round_activo = roundNum;
      this.state.versionId = `version${roundNum}`;
      this.state.questionIndex = 0;
      this.state.isAnswerRevealed = false;
      this.state.isQuestionVisible = true;
      this.saveAndSyncState({ type: "SET_ROUND", action: "ACTUALIZAR_MARCADOR", round_activo: roundNum });
    }
  }

  setVersion(versionId) {
    const match = versionId.match(/\d+/);
    if (match) {
      this.setRound(parseInt(match[0]));
    } else {
      this.state.versionId = versionId;
      this.state.questionIndex = 0;
      this.state.isAnswerRevealed = false;
      this.state.isQuestionVisible = true;
      this.saveAndSyncState({ type: "SET_VERSION", action: "ACTUALIZAR_MARCADOR", versionId });
    }
  }

  setQuestionIndex(index) {
    const currentQuestions = TRIVIA_QUESTIONS[this.state.versionId].questions;
    if (index >= 0 && index < currentQuestions.length) {
      this.state.questionIndex = index;
      this.state.isAnswerRevealed = false;
      this.state.isQuestionVisible = true;
      this.saveAndSyncState({ type: "CHANGE_QUESTION", action: "ACTUALIZAR_MARCADOR", index });
    }
  }

  toggleQuestionVisible(visible = null) {
    this.state.isQuestionVisible = visible !== null ? visible : !this.state.isQuestionVisible;
    this.saveAndSyncState({ type: "TOGGLE_QUESTION", action: "ACTUALIZAR_MARCADOR", visible: this.state.isQuestionVisible });
  }

  toggleAnswerReveal(revealed = null) {
    this.state.isAnswerRevealed = revealed !== null ? revealed : !this.state.isAnswerRevealed;
    if (this.state.isAnswerRevealed) {
      this.playBellSound();
    }
    this.saveAndSyncState({ type: "TOGGLE_ANSWER", action: "ACTUALIZAR_MARCADOR", revealed: this.state.isAnswerRevealed });
  }

  addAcierto(team, amount = 1) {
    this.addPoint(team, amount);
  }

  addPoint(team, amount = 1) {
    const key = (team === 'tecnica' || team === 'equipoA') ? 'equipoA' : 'equipoB';
    const teamDisplayName = key === 'equipoA' ? 'Esquina Técnica' : 'Esquina Ruda';

    // 1. Incrementar los aciertos del round actual
    this.state.aciertos_round[key] = (this.state.aciertos_round[key] || 0) + amount;
    this.state.scores[key === 'equipoA' ? 'tecnica' : 'ruda'] = this.state.aciertos_round[key];

    const currentGoal = ROUND_GOALS[this.state.round_activo] || 5;

    // 2. Evaluación de Meta del Round
    if (this.state.aciertos_round[key] >= currentGoal) {
      // Se le otorga 1 Punto de Round automáticamente en el Marcador Global
      this.state.marcador_global[key] = (this.state.marcador_global[key] || 0) + 1;
      this.state.caidas[key === 'equipoA' ? 'tecnica' : 'ruda'] = this.state.marcador_global[key];

      // Condición de Victoria Global: Primer equipo en alcanzar 2 Rounds ganados
      if (this.state.marcador_global[key] >= 2) {
        this.playBellSound();
        this.triggerConfetti();

        const evt = {
          type: "VICTORIA_GLOBAL",
          action: "VICTORIA_GLOBAL",
          team: key,
          teamName: teamDisplayName,
          round: this.state.round_activo
        };
        this.saveAndSyncState(evt);
      } else {
        // Se activa el evento "ROUND GANADO" con el sonido de campana de boxeo
        this.playBellSound();
        this.triggerConfetti();

        const roundGanadoNum = this.state.round_activo;
        const siguienteRoundNum = Math.min(3, roundGanadoNum + 1);

        const evt = {
          type: "ROUND_GANADO",
          action: "ROUND_GANADO",
          team: key,
          teamName: teamDisplayName,
          roundGanado: roundGanadoNum,
          siguienteRound: siguienteRoundNum
        };

        // Avanza automáticamente al siguiente Round y reinicia contadores de aciertos parciales a 0
        this.state.round_activo = siguienteRoundNum;
        this.state.versionId = `version${siguienteRoundNum}`;
        this.state.questionIndex = 0;
        this.state.isAnswerRevealed = false;
        this.state.isQuestionVisible = true;
        this.state.aciertos_round = { equipoA: 0, equipoB: 0 };
        this.state.scores = { tecnica: 0, ruda: 0 };

        this.saveAndSyncState(evt);
      }
    } else {
      // Acierto individual en progreso
      this.playPointSound();
      const evt = {
        type: "ADD_POINT",
        action: "ACTUALIZAR_MARCADOR",
        team: key,
        teamName: teamDisplayName,
        amount
      };
      this.saveAndSyncState(evt);
    }
  }

  triggerIncorrect() {
    this.playBuzzerSound();
    this.saveAndSyncState({ type: "TRIGGER_INCORRECT", action: "ACTUALIZAR_MARCADOR" });
  }

  ringBell() {
    this.playBellSound();
    this.saveAndSyncState({ type: "RING_BELL", action: "ACTUALIZAR_MARCADOR" });
  }

  resetAll(pinCode) {
    if (pinCode !== "1234") return false;
    
    this.state.round_activo = 1;
    this.state.versionId = "version1";
    this.state.marcador_global = { equipoA: 0, equipoB: 0 };
    this.state.aciertos_round = { equipoA: 0, equipoB: 0 };
    this.state.scores = { tecnica: 0, ruda: 0 };
    this.state.caidas = { tecnica: 0, ruda: 0 };
    this.state.questionIndex = 0;
    this.state.isAnswerRevealed = false;
    this.state.isQuestionVisible = true;
    
    this.playBellSound();
    this.saveAndSyncState({ type: "RESET_ALL", action: "ACTUALIZAR_MARCADOR" });
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
          promise.catch((err) => {
            console.warn("Audio play error:", err);
          });
        }
        return;
      } catch (e) {
        console.warn("Audio play error:", e);
      }
    }
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
    this.playBellSound();
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
