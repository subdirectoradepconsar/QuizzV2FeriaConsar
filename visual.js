// Componente visual compartido; no modifica preguntas ni puntuación.
function crearMascaraLuchador(color, activa, numero = null) {
  const paleta = color === 'blue' ? 'blue' : 'red';
  const estado = activa ? 'is-active' : 'is-lost';
  const numerada = numero === null ? '' : ' is-numbered';
  const placaNumero = numero === null ? '' : `<b class="mask-number">${numero}</b>`;

  return `
    <span class="lucha-mask ${paleta} ${estado}${numerada}" aria-hidden="true">
      <svg viewBox="0 0 64 72" focusable="false">
        <path class="mask-shell" d="M32 3C18.1 3 9 13.4 8.1 28.1L10.9 50c1.4 11 9.9 18.8 21.1 19 11.2-.2 19.7-8 21.1-19l2.8-21.9C55 13.4 45.9 3 32 3Z"/>
        <path class="mask-crown" d="m32 5 9.7 13.2-5.8 8.1-3.9-8.1-3.9 8.1-5.8-8.1L32 5Z"/>
        <path class="mask-wing" d="M11.3 27.8c5.4-7.2 11-9.8 17.1-7.7l-3.6 14.2-11.6 2.9-1.9-9.4Zm41.4 0c-5.4-7.2-11-9.8-17.1-7.7l3.6 14.2 11.6 2.9 1.9-9.4Z"/>
        <path class="mask-eye" d="M15.4 28.4c3.8-3.9 7.7-4.8 11.6-2.8l-2.4 5.8c-3.5 1.2-6.6.2-9.2-3Zm33.2 0c-3.8-3.9-7.7-4.8-11.6-2.8l2.4 5.8c3.5 1.2 6.6.2 9.2-3Z"/>
        <path class="mask-nose" d="m32 24 4.5 18-4.5 4.3-4.5-4.3L32 24Z"/>
        <path class="mask-jaw" d="M16.4 43.6 25.8 49l6.2-2.7 6.2 2.7 9.4-5.4-2.3 13.6L38 64.1l-6-3.5-6 3.5-7.3-6.9-2.3-13.6Z"/>
        <path class="mask-mouth" d="M24.6 52.2h14.8L37.2 59 32 61.7 26.8 59l-2.2-6.8Z"/>
        <path class="mask-stitch" d="M28 54.4v5m4-5v6.7m4-6.7v5"/>
        <path class="mask-shine" d="M16.2 20.5C19.7 12.8 25 9.2 32 9"/>
      </svg>
      ${placaNumero}
    </span>`;
}
