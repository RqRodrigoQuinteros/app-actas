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
  const totales = {};

  // Procesa un scope (sección o subsección) de forma independiente:
  // suma solo los campos "camas" que estén en el mismo scope que el campo total.
  const procesarScope = (campos) => {
    const camposTotal = campos.filter(esCampoTotalCamas);
    if (camposTotal.length === 0) return;
    const camposASumar = campos.filter(esCampoCamas);
    if (camposASumar.length === 0) return;
    const suma = camposASumar.reduce((acc, c) => {
      const n = Number(respuestas[c.id]);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
    camposTotal.forEach(ct => { totales[ct.id] = String(suma); });
  };

  secciones.forEach(seccion => {
    procesarScope(seccion.campos || []);
    (seccion.subsecciones || []).forEach(sub => procesarScope(sub.campos || []));
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
