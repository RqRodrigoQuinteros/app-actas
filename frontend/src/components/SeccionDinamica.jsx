// SeccionDinamica — renderiza campos dinámicos desde la BD
// Recibe: secciones[] con campos[] adentro, respuestas {campo_id: valor}, onChange(campo_id, valor)

export default function SeccionDinamica({ secciones = [], respuestas = {}, onChange }) {

  const renderCampo = (campo) => {
    const valor = respuestas[campo.id] ?? '';

    if (campo.tipo === 'si_no') {
      const esSi  = valor === 'SI';
      const esNo  = valor === 'NO';
      return (
        <div key={campo.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <span className="text-base">{campo.etiqueta}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange(campo.id, esSi ? '' : 'SI')}
              className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                esSi ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >SI</button>
            <button
              type="button"
              onClick={() => onChange(campo.id, esNo ? '' : 'NO')}
              className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                esNo ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >NO</button>
          </div>
        </div>
      );
    }

    if (campo.tipo === 'check') {
      return (
        <div key={campo.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <input
            type="checkbox"
            checked={valor === 'true'}
            onChange={e => onChange(campo.id, e.target.checked ? 'true' : 'false')}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-base">{campo.etiqueta}</span>
        </div>
      );
    }

    if (campo.tipo === 'textarea') {
      return (
        <div key={campo.id} className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
          <textarea
            value={valor}
            onChange={e => onChange(campo.id, e.target.value)}
            placeholder={campo.placeholder || ''}
            className="p-3 border border-gray-300 rounded-lg"
            rows={3}
          />
        </div>
      );
    }

    if (campo.tipo === 'numero') {
      return (
        <div key={campo.id} className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
          <input
            type="number"
            inputMode="numeric"
            value={valor}
            onChange={e => onChange(campo.id, e.target.value)}
            placeholder={campo.placeholder || ''}
            className="p-3 border border-gray-300 rounded-lg"
          />
        </div>
      );
    }

    if (campo.tipo === 'fecha') {
      return (
        <div key={campo.id} className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
          <input
            type="date"
            value={valor}
            onChange={e => onChange(campo.id, e.target.value)}
            className="p-3 border border-gray-300 rounded-lg"
          />
        </div>
      );
    }

    if (campo.tipo === 'select') {
      const opciones = Array.isArray(campo.opciones) ? campo.opciones : [];
      return (
        <div key={campo.id} className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
          <select
            value={valor}
            onChange={e => onChange(campo.id, e.target.value)}
            className="p-3 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Seleccionar...</option>
            {opciones.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
      );
    }

    // texto (default)
    return (
      <div key={campo.id} className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        <input
          type="text"
          value={valor}
          onChange={e => onChange(campo.id, e.target.value)}
          placeholder={campo.placeholder || ''}
          className="p-3 border border-gray-300 rounded-lg"
        />
      </div>
    );
  };

  if (!secciones.length) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm mb-4">
        Esta tipología no tiene secciones configuradas. Configuralas desde el panel de administración.
      </div>
    );
  }

  return (
    <>
      {secciones.map(seccion => (
        <div key={seccion.id} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold text-lg mb-3 text-gray-800 uppercase">{seccion.titulo}</h3>

          {seccion.texto_previo && (
            <p className="text-sm text-gray-500 italic mb-3">{seccion.texto_previo}</p>
          )}

          <div className="space-y-3">
            {(seccion.campos || []).map(campo => renderCampo(campo))}
          </div>

          {seccion.texto_posterior && (
            <p className="text-sm text-gray-500 italic mt-3">{seccion.texto_posterior}</p>
          )}
        </div>
      ))}
    </>
  );
}