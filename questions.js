/**
 * CONSAR - Trivia Lucha Libre Financiera
 * Banco de Preguntas (3 versiones adaptadas a modalidades de juego)
 * - Versión 1: Opción Múltiple (4 opciones A, B, C, D)
 * - Versión 2: Verdadero o Falso (2 opciones)
 * - Versión 3: Respuesta Abierta (Sin opciones múltiples, respuesta de referencia)
 */

const TRIVIA_QUESTIONS = {
  version1: {
    id: "version1",
    name: "Versión 1: ¡El Aplique del Ahorro! (Opción Múltiple)",
    mode: "multiple",
    questions: [
      {
        id: 1,
        question: "¡El gancho al estómago del ahorro informal! ¿Por qué guardar dinero 'bajo el colchón' te hace perder la pelea?",
        options: [
          "A) Porque el colchón se puede romper o ensuciar",
          "B) Por la inflación: el dinero pierde poder adquisitivo con el tiempo",
          "C) Porque no te entregan un cinturón de campeón",
          "D) Porque los bancos se molestan"
        ],
        correct: 1,
        explanation: "¡Contra la inflación, la Afore es tu mejor aliada! Mantener tu dinero invertido protege tu poder de compra a futuro."
      },
      {
        id: 2,
        question: "¡La llave de rendición a las deudas! ¿Cuál es el primer paso para aplicar un candado de seguridad a tus finanzas?",
        options: [
          "A) Gastar todo en el mercado y luego ver qué queda",
          "B) Elaborar un presupuesto mensual y priorizar tus gastos necesarios",
          "C) Pedir un préstamo a la Esquina Ruda",
          "D) Cancelar todas tus tarjetas y no volver a comprar nada"
        ],
        correct: 1,
        explanation: "Un presupuesto claro es tu entrenamiento diario para dominar tus finanzas y vencer las deudas en el ring."
      },
      {
        id: 3,
        question: "¡El vuelo espectacular desde la tercera cuerda! ¿Qué es el Ahorro Voluntario en tu Afore?",
        options: [
          "A) Una cuota obligatoria impuesta por el réferi del ring",
          "B) Aportaciones adicionales que haces por tu cuenta para incrementar tu pensión",
          "C) El dinero que le donas a la institución financiera",
          "D) Un premio sorpresa que ganas al azar"
        ],
        correct: 1,
        explanation: "El Ahorro Voluntario incrementa sustancialmente tu pensión futura gracias al impulso del interés compuesto."
      },
      {
        id: 4,
        question: "¡El tope suicida contra imprevistos! ¿Para qué sirve contar con un Fondo de Emergencia?",
        options: [
          "A) Para comprar boletos de Lucha Libre en primera fila",
          "B) Para cubrir gastos inesperados sin endeudarte ni comprometer tu patrimonio",
          "C) Para pagar la fiesta patronal de fin de año",
          "D) Para apostar en la Esquina Ruda"
        ],
        correct: 1,
        explanation: "Un fondo de emergencia de 3 a 6 meses de tu sueldo te protege ante cualquier 'patada voladora' de la vida diaria."
      },
      {
        id: 5,
        question: "¡La máscara dorada del trabajador! ¿Qué institución regula y supervisa el Sistema de Ahorro para el Retiro en México?",
        options: [
          "A) La Comisión Nacional de Lucha Libre",
          "B) CONSAR (Comisión Nacional del Sistema de Ahorro para el Retiro)",
          "C) La Asociación de Réferis y réferis auxiliares",
          "D) El Banco Central del Barrio"
        ],
        correct: 1,
        explanation: "La CONSAR vigila que los recursos de los trabajadores estén seguros, bien invertidos y transparentes en sus Afores."
      }
    ]
  },
  version2: {
    id: "version2",
    name: "Versión 2: ¡La Llave Maestra! (Verdadero o Falso)",
    mode: "boolean",
    questions: [
      {
        id: 1,
        question: "¡La patada voladora al ahorro informal! ¿Guardar dinero 'bajo el colchón' te protege adecuadamente contra la inflación?",
        options: [
          "A) Verdadero",
          "B) Falso"
        ],
        correct: 1,
        explanation: "¡Falso! Por la inflación, el dinero 'bajo el colchón' pierde poder adquisitivo con el tiempo. Tu Afore lo protege generando rendimientos."
      },
      {
        id: 2,
        question: "¡Las SIEFORES Generacionales invierten tus recursos de acuerdo con tu año de nacimiento para maximizar tu rendimiento conforme te acercas al retiro!",
        options: [
          "A) Verdadero",
          "B) Falso"
        ],
        correct: 0,
        explanation: "¡Verdadero! Las SIEFORES Generacionales adaptan la estrategia de inversión a tu grupo de edad para hacer crecer tu dinero de forma óptima."
      },
      {
        id: 3,
        question: "¡Es fundamental revisar tu Estado de Cuenta de la Afore al menos 3 veces al año para comprobar tus aportaciones patronales y rendimientos!",
        options: [
          "A) Verdadero",
          "B) Falso"
        ],
        correct: 0,
        explanation: "¡Verdadero! Recibirás tu estado de cuenta en enero, mayo y septiembre para verificar que tus cuotas estén al día."
      },
      {
        id: 4,
        question: "¡Los rendimientos que genera tu dinero en la Afore se reinvierten automáticamente acumulando ganancias sobre ganancias gracias al Interés Compuesto!",
        options: [
          "A) Verdadero",
          "B) Falso"
        ],
        correct: 0,
        explanation: "¡Verdadero! El interés compuesto hace que tus rendimientos generen nuevos rendimientos en un constante efecto bola de nieve."
      },
      {
        id: 5,
        question: "¡Un trabajador NUNCA tiene derecho a cambiarse de Afore, debiendo permanecer obligatoriamente en la misma toda su vida laboral!",
        options: [
          "A) Verdadero",
          "B) Falso"
        ],
        correct: 1,
        explanation: "¡Falso! Cada trabajador ejerciendo su derecho libre puede realizar un Traspaso a la Afore que le brinde mejores rendimientos y comisiones."
      }
    ]
  },
  version3: {
    id: "version3",
    name: "Versión 3: ¡Combate de Campeones! (Respuesta Abierta)",
    mode: "open",
    questions: [
      {
        id: 1,
        question: "¡El relevo australiano del ahorro! ¿Quiénes realizan las aportaciones a tu cuenta individual en el esquema tripartito de la Afore?",
        options: [],
        correct: null,
        answer: "El Patrón, el Gobierno Federal y el Trabajador (Aportación Tripartita).",
        explanation: "El ahorro para el retiro es un esfuerzo conjunto tripartito impulsado por tu empleador, el Estado y tus aportaciones."
      },
      {
        id: 2,
        question: "¡El lazo al cuello al presupuesto! ¿A qué se le conoce como 'gastos hormiga' en tu economía diaria?",
        options: [],
        correct: null,
        answer: "Pequeños gastos diarios imperceptibles (cafés, botanas, suscripciones no usadas) que van mermando tu capacidad de ahorro.",
        explanation: "Sumados a lo largo del año, los gastos hormiga representan miles de pesos que podrías canalizar a tu Ahorro Voluntario."
      },
      {
        id: 3,
        question: "¡La victoria por conteo de 3 segundos! ¿A partir de qué edad puedes iniciar el trámite de pensión por Cesantía en Edad Avanzada?",
        options: [],
        correct: null,
        answer: "A partir de los 60 años de edad.",
        explanation: "Al cumplir 60 años puedes solicitar la pensión por Cesantía en Edad Avanzada (o a los 65 años por Vejez)."
      },
      {
        id: 4,
        question: "¡Defensa personal financiera! ¿Qué gran beneficio fiscal te brinda hacer Ahorro Voluntario con visión a largo plazo?",
        options: [],
        correct: null,
        answer: "Es deducible de impuestos en tu Declaración Anual ante el SAT.",
        explanation: "El Ahorro Voluntario a largo plazo te permite deducir impuestos, reduciendo tu ISR o generando saldo a favor en tu declaración anual."
      },
      {
        id: 5,
        question: "¡El Cinturón de Campeón Financiero! ¿Cuáles son las herramientas gratuitas que ofrece la CONSAR para comparar Afores?",
        options: [],
        correct: null,
        answer: "El Semáforo de Rendimiento Neto y las Calculadoras de Retiro CONSAR.",
        explanation: "El Semáforo de Rendimiento Neto te permite comparar qué Afore te da las mejores ganancias reales según tu grupo de edad."
      }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRIVIA_QUESTIONS;
}
