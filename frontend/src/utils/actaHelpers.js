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
    const camposCamas = seccion.campos.filter(esCampoCamas);
    const camposTotal = seccion.campos.filter(esCampoTotalCamas);
    if (camposTotal.length === 0 || camposCamas.length === 0) return;

    const suma = camposCamas.reduce((acc, campo) => {
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
