// Sustituye Código.gs del Apps Script vinculado a Respuestas_Trivia_2026.
// Conserva el resumen de 55 columnas en "Hoja 1" y añade "Intentos".
const INTENTOS_HEADERS = [
  'ID intento', 'ID Partida', 'Fecha y Hora (UTC)', 'Ronda', 'Pregunta',
  'Número de intento', 'Equipo', 'Resultado', 'Opción', 'Punto', 'Turno siguiente'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var data = JSON.parse(e.postData.contents);
    var book = SpreadsheetApp.getActiveSpreadsheet();
    if (data.type === 'INTENTO') {
      registrarIntentos_(book, [data.attempt]);
    } else {
      registrarResumen_(book, data);
      registrarIntentos_(book, data.intentos || []);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function registrarResumen_(book, data) {
  var sheet = book.getSheetByName('Hoja 1');
  if (!sheet) throw new Error('No existe la hoja de resumen: Hoja 1');
  var answers = function(team, round, count) {
    var values = team && team.respuestas && team.respuestas[round];
    if (!Array.isArray(values)) return Array(count).fill('Sin responder');
    return values;
  };
  var blue = data.equipoAzul || {};
  var pink = data.equipoRojo || {};
  var row = [
    data.idPartida,
    new Date().toLocaleString('es-MX'),
    /leyendas|rojo|ruda/i.test(data.ganador || '') ? 'Leyendas' :
      /hermanos|azul|tecnica/i.test(data.ganador || '') ? 'Hermanos' : 'Sin definir',
    blue.nombre || 'Los Hermanos Dinamita del Retiro'
  ]
    .concat(answers(blue, 'ronda1', 8), answers(blue, 'ronda2', 10), answers(blue, 'ronda3', 6))
    .concat([blue.puntajeTotal || 0, pink.nombre || 'Las Indestructibles Leyendas del Ahorro'])
    .concat(answers(pink, 'ronda1', 8), answers(pink, 'ronda2', 10), answers(pink, 'ronda3', 6))
    .concat([pink.puntajeTotal || 0]);
  var last = sheet.getLastRow();
  var ids = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues().flat() : [];
  var index = ids.indexOf(data.idPartida);
  if (index >= 0) sheet.getRange(index + 2, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
}

function registrarIntentos_(book, attempts) {
  if (!Array.isArray(attempts) || !attempts.length) return;
  var sheet = book.getSheetByName('Intentos') || book.insertSheet('Intentos');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(INTENTOS_HEADERS);
    sheet.setFrozenRows(1);
  }
  var last = sheet.getLastRow();
  var ids = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues().flat() : [];
  var seen = new Set(ids.map(String));
  var rows = [];
  attempts.forEach(function(attempt) {
    if (!attempt || !attempt.id || seen.has(String(attempt.id))) return;
    seen.add(String(attempt.id));
    rows.push([
      attempt.id, attempt.idPartida, attempt.fechaHora, attempt.ronda,
      attempt.pregunta, attempt.intento, attempt.equipoNombre,
      attempt.resultado, attempt.opcion == null ? '' : String(attempt.opcion),
      attempt.resultado === 'Correcta' ? 1 : 0,
      attempt.turnoSiguiente || ''
    ]);
  });
  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, INTENTOS_HEADERS.length).setValues(rows);
}
