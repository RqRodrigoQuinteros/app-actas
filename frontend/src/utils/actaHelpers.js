export const esCampoTotalCamas = (campo) => {
  if (!campo || campo.tipo !== 'numero') return false;
  const texto = `${campo.etiqueta || ''} ${campo.token || ''}`.toLowerCase();
  return /(?:total|totales|tot\.|suma|sumatoria)\s+.*camas?|camas?.*\s+(?:total|totales|tot\.|suma|sumatoria)|tot.*cama/.test(texto);
};

const esCampoCamas = (campo) => {
  if (!campo || campo.tipo !== 'numero') return false;
  const texto = `${campo.etiqueta || ''} ${campo.token || ''}`.toLowerCase();
  return /\bcamas?\b/.test(texto) && !esCampoTotalCamas(campo);
};

export const calcularTotalesDeCamas = (respuestas = {}, secciones = []) => {
  const seccionesConCampos = secciones.map((seccion) => ({
    ...seccion,
    campos: [
      ...(seccion.campos || []),
      ...((seccion.subsecciones || []).flatMap(sub => sub.campos || [])),
    ],
  }));

  const totales = {};

  seccionesConCampos.forEach((seccion) => {
    const camposTotal = seccion.campos.filter(esCampoTotalCamas);
    if (camposTotal.length === 0) return;

    // Primero buscar campos con "camas" en el nombre (comportamiento geriátricos)
    let camposASumar = seccion.campos.filter(esCampoCamas);

    // Fallback: si no hay campos con "camas" en el nombre, sumar todos los numéricos
    // anteriores al primer campo total de la sección (comportamiento clínicas y similares)
    if (camposASumar.length === 0) {
      const idxPrimerTotal = seccion.campos.findIndex(esCampoTotalCamas);
      camposASumar = seccion.campos
        .slice(0, idxPrimerTotal)
        .filter(c => c.tipo === 'numero');
    }

    if (camposASumar.length === 0) return;

    const suma = camposASumar.reduce((acc, campo) => {
      const valor = respuestas[campo.id];
      const numero = Number(valor);
      return acc + (Number.isFinite(numero) ? numero : 0);
    }, 0);

    camposTotal.forEach((campoTotal) => {
      totales[campoTotal.id] = String(suma);
    });
  });

  return totales;
};

export const ponerTodoSi = (respuestas = {}, secciones = []) => {
  const siguientes = { ...respuestas };
  secciones.forEach((seccion) => {
    const campos = [
      ...(seccion.campos || []),
      ...((seccion.subsecciones || []).flatMap(sub => sub.campos || [])),
    ];
    campos.forEach((campo) => {
      if (campo.tipo === 'si_no') {
        siguientes[campo.id] = 'SI';
      }
    });
  });
  return siguientes;
};
