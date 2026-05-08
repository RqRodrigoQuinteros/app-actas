// evaluarFormula.js
// Función segura para evaluar fórmulas con variables reemplazadas

/**
 * Evalúa una fórmula matemática reemplazando variables por valores
 * @param {string} formula - La fórmula a evaluar (ej: "quirofanos * 2 + 1")
 * @param {object} variables - Objeto con variables disponibles (ej: { quirofanos: 5 })
 * @returns {number|null} - El resultado de la fórmula, o null si hay error
 */
export function evaluarFormula(formula, variables = {}) {
  if (!formula || typeof formula !== 'string') return null;

  try {
    // Reemplazar variables en la fórmula
    let expresion = formula.trim();

    // Validar que solo contiene caracteres válidos: números, operadores, paréntesis, espacios
    const validChars = /^[0-9+\-*/().\s]+$/;
    
    // Reemplazar tokens/nombres de variables por sus valores
    for (const [nombre, valor] of Object.entries(variables)) {
      // Crear regex para reemplazar el nombre como palabra completa
      const regex = new RegExp(`\\b${nombre}\\b`, 'g');
      if (expresion.match(regex)) {
        const numValor = parseFloat(valor);
        if (!isNaN(numValor)) {
          expresion = expresion.replace(regex, numValor);
        }
      }
    }

    // Verificar que la expresión sea válida después de reemplazos
    if (!validChars.test(expresion)) {
      console.warn('Fórmula contiene caracteres inválidos:', formula);
      return null;
    }

    // Evaluación segura: usar Function() en lugar de eval()
    // Function() es más restrictivo que eval()
    const result = Function('"use strict"; return (' + expresion + ')')();
    
    // Validar que el resultado es un número válido
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    
    console.warn('Fórmula resultó en valor inválido:', expresion, 'resultado:', result);
    return null;
  } catch (err) {
    console.warn('Error evaluando fórmula:', formula, err.message);
    return null;
  }
}

/**
 * Valida sintaxis de una fórmula sin ejecutarla
 * @param {string} formula - La fórmula a validar
 * @returns {object} - { valida: boolean, error?: string }
 */
export function validarFormula(formula) {
  if (!formula || typeof formula !== 'string') {
    return { valida: false, error: 'Fórmula vacía' };
  }

  const validChars = /^[0-9+\-*/().\s\w]+$/;
  if (!validChars.test(formula)) {
    return { valida: false, error: 'Caracteres inválidos. Solo se permiten números, operadores (+, -, *, /), paréntesis y nombres de variables.' };
  }

  try {
    // Intentar parsear para detectar sintaxis inválida
    Function('"use strict"; return (' + formula + ')');
    return { valida: true };
  } catch (err) {
    return { valida: false, error: `Sintaxis inválida: ${err.message}` };
  }
}
