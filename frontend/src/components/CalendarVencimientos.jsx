import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const STATUS_COLOR = {
  vencida: 'bg-red-500',
  proxima: 'bg-amber-500',
  al_dia: 'bg-emerald-500',
};

function formatFecha(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getMonthGrid(anio, mes) {
  const firstDay = new Date(anio, mes, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(anio, mes + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarVencimientos({ onNavigate }) {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const mesStr = `${anio}-${String(mes + 1).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    api.get('/actas/eventos-calendario', { params: { mes: mesStr } })
      .then(r => setEventos(r.data))
      .catch(() => setEventos([]))
      .finally(() => setLoading(false));
  }, [mesStr]);

  const irAlMes = useCallback((delta) => {
    let nuevoMes = mes + delta;
    let nuevoAnio = anio;
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAnio++; }
    if (nuevoMes < 0) { nuevoMes = 11; nuevoAnio--; }
    setAnio(nuevoAnio);
    setMes(nuevoMes);
    setDiaSeleccionado(null);
  }, [mes, anio]);

  const irAHoy = useCallback(() => {
    setAnio(hoy.getFullYear());
    setMes(hoy.getMonth());
    setDiaSeleccionado(null);
  }, [hoy]);

  const grid = getMonthGrid(anio, mes);

  const eventosPorDia = {};
  for (const ev of eventos) {
    if (!ev.date) continue;
    const dia = parseInt(ev.date.split('-')[2], 10);
    if (!eventosPorDia[dia]) eventosPorDia[dia] = [];
    eventosPorDia[dia].push(ev);
  }

  const eventosDiaSel = diaSeleccionado ? eventosPorDia[diaSeleccionado] || [] : [];

  const hoyEs = hoy.getFullYear() === anio && hoy.getMonth() === mes ? hoy.getDate() : null;

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
          <button onClick={() => irAlMes(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer text-gray-600 border-none text-sm font-bold">
            ←
          </button>
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900">{MESES[mes]} {anio}</span>
            {!(hoy.getFullYear() === anio && hoy.getMonth() === mes) && (
              <button onClick={irAHoy}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 cursor-pointer">
                Hoy
              </button>
            )}
          </div>
          <button onClick={() => irAlMes(1)}
            className="p-1.5 rounded-lg hover:bg-gray-200 cursor-pointer text-gray-600 border-none text-sm font-bold">
            →
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-400">Cargando calendario...</div>
        ) : (
          <div className="p-3">
            <div className="grid grid-cols-7 mb-1">
              {DIAS.map(d => (
                <div key={d} className="p-2 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {grid.map((dia, i) => {
                const evs = dia ? eventosPorDia[dia] || [] : [];
                const isToday = dia === hoyEs;
                const isSelected = dia === diaSeleccionado;
                const statusCounts = {};
                for (const ev of evs) {
                  const s = ev.status || 'al_dia';
                  statusCounts[s] = (statusCounts[s] || 0) + 1;
                }
                const totalDots = Math.min(evs.length, 3);

                return (
                  <div key={i} className="relative">
                    {dia ? (
                      <button
                        onClick={() => setDiaSeleccionado(isSelected ? null : dia)}
                        className={`w-full p-1.5 rounded-lg text-sm transition-colors cursor-pointer border-none
                          ${isSelected ? 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-300' : ''}
                          ${isToday && !isSelected ? 'bg-blue-50 text-blue-600 font-bold' : ''}
                          ${!isSelected && !isToday ? 'hover:bg-gray-100 text-gray-700' : ''}
                        `}
                      >
                        <span className="block text-center text-sm">{dia}</span>
                        {evs.length > 0 && (
                          <div className="flex justify-center gap-0.5 mt-0.5">
                            {Array.from({ length: totalDots }).map((_, j) => {
                              const keys = Object.keys(statusCounts);
                              const statusKey = keys[j] || 'al_dia';
                              return (
                                <span key={j}
                                  className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_COLOR[statusKey] || STATUS_COLOR.al_dia}`}
                                />
                              );
                            })}
                            {evs.length > 3 && (
                              <span className="text-[9px] text-gray-400 font-bold ml-0.5">+{evs.length - 3}</span>
                            )}
                          </div>
                        )}
                      </button>
                    ) : (
                      <div className="p-1.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" /> Vencida
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" /> Próxima
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" /> Al día
          </span>
        </div>
      </div>

      {diaSeleccionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setDiaSeleccionado(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <div className="text-base font-bold text-gray-900">
                {diaSeleccionado} de {MESES[mes]} {anio}
              </div>
              <button onClick={() => setDiaSeleccionado(null)}
                className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-400 border-none text-lg leading-none">
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-3">
              {eventosDiaSel.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-400">Sin vencimientos este día</p>
              ) : (
                <div className="space-y-2">
                  {eventosDiaSel.map(ev => (
                    <div key={ev.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        ev.status === 'vencida' ? 'border-l-red-500 bg-red-50' :
                        ev.status === 'proxima' ? 'border-l-amber-500 bg-amber-50' :
                        'border-l-emerald-500 bg-emerald-50'
                      }`}>
                      <div className="text-sm font-bold text-gray-900">{ev.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Exp: {ev.expediente || '—'} · Insp: {ev.inspector}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ev.status === 'vencida' ? 'bg-red-100 text-red-700' :
                          ev.status === 'proxima' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {ev.status === 'vencida' ? 'Vencida' : ev.status === 'proxima' ? 'Próxima' : 'Al día'}
                        </span>
                        {ev.alertaEnviada && (
                          <span className="text-[10px] text-green-600 font-bold">✓ Alerta enviada</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
