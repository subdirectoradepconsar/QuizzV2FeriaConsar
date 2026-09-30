// Fases de la vista de moderación y sus recursos de presentación.
let arenaStage = 'questions';
const arenaStages = [
  ['wait', '🎬 Video de Espera'],
  ['presentation', '⚔️ Presentación'],
  ['questions', '❓ Mostrar preguntas']
];

function arenaChoose(stage) {
  arenaStage = stage;
  triviaApp.setScreenPhase(stage);
}

function arenaSelectTeam(team) { triviaApp.selectTeamTurn(team); }

let arenaSubmissionLocked = false;
function arenaSubmitAttempt(correct, selectedOption = null) {
  if (arenaSubmissionLocked) return;
  if (!currentState?.activeTeam) {
    document.getElementById('arenaTurnMessage').textContent = 'Primero toca el cuadro del equipo que responde.';
    return;
  }
  arenaSubmissionLocked = true;
  triviaApp.recordTurnAttempt(correct, selectedOption);
  setTimeout(() => { arenaSubmissionLocked = false; }, 500);
}

function arenaBack() { prevQuestion(); }
function arenaNext() { nextQuestion(); }

function arenaRenderDots(teamId, score, goal) {
  const dots = document.querySelector(`#${teamId} .arena-dots`);
  dots.replaceChildren();
  for (let i = 0; i < goal; i++) {
    const dot = document.createElement('span');
    dot.classList.toggle('filled', i < score);
    dots.appendChild(dot);
  }
}

