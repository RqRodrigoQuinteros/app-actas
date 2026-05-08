// evaluarFormula.js
// Función segura para evaluar fórmulas con variables reemplazadas

// Funciones matemáticas permitidas en fórmulas
const FUNCIONES_PERMITIDAS = { ceil: Math.ceil, floor: Math.floor, max: Math.max, min: Math.min, round: Math.round };
const NOMBRES_FUNCIONES = Object.keys(FUNCIONES_PERMITIDAS).join('|');

/**
 * Sanitiza una expresión quitando los nombres de funciones permitidas
 * para poder validar el resto con el regex de caracteres válidos.
 */
function quitarFunciones(expresion) {
  // Quita "ceil(", "max(", etc. (solo el nombre, el paréntesis lo permite el regex)
  return expresion.replace(new RegExp(`\\b(${NOMBRES_FUNCIONES})\\b`, 'g'), '');
}

/**
 * Evalúa una fórmula matemática reemplazando variables por valores.
 * Soporta operadores básicos (+, -, *, /) y las funciones:
 *   ceil(x)        → redondea hacia arriba
 *   floor(x)       → redondea hacia abajo
 *   round(x)       → redondea al entero más cercano
 *   max(x, y, ...) → el mayor de los valores
 *   min(x, y, ...) → el menor de los valores
 *
 * Ejemplo de fórmulas válidas:
 *   "camas_uti / 4"
 *   "ceil(camas_uti / 3)"
 *   "max(ceil(camas_uti / 4), 2)"
 *
 * @param {string} formula    - La fórmula a evaluar
 * @param {object} variables  - Objeto con variables disponibles (ej: { camas_uti: 12 })
 * @returns {number|null}     - Resultado numérico, o null si hay error
 */
export function evaluarFormula(formula, variables = {}) {
  if (!formula || typeof formula !== 'string') return null;

  try {
    let expresion = formula.trim();

    // Reemplazar tokens/nombres de variables por sus valores numéricos
    for (const [nombre, valor] of Object.entries(variables)) {
      const regex = new RegExp(`\\b${nombre}\\b`, 'g');
      if (expresion.match(regex)) {
        const numValor = parseFloat(valor);
        if (!isNaN(numValor)) {
          expresion = expresion.replace(regex, String(numValor));
        }
      }
    }

    // Validar caracteres: números, operadores, paréntesis, punto decimal, coma (para max/min multi-arg)
    // Se quitan primero los nombres de funciones permitidas antes de aplicar el regex
    const validChars = /^[0-9+\-*/().,\s]+$/;
    if (!validChars.test(quitarFunciones(expresion))) {
      console.warn('Fórmula contiene caracteres inválidos después de reemplazar variables:', formula);
      return null;
    }

    // Evaluación segura con las funciones matemáticas inyectadas como variables locales
    const fnArgs = Object.keys(FUNCIONES_PERMITIDAS).join(', ');
    const fnVals = Object.values(FUNCIONES_PERMITIDAS);

    const result = new Function(...Object.keys(FUNCIONES_PERMITIDAS), `"use strict"; return (${expresion});`)(...fnVals);

    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }

    console.warn('Fórmula resultó en valor inválido:', expresion, '→', result);
    return null;
  } catch (err) {
    console.warn('Error evaluando fórmula:', formula, err.message);
    return null;
  }
}

/**
 * Valida la sintaxis de una fórmula sin ejecutarla.
 * @param {string} formula
 * @returns {{ valida: boolean, error?: string }}
 */
export function validarFormula(formula) {
  if (!formula || typeof formula !== 'string') {
    return { valida: false, error: 'Fórmula vacía' };
  }

  // \w cubre letras, números y guion bajo (para nombres de variables y funciones)
  const validChars = /^[0-9+\-*/().,\s\w]+$/;
  if (!validChars.test(formula)) {
    return {
      valida: false,
      error: 'Caracteres inválidos. Solo se permiten números, operadores (+, -, *, /), paréntesis, coma y nombres de variables/funciones.',
    };
  }

  // Verificar que las funciones usadas en la fórmula sean solo las permitidas
  const funcionesUsadas = [...formula.matchAll(/\b([a-zA-Z_]\w*)\s*\(/g)].map(m => m[1]);
  const funcionesNoPermitidas = funcionesUsadas.filter(f => !FUNCIONES_PERMITIDAS[f]);
  if (funcionesNoPermitidas.length > 0) {
    return {
      valida: false,
      error: `Función(es) no permitida(s): ${funcionesNoPermitidas.join(', ')}. Funciones disponibles: ${NOMBRES_FUNCIONES}.`,
    };
  }

  try {
    // Parseo en seco para detectar sintaxis inválida
    new Function(...Object.keys(FUNCIONES_PERMITIDAS), `"use strict"; return (${formula});`);
    return { valida: true };
  } catch (err) {
    return { valida: false, error: `Sintaxis inválida: ${err.message}` };
  }
}
