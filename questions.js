/**
 * CONSAR - Trivia Lucha Libre Financiera
 * Banco de Preguntas Actualizado por Rounds & Modalidades:
 * - Round 1: Opción Múltiple (8 preguntas)
 * - Round 2: Verdadero o Falso (10 preguntas)
 * - Round 3: Respuesta Abierta / Tercera Caída Definitoria (6 preguntas)
 */

const TRIVIA_QUESTIONS = {
  version1: {
    id: "version1",
    name: "Round 1: Opción Múltiple",
    mode: "multiple",
    questions: [
      {
        id: 1,
        question: "¿Qué entidad regula y vigila a las Afores?",
        options: [
          "a) CONDUSEF",
          "b) CONSAR",
          "c) SAT",
          "d) IMSS"
        ],
        correct: 1,
        explanation: "La CONSAR (Comisión Nacional del Sistema de Ahorro para el Retiro) regula y supervisa que tus recursos estén seguros."
      },
      {
        id: 2,
        question: "Prestación que ofrece el patrón para fomentar el ahorro entre sus empleados:",
        options: [
          "a) Caja de ahorro",
          "b) Renta vitalicia",
          "c) Coyotaje",
          "d) Tanda"
        ],
        correct: 0,
        explanation: "La caja de ahorro es una prestación laboral formal para fomentar el hábito del ahorro de los trabajadores."
      },
      {
        id: 3,
        question: "¿Cuál de estos es un ejemplo de «gasto hormiga»?",
        options: [
          "a) Pagar la renta",
          "b) Un café diario",
          "c) Ahorrar para el retiro",
          "d) Pagar el predial"
        ],
        correct: 1,
        explanation: "Un café diario, antojitos o compras impulsivas son gastos hormiga que merman tu capacidad de ahorro."
      },
      {
        id: 4,
        question: "¿Para qué sirve la renta vitalicia?",
        options: [
          "a) Ahorrar a corto plazo",
          "b) Garantizar una pensión de por vida",
          "c) Cambiar de Afore",
          "d) Evitar comisiones"
        ],
        correct: 1,
        explanation: "La renta vitalicia es una modalidad de pensión contratada con una aseguradora para recibir pagos de por vida."
      },
      {
        id: 5,
        question: "¿Cuántas Afores operan actualmente en México?",
        options: [
          "a) 5",
          "b) 10",
          "c) 15",
          "d) 20"
        ],
        correct: 1,
        explanation: "Actualmente operan 10 Afores autorizadas y supervisadas por la CONSAR en el sistema financiero."
      },
      {
        id: 6,
        question: "Una Afore es una institución…",
        options: [
          "a) Educativa",
          "b) Financiera",
          "c) De salud",
          "d) De gobierno"
        ],
        correct: 1,
        explanation: "Las Afores son instituciones financieras privadas dedicadas exclusivamente a administrar los fondos de retiro."
      },
      {
        id: 7,
        question: "¿Qué instituto atiende principalmente a los trabajadores del sector privado?",
        options: [
          "a) ISSSTE",
          "b) IMSS",
          "c) INFONAVIT",
          "d) CONSAR"
        ],
        correct: 1,
        explanation: "El IMSS (Instituto Mexicano del Seguro Social) atiende a los trabajadores afiliados del sector privado."
      },
      {
        id: 8,
        question: "Concepto que permite comprender mejor los productos financieros:",
        options: [
          "a) Coyotaje",
          "b) Educación financiera",
          "c) Minusvalía",
          "d) Comisión"
        ],
        correct: 1,
        explanation: "La educación financiera es la herramienta clave para tomar decisiones inteligentes sobre tu presupuesto y retiro."
      }
    ]
  },
  version2: {
    id: "version2",
    name: "Round 2: Verdadero o Falso",
    mode: "boolean",
    questions: [
      {
        id: 1,
        question: "¿Se pueden hacer aportaciones voluntarias a tu cuenta Afore?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 0,
        explanation: "¡Sí! Cualquier trabajador puede realizar Ahorro Voluntario a partir de $50 pesos desde su celular o tienda."
      },
      {
        id: 2,
        question: "¿Los SIEFORE son las cuentas individuales de los trabajadores?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 1,
        explanation: "¡No! Las SIEFORES son los fondos de inversión donde se invierten los recursos para generar rendimientos."
      },
      {
        id: 3,
        question: "¿Un trabajador independiente puede hacer ahorro voluntario?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 0,
        explanation: "¡Sí! Los trabajadores independientes pueden abrir su Afore y hacer aportaciones cuando lo deseen."
      },
      {
        id: 4,
        question: "¿Debes dejar de revisar las comisiones una vez que elegiste tu Afore?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 1,
        explanation: "¡No! Es fundamental comparar comisiones y rendimientos periódicamente con el Semáforo de la CONSAR."
      },
      {
        id: 5,
        question: "¿Las Afores se encargan de administrar los fondos para el retiro?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 0,
        explanation: "¡Sí! Su función principal es administrar, resguardar e invertir tu dinero para la pensión futura."
      },
      {
        id: 6,
        question: "¿Debes cambiarte de Afore solo porque cambiaste de empleo?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 1,
        explanation: "¡No! Tu cuenta de Afore es única y te pertenece a ti sin importar cuántas veces cambies de trabajo."
      },
      {
        id: 7,
        question: "¿El ahorro voluntario puede ayudarte a tener una mejor pensión?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 0,
        explanation: "¡Sí! El Ahorro Voluntario incrementa el saldo final y aprovecha el interés compuesto para subir tu pensión."
      },
      {
        id: 8,
        question: "¿Guardar tu dinero «bajo el colchón» lo hace crecer?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 1,
        explanation: "¡No! Guardar dinero en efectivo en casa hace que pierda poder de compra debido a la inflación."
      },
      {
        id: 9,
        question: "¿La CONSAR es la autoridad que regula el Sistema de Ahorro para el Retiro?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 0,
        explanation: "¡Sí! La CONSAR regula, supervisa e inspecciona el correcto funcionamiento del SAR en México."
      },
      {
        id: 10,
        question: "¿El «coyotaje» es un trámite oficial y recomendable?",
        options: [
          "a) Sí (Verdadero)",
          "b) No (Falso)"
        ],
        correct: 1,
        explanation: "¡No! Es un fraude. Todos los trámites del SAR son totalmente gratuitos y personales."
      }
    ]
  },
  version3: {
    id: "version3",
    name: "Round 3: Respuesta Abierta (Tercera Caída · Definitoria)",
    mode: "open",
    questions: [
      {
        id: 1,
        question: "Si el salario mínimo diario es $315.04, ¿cuánto es el salario mínimo mensual considerando 30 días?",
        options: [],
        correct: null,
        answer: "$9,451.20 (315.04 × 30)",
        explanation: "Multiplicando $315.04 × 30 días = $9,451.20 pesos mensuales."
      },
      {
        id: 2,
        question: "Ana compra un raspado de $15 todos los días. ¿Cuánto gasta al mes en ese gasto hormiga?",
        options: [],
        correct: null,
        answer: "$450.00 (15 × 30)",
        explanation: "Multiplicando $15 × 30 días del mes = $450.00 pesos al mes."
      },
      {
        id: 3,
        question: "Si tu sueldo es de $11,291 mensuales, ¿cuál es tu salario diario? (divide entre 30)",
        options: [],
        correct: null,
        answer: "$376.37",
        explanation: "Dividiendo $11,291 entre 30 días = $376.37 pesos diarios."
      },
      {
        id: 4,
        question: "Menciona una forma de controlar un gasto hormiga.",
        options: [],
        correct: null,
        answer: "Reducir su consumo (ej. preparar el café o raspado en casa, registrar tus gastos).",
        explanation: "Planificar tus compras y preparar tus alimentos en casa ayuda a controlar los fugas de dinero."
      },
      {
        id: 5,
        question: "¿Qué es una SIEFORE?",
        options: [],
        correct: null,
        answer: "El fondo donde se invierte tu dinero según tu año de nacimiento (fondo generacional).",
        explanation: "Las SIEFORES Generacionales invierten tus recursos adaptándose a tu grupo de edad."
      },
      {
        id: 6,
        question: "¿Qué es la renta vitalicia?",
        options: [],
        correct: null,
        answer: "El pago mensual de una pensión de por vida contratado con una aseguradora.",
        explanation: "Es una modalidad de pensión contratada con una aseguradora para recibir pagos de por vida."
      }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRIVIA_QUESTIONS;
}