function arenaRender() {
  const state = currentState;
  if (!state) return;
  arenaStage = state.screenPhase || 'questions';
  const round = state.round_activo || 1;
  const version = TRIVIA_QUESTIONS[state.versionId] || TRIVIA_QUESTIONS.version1;
  const total = version.questions.length;
  const index = Math.min(Math.max(state.questionIndex || 0, 0), total - 1);
  const question = version.questions[index];
  const blue = state.aciertos_round?.equipoA || 0;
  const pink = state.aciertos_round?.equipoB || 0;
  const goal = { 1: 1, 2: 5, 3: 4 }[round] || 1;
  const answersLocked = arenaStage !== 'questions' || state.juego_terminado;
  const resolved = state.resolvedQuestionKey === `${round}:${index}`;
  const canAnswer = !answersLocked && !resolved && !!state.activeTeam;
  document.getElementById('arenaRound').textContent = ['Primera ronda', 'Segunda ronda', 'Tercera ronda'][round - 1] || 'Ronda';
  document.getElementById('arenaQuestionCount').textContent = `Pregunta ${index + 1}/${total}`;
  document.getElementById('arenaNumber').textContent = `Pregunta ${index + 1} / ${total}`;
  document.getElementById('arenaScore').textContent = `💗 ${pink} · ${blue} 🔵`;
  document.getElementById('arenaPinkScore').firstChild.textContent = pink;
  document.getElementById('arenaBlueScore').firstChild.textContent = blue;
  document.getElementById('arenaPink').classList.toggle('active-turn', state.activeTeam === 'equipoB');
  document.getElementById('arenaBlue').classList.toggle('active-turn', state.activeTeam === 'equipoA');
  document.getElementById('arenaPink').disabled = answersLocked || resolved || !!state.activeTeam;
  document.getElementById('arenaBlue').disabled = answersLocked || resolved || !!state.activeTeam;
  const activeName = state.activeTeam === 'equipoA' ? 'Los Hermanos Dinamita del Retiro' : state.activeTeam === 'equipoB' ? 'Las Indestructibles Leyendas del Ahorro' : null;
  let turnMessage;
  if (answersLocked) turnMessage = 'Activa “3. Mostrar preguntas” para responder.';
  else if (resolved && state.isAnswerRevealed && state.pendingRoundResolution?.round === 3) turnMessage = 'Respuesta correcta revelada. Pulsa “Ver ganador” cuando estés listo.';
  else if (resolved && state.isAnswerRevealed && round === 3) turnMessage = `Respuesta correcta revelada. ${activeName} sigue al pulsar “Siguiente pregunta”.`;
  else if (resolved && state.isAnswerRevealed) turnMessage = 'Respuesta correcta revelada. Pulsa “Siguiente pregunta” cuando estés listo.';
  else if (resolved) turnMessage = round === 1 ? 'Ambos fallaron. Pulsa “Siguiente pregunta” cuando estés listo.' : 'Respuesta incorrecta. Pulsa “Siguiente pregunta”; el otro equipo sigue.';
  else turnMessage = activeName ? `Turno de ${activeName}` : `Elige quién comienza el bloque ${round}.`;
  document.getElementById('arenaTurnMessage').textContent = turnMessage;
  document.getElementById('arenaStageTag').textContent = ({wait:'VIDEO DE ESPERA',presentation:'PRESENTACIÓN',questions:'PREGUNTAS'})[arenaStage] || 'PREGUNTAS';
  arenaRenderDots('arenaPink', pink, goal);
  arenaRenderDots('arenaBlue', blue, goal);
  const phaseList = document.getElementById('arenaPhases');
  phaseList.replaceChildren();
  arenaStages.forEach(([key, label], i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `arena-phase${arenaStage === key ? ' active' : ''}`;
    button.textContent = `${i + 1}. ${label}`;
    button.onclick = () => arenaChoose(key);
    phaseList.appendChild(button);
  });
  const content = document.getElementById('arenaStageContent');
  content.replaceChildren();
    const roundSelect = document.getElementById('arenaRoundSelect');
    roundSelect.replaceChildren();
    [1, 2, 3].forEach(n => {
      const button = document.createElement('button');
      button.textContent = `Bloque ${n}`;
      button.className = n === round ? 'active' : '';
      button.onclick = () => triviaApp.setRound(n);
      roundSelect.appendChild(button);
    });
    const title = document.createElement('h2');
    title.className = 'arena-question';
    title.textContent = question.question;
    content.appendChild(title);
    if (version.mode === 'open') {
      const reference = document.createElement('div');
      reference.className = 'arena-answer arena-open-reference';
      reference.textContent = `Respuesta de referencia: ${question.answer}`;
      content.appendChild(reference);
      const validation = document.createElement('div');
      validation.className = 'arena-open-validation';
      const correct = document.createElement('button');
      correct.type = 'button';
      correct.className = 'arena-open-correct';
      correct.disabled = !canAnswer;
      correct.textContent = '✓ Validar punto';
      correct.onclick = () => arenaSubmitAttempt(true);
      validation.appendChild(correct);
      const wrong = document.createElement('button');
      wrong.type = 'button';
      wrong.className = 'arena-open-wrong';
      wrong.disabled = !canAnswer;
      wrong.textContent = round === 1 ? '✕ Respuesta incorrecta · pasar turno' : '✕ Incorrecta · siguiente pregunta';
      wrong.onclick = () => arenaSubmitAttempt(false);
      validation.appendChild(wrong);
      content.appendChild(validation);
    } else {
      question.options.forEach((option, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'arena-option';
        button.classList.toggle('revealed-correct', state.isAnswerRevealed && i === question.correct);
        button.disabled = !canAnswer;
        const letter = document.createElement('span');
        letter.className = 'arena-letter';
        letter.textContent = 'ABCD'[i];
        button.append(letter, document.createTextNode(option.replace(/^[a-d]\)\s*/i, '')));
        if (state.isAnswerRevealed && i === question.correct) {
          const correctLabel = document.createElement('strong');
          correctLabel.textContent = '✓ Correcta';
          button.appendChild(correctLabel);
        }
        button.onclick = () => arenaSubmitAttempt(i === question.correct, i);
        content.appendChild(button);
      });
    }
  document.getElementById('arenaBack').disabled = index === 0 || !!state.pendingRoundResolution;
  const nextButton = document.getElementById('arenaNext');
  nextButton.disabled = index >= total - 1 && !state.pendingRoundResolution && !(round === 1 && resolved);
  nextButton.textContent = state.pendingRoundResolution ?
    (round === 3 ? '➡ Ver ganador' : `➡ Iniciar bloque ${round + 1}`) :
    (round === 1 && index >= total - 1 && resolved ? '➡ Volver al primer reto' : '➡ Siguiente pregunta');
}

window.addEventListener('DOMContentLoaded', () => {
  triviaApp.subscribe(() => arenaRender());
});
