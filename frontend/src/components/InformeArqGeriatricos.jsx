import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { informesAPI, informesTemplatesAPI, authAPI } from "../utils/api";
import api from "../utils/api";

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // Si ya está en DD/MM/YYYY, devolverlo así
  if (dateStr.includes('/')) return dateStr;
  // Si está en YYYY-MM-DD, convertirlo
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// ─── ESTILOS BASE ─────────────────────────────────────────────────────────────
const S = {
  inputBase: {
    width: "100%", boxSizing: "border-box",
    fontSize: "14px", padding: "10px 12px",
    borderRadius: "8px",
    border: "1.5px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    fontFamily: "inherit",
    transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
    outline: "none",
  },
  label: {
    display: "block", fontSize: "11px", fontWeight: 700,
    color: "#6b7280", marginBottom: "5px",
    textTransform: "uppercase", letterSpacing: "0.07em",
  },
  fieldWrap: { display: "flex", flexDirection: "column" },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px 24px",
    marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#9ca3af",
    margin: "0 0 14px", paddingBottom: "8px",
    borderBottom: "1px solid #f3f4f6",
  },
};

// ─── CAMPOS (sin opciones fijas para arquitecto - se llena dinámicamente) ──────
const SECCIONES = [
  {
    titulo: "Auditor",
    campos: [
      { id: "arquitecto", label: "Nombre del Arquitecto", tipo: "select" },
    ]
  },
  {
    titulo: "Expediente",
    campos: [
      { id: "expDigital", label: "N° Expediente Digital", placeholder: "0425-xxxxxx/20xx" },
      { id: "expPapel",   label: "N° Expediente Papel",   placeholder: "-" },
      { id: "fojasOrdenes", label: "Fojas u Órdenes", placeholder: "Nros de informe y plano", fullWidth: true },
    ]
  },
  {
    titulo: "Establecimiento",
    campos: [
      { id: "nombreEst",   label: "Nombre del establecimiento", placeholder: "Nombre...", fullWidth: true },
      { id: "direccion",   label: "Dirección",                  placeholder: "Av. Italia N° 1537" },
      { id: "barrio",      label: "Barrio / Localidad",         placeholder: "Río Cuarto" },
      { id: "departamento",label: "Departamento",               placeholder: "RÍO CUARTO" },
      { id: "metros2",     label: "Metros cuadrados",           placeholder: "m²" },
      { id: "cantCamas",   label: "Cantidad de camas",          placeholder: "22" },
      { id: "fecha", label: "Fecha", tipo: "date", placeholder: "dd/mm/aaaa" },
      { id: "pileta",      label: "Pileta",                     tipo: "sino" },
      { id: "ascensor",    label: "Ascensor",                   tipo: "sino" },
      { id: "instalacionesDeportivas", label: "Instalaciones Deportivas", tipo: "select", opciones: ["Si, de uso del establecimiento", "No"] },
    ]
  },
  {
    titulo: "Nomenclatura Catastral",
    campos: [
      { id: "circ",        label: "Circunscripción", placeholder: "1" },
      { id: "seccion",     label: "Sección",         placeholder: "2" },
      { id: "manzana",     label: "Manzana",         placeholder: "226" },
      { id: "parcela",     label: "Parcela",         placeholder: "21" },
      { id: "loteOficial", label: "Lote Oficial",    placeholder: "-" },
    ]
  },
  {
    titulo: "Radiofísica",
    campos: [
      { id: "rad_convencional",  label: "Radiología Convencional Simple y Contrastada (Rayos X)", tipo: "sino" },
      { id: "rad_acelerador",    label: "Acelerador Lineal de Electrones",                        tipo: "sino" },
      { id: "rad_ortopanto",     label: "Ortopantomografía",                                      tipo: "sino" },
      { id: "rad_tomografia",    label: "Tomografía Computada",                                   tipo: "sino" },
      { id: "rad_litotricia",    label: "Litotricia",                                             tipo: "sino" },
      { id: "rad_laser",         label: "Láser",                                                  tipo: "sino" },
      { id: "rad_hemodinamia",   label: "Radiología Intervencionista - Hemodinamia",               tipo: "sino" },
      { id: "rad_pet",           label: "PET / SPECT / Tomografía por emisión de positrones",     tipo: "sino" },
      { id: "rad_ultravioleta",  label: "Ultra Violeta",                                          tipo: "sino" },
      { id: "rad_arco_c",        label: "Radiología Intervencionista - Arco en C",                tipo: "sino" },
      { id: "rad_conebeam",      label: "Tomografía Computada - Dental / Cone Beam",              tipo: "sino" },
      { id: "rad_resonancia",    label: "Resonancia Magnética",                                   tipo: "sino" },
      { id: "rad_densitometria", label: "Densitometría Ósea",                                    tipo: "sino" },
      { id: "rad_dental",        label: "Radiología Dental / Rayos X Dental",                    tipo: "sino" },
    ]
  },
  {
    titulo: "Otros",
    campos: [
      { id: "otro_laboratorio",  label: "Laboratorio",  tipo: "sino" },
      { id: "otro_hemodialisis", label: "Hemodiálisis", tipo: "sino" },
      { id: "otro_oncologicos",  label: "Oncológicos",  tipo: "sino" },
      { id: "otro_pileta",       label: "Pileta",       tipo: "sino" },
    ]
  },
  {
    titulo: "Observaciones y Conclusión",
    campos: [
      { id: "verificarInsp", label: "Verificar en Inspección", placeholder: "-", fullWidth: true },
      { id: "observaciones", label: "Observaciones generales", placeholder: "Observaciones...", textarea: true },
      { id: "conclusion",    label: "Conclusión", tipo: "conclusion", fullWidth: true },
    ]
  },
];

const CONCLUSIONES = [
  "ADECUADO",
  "OBSERVADO",
  "EN ESPERA DE ACLARACION Y/O DOCUMENTACION",
];

// ARTICULOS ya no es hardcodeado — se carga desde la BD en useEffect
const ARTICULOS_FALLBACK = [
  { nro: "2.a",    desc: "Documentación. Al momento de solicitar la habilitación se deberá presentar la siguiente documentación, en original o fotocopia debidamente autenticada, sin perjuicio de la documentación anexa específica para algunos tipos de establecimientos: a) Cuadernillo habilitante – categorizante." },
  { nro: "8",      desc: "Establecimientos con internación. Excepto los Hogares de Residencia, tendrán como mínimo las siguientes dependencias: habitaciones; baños; comedor, sala de estar-usos múltiples; consultorio interno y office de enfermería; cocina; despensa; lavadero con tendedero; patio o jardín. Todas las circulaciones y conexiones entre las distintas dependencias deberán ser cubiertas y cerradas." },
  { nro: "9",      desc: "Establecimientos sin internación. Dispondrán de espacios de uso común (estar, comedor – usos múltiples) con sanitarios en proporción y dimensiones conforme a lo establecido por el Código de Edificación de la localidad. Dispondrán de espacios separados de los de uso común, destinados al descanso y recreación de los usuarios." },
  { nro: "11",     desc: "Ubicación del inmueble. No se habilitarán aquellos establecimientos cuyos inmuebles sean linderos o cercanos con fondos en los que se desarrollen actividades que generen ruidos molestos, emanaciones contaminantes u otro tipo comprobable de perjuicio sanitario o ambiental." },
  { nro: "12",     desc: "Acceso peatonal. Como regla, deberá implementarse al nivel de la vereda. Se admitirán escalones como excepción, y su aceptación estará condicionada al análisis técnico respectivo. No se aceptarán puertas giratorias como ingreso al edificio." },
  { nro: "13.a.1", desc: "Queda prohibida la presencia de materiales de terminación de fácil combustión y/o inflamables, en pisos, paredes y techos; y de todo obstáculo que pueda generar accidentes en el desplazamiento de los residentes, o impedir el paso cómodo de la silla de ruedas y/o camilla." },
  { nro: "13.a.2", desc: "Las puertas de salida utilizadas como escape (involucradas en el recorrido), abrirán en el sentido de la evacuación; efectuada la acción, quedarán abiertas en forma fija, exceptuando aquéllas que por sus características sean las emplazadas para aislar el fuego." },
  { nro: "13.a.3", desc: "Los materiales con los que estén construidos los pisos, deberán ser de fácil limpieza, preferentemente antideslizante (siempre que mantengan en el tiempo sus características iniciales)." },
  { nro: "13.a.4", desc: "Los pasamanos rígidos ubicados en sus laterales, a una altura entre 0,80 a 1,00 m. del NPT. La sección transversal será de 1\" y 1/2. Su terminación será uniforme, suave al tacto y de fácil limpieza." },
  { nro: "13.a.5", desc: "La iluminación se dispensará mediante artefactos con la intensidad lumínica suficiente para visualizar correctamente el recorrido. El encendido de los artefactos se ubicará entre 0,90 a 1,20 m. del NPT." },
  { nro: "13.a.6", desc: "La luz de emergencia deberá desplegarse en todo el recorrido, e iluminarlo en su totalidad. Asimismo deberá haber carteles indicadores del recorrido de salida de emergencia." },
  { nro: "13.b",   desc: "Las circulaciones horizontales deberán tener un ancho mínimo de 1.00 m. hasta 30 residentes. Los desniveles existentes se salvarán con rampas, cuyo ancho mínimo deberá ser de 1,10 mts, pendiente máxima 1:12." },
  { nro: "13.c",   desc: "Circulaciones verticales. Ancho mínimo: 1.10 m. Escalones con pedadas antideslizantes (pedada mínima 0,26 m.; alzada máxima 0,18 m.) con pasamanos sobre ambos laterales. Puertas de protección en arranques superior e inferior con apertura en sentido de evacuación." },
  { nro: "14",     desc: "Rampas. Construidas en albañilería u hormigón; pendiente hasta 12%. Ancho mínimo: 1,10 m. En inicio, final y cambios de dirección: descanso igual al ancho de la rampa." },
  { nro: "15",     desc: "Circulaciones mecanizadas. Ascensor. Los establecimientos con más de una planta deberán contar con ascensor. Se exigirá: a) Certificado de habilitación. b) Constancia mensual de mantenimiento. c) Capacidad para silla de ruedas y acompañante. d) Localización visual y sonora. e) Ancho para silla de ruedas. f) Puerta identificada. g) Señal de orientación del piso. h) Revestimientos no combustibles. i) Iluminación adecuada." },
  { nro: "23",     desc: "Superficie de las dependencias. Comedor: 1,20 m² por persona. Estar: 2,00 m² por persona, con capacidad para dos tercios del total. Áreas descubiertas: 1,00 m² por residente." },
  { nro: "24",     desc: "Iluminación y ventilación. Todos los ambientes deberán cumplir con el coeficiente exigido para local de primera, con iluminación directa y ventanas al exterior preferentemente." },
  { nro: "25",     desc: "Terminaciones. Pisos antideslizantes. Pisos comunes: superficie lisa sin desniveles. Pisos de madera: impermeables; sin cámara de aire. Muros con terminación lisa y pintura lavable. Cielorrasos continuos sin perforaciones." },
  { nro: "26",     desc: "Mobiliario. Sillas lavables en número de residentes más 10%. Mesas con 0,16 m² por persona. Sillones con asiento a 0,45 m del NPT. Reloj y calendario visibles. TV y audio en estar." },
  { nro: "27",     desc: "Habitaciones. Hasta cuatro (4) plazas; superficie mínima 4,50 m² por residente; cubaje mínimo 15 m³; lado mínimo 2,50 m. En cada ingreso: cartel con número y capacidad de la habitación." },
  { nro: "29",     desc: "Área de enfermería. Hasta 50 plazas: 4,00 m². Paredes lisas e impermeables hasta 2,00 m. del NPT. Equipamiento: mesada con bacha agua fría y caliente; mobiliario para medicamentos y archivo de historias clínicas." },
  { nro: "30",     desc: "Consultorio Médico. Superficie mínima: 7,50 m²; lado mínimo 2,50 m; altura mínima 2,40 m. Con lavamanos y baño exclusivo. Puede compartir espacio con enfermería con tabicamiento cerrado de piso a techo y puerta." },
  { nro: "31.a",   desc: "Baños. Deberá asegurarse la accesibilidad para adultos mayores con movilidad reducida. Estarán vinculados al resto de las dependencias mediante circulaciones cerradas, sin servidumbre de paso." },
  { nro: "31.b",   desc: "Clasificación de baños: b.1) Privativos. b.2) Generales o compartidos. b.3) Individuales. b.4) Colectivos en sectores diferenciados." },
  { nro: "31.c",   desc: "Núcleo mínimo por cada seis residentes: lavamanos, inodoro, bidet o ducha sustituta y ducha a piso. Inodoro y bidet con suplemento de altura a 0,47 m del NPT en el 50% de los artefactos como mínimo." },
  { nro: "31.d",   desc: "Las terminaciones deberán realizarse con revestimiento impermeable en paredes (azulejos, cerámicos). Pisos y zócalos de materiales impermeables y resistentes al uso." },
  { nro: "31.e",   desc: "Puertas de ingreso con ancho mínimo para silla de ruedas. Apertura hacia afuera o corredizas, con cerradura de seguridad y llave maestra." },
  { nro: "31.h",   desc: "Artefactos con canillas mezcladoras. Lavamanos tipo ménsula con espacio libre inferior. Ducha a piso con duchador manual y piso antideslizante. Llamador en baño conectado al tablero. Agarraderas de caño 1½\" en inodoro, bidet y ducha." },
  { nro: "32",     desc: "Baño para personas con dificultades motoras. Espacio libre para círculo de 1,50 m de diámetro. Lavamanos ménsula a 0,80 m del piso. Espejo con ángulo de inclinación. Inodoro con acceso lateral. Llamador próximo al inodoro." },
  { nro: "33.a",   desc: "Cocina. No deberá ser paso hacia otro local. Superficie mínima: hasta 30 raciones 9,00 m²; más de 30 raciones: +0,30 m² por ración adicional." },
  { nro: "33.b",   desc: "La cocina deberá poseer iluminación natural en al menos el 20% de su superficie total." },
  { nro: "33.c",   desc: "La ventilación natural se corresponderá a un tercio (1/3) de la superficie de iluminación." },
  { nro: "33.d",   desc: "Equipamiento: hasta 30 raciones: módulo básico o 2 artefactos de 18.000-25.000 cal; hasta 50: módulo industrial 4 hornallas; hasta 100: 4/6 hornallas con 2 hornos; más de 100: aumento proporcional." },
  { nro: "33.e",   desc: "Mesada de apoyo en los costados del artefacto cocina." },
  { nro: "33.f",   desc: "Mesada de trabajo impermeable y lavable. Hasta 30 raciones: superficie mínima 0,90 m², ancho mínimo 0,60 m, libre de pileta." },
  { nro: "33.g",   desc: "Bacha profunda: 0,40 × 0,60 × 0,35 m de profundidad, con agua caliente y fría." },
  { nro: "33.h",   desc: "Bacha/s común/es (simple o doble). Hasta 30 raciones: una sola es suficiente. Muebles bajo mesada incombustibles, lavables y sin puertas, con estante a la vista." },
  { nro: "37",     desc: "Lavadero. Propio: área independiente bajo techo. Hasta 50 plazas: 6,00 m² mínimo, equipamiento semi-industrial. Más de 50: industrial. Concesionado: área mínima 3,00 m², pileta y lavarropas." },
  { nro: "38",     desc: "Dependencias complementarias del lavadero: depósito para ropa sucia (con desagüe y ventilación), depósito para ropa limpia, y depósito general para materiales y productos." },
  { nro: "39",     desc: "Residuos patógenos. Deberá disponerse de un ámbito físico para concentrar los residuos generados, conforme la legislación vigente y su reglamentación." },
];

const GENERALES_VACÍO = {
  expDigital: "", expPapel: "", fojasOrdenes: "",
  nombreEst: "", arquitecto: "", direccion: "", barrio: "",
  departamento: "", metros2: "", cantCamas: "", fecha: "",
  pileta: "", habMunicipal: "", circ: "", seccion: "",
  manzana: "", parcela: "", loteOficial: "",
  verificarInsp: "", observaciones: "", conclusion: "",
  // Radiofísica
  rad_convencional: "", rad_acelerador: "", rad_ortopanto: "", rad_tomografia: "",
  rad_litotricia: "", rad_laser: "", rad_hemodinamia: "", rad_pet: "",
  rad_ultravioleta: "", rad_arco_c: "", rad_conebeam: "", rad_resonancia: "",
  rad_densitometria: "", rad_dental: "",
  // Otros
  otro_laboratorio: "", otro_hemodialisis: "", otro_oncologicos: "", otro_pileta: "",
};

// ─── CAMPO INDIVIDUAL ─────────────────────────────────────────────────────────
function Campo({ c, valor, onChange, opciones }) {
  const focusStyle = {
    borderColor: "#2563eb",
    background: "#fff",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
  };

  const commonProps = {
    value: valor,
    onChange: e => onChange(e.target.value),
    onFocus: e => Object.assign(e.target.style, focusStyle),
    onBlur: e => {
      e.target.style.borderColor = "#d1d5db";
      e.target.style.background = "#f9fafb";
      e.target.style.boxShadow = "none";
    },
  };
  
  if (c.tipo === "date") {
  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{c.label}</label>
      <input type="date" value={valor} onChange={e => onChange(e.target.value)}
        style={S.inputBase} />
    </div>
  );
}
  

  if (c.tipo === "select") {
    return (
      <div style={S.fieldWrap}>
        <label style={S.label}>{c.label}</label>
        <select
          value={valor}
          onChange={e => onChange(e.target.value)}
          style={S.inputBase}
        >
          <option value="">Seleccionar...</option>
          {(opciones || []).map(op => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      </div>
    );
  }

  if (c.tipo === "sino") {
    return (
      <div style={S.fieldWrap}>
        <label style={S.label}>{c.label}</label>
        <div style={{ display: "flex", gap: "8px" }}>
          {["SI", "NO"].map(op => (
            <button key={op} type="button"
              onClick={() => onChange(valor === op ? "" : op)}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                border: valor === op ? "2px solid #2563eb" : "1.5px solid #d1d5db",
                background: valor === op ? "#eff6ff" : "#f9fafb",
                color: valor === op ? "#1d4ed8" : "#6b7280",
                cursor: "pointer", transition: "all 0.15s",
              }}>
              {op}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (c.tipo === "conclusion") {
    return (
      <div style={S.fieldWrap}>
        <label style={S.label}>{c.label}</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {CONCLUSIONES.map(op => (
            <button key={op} type="button"
              onClick={() => onChange(valor === op ? "" : op)}
              style={{
                padding: "11px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: valor === op ? 700 : 400,
                border: valor === op ? "2px solid #2563eb" : "1.5px solid #d1d5db",
                background: valor === op ? "#eff6ff" : "#f9fafb",
                color: valor === op ? "#1d4ed8" : "#374151",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
              <span style={{
                width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                border: valor === op ? "5px solid #2563eb" : "2px solid #d1d5db",
                background: "#fff",
              }} />
              {op}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (c.textarea) {
    return (
      <div style={S.fieldWrap}>
        <label style={S.label}>{c.label}</label>
        <textarea rows={3} placeholder={c.placeholder}
          style={{ ...S.inputBase, resize: "vertical" }}
          {...commonProps} />
      </div>
    );
  }

  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{c.label}</label>
      <input type="text" placeholder={c.placeholder}
        style={S.inputBase} {...commonProps} />
    </div>
  );
}

// ─── ARTÍCULO ITEM ────────────────────────────────────────────────────────────
function ArticuloItem({ art, checked, obsValue, onCheck, onObs }) {
  return (
    <div style={{
      borderRadius: "10px",
      marginBottom: "8px",
      border: checked ? "1.5px solid #bfdbfe" : "1.5px solid #f3f4f6",
      background: checked ? "#eff6ff" : "#fafafa",
      transition: "all 0.15s",
      overflow: "hidden",
    }}>
      <label style={{ display: "flex", gap: "12px", cursor: "pointer", padding: "14px 16px", alignItems: "flex-start" }}>
        {/* Checkbox custom */}
        <div style={{
          width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
          border: checked ? "none" : "2px solid #d1d5db",
          background: checked ? "#2563eb" : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}>
          {checked && <span style={{ color: "#fff", fontSize: "13px", lineHeight: 1 }}>✓</span>}
          <input type="checkbox" checked={checked} onChange={e => onCheck(e.target.checked)}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{
            display: "inline-block", fontWeight: 700, fontSize: "11px",
            color: checked ? "#1d4ed8" : "#6b7280",
            background: checked ? "#dbeafe" : "#f3f4f6",
            padding: "2px 8px", borderRadius: "4px",
            fontFamily: "monospace", marginBottom: "6px",
            letterSpacing: "0.03em",
          }}>
            Art. {art.nro}
          </span>
          <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: checked ? "#1e3a5f" : "#4b5563" }}>
            {art.desc}
          </p>
        </div>
      </label>

      {checked && (
        <div style={{ padding: "0 16px 14px 48px", borderTop: "1px solid #bfdbfe" }}>
          <label style={{ ...S.label, marginTop: "10px", color: "#3b82f6" }}>Observaciones del artículo</label>
          <textarea
            value={obsValue}
            onChange={e => onObs(e.target.value)}
            rows={2}
            placeholder="Descripción de la observación..."
            style={{
              ...S.inputBase,
              resize: "vertical",
              background: "#fff",
              borderColor: "#bfdbfe",
            }}
            onFocus={e => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#bfdbfe"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      )}
    </div>
  );
}

// ─── BOTÓN NAV ────────────────────────────────────────────────────────────────
function BtnNav({ onClick, children, primary, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} type="button" style={{
      padding: "10px 24px", fontSize: "14px", fontWeight: 600,
      borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer",
      border: primary ? "none" : "1.5px solid #d1d5db",
      background: disabled ? "#9ca3af" : primary ? "#2563eb" : "#fff",
      color: primary ? "#fff" : "#374151",
      transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

// ─── ARTÍCULOS CON SECCIONES COLAPSABLES ─────────────────────────────────────
function ArticulosStep({ articulos, loadingArticulos, checks, obsArt, totalChecked, setCheck, setObs, onBack, onNext }) {
  // Agrupar artículos por grupo
  const articulosPorGrupo = articulos.reduce((acc, art) => {
    const g = art.grupo || '__sin_grupo__';
    if (!acc[g]) acc[g] = [];
    acc[g].push(art);
    return acc;
  }, {});
  const grupos = Object.entries(articulosPorGrupo);
  const tieneGrupos = grupos.some(([g]) => g !== '__sin_grupo__');

  const [openGrupos, setOpenGrupos] = useState(
    () => Object.fromEntries(grupos.map(([g], i) => [g, i === 0]))
  );
  const toggleGrupo = (g) => setOpenGrupos(prev => ({ ...prev, [g]: !prev[g] }));

  // Contar seleccionados por grupo
  const countGrupo = (arts) => arts.filter(a => checks[a.nro]).length;

  return (
    <div>
      <div style={{ ...S.card, background: "#f0f9ff", border: "1px solid #bae6fd", marginBottom: "16px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#0369a1", lineHeight: 1.5 }}>
          Marcá los artículos que presentan observaciones. Al tildar se despliega el campo para ingresarlas.
          {totalChecked > 0 && <strong> — {totalChecked} artículo{totalChecked !== 1 ? "s" : ""} seleccionado{totalChecked !== 1 ? "s" : ""}.</strong>}
        </p>
      </div>

      {loadingArticulos ? (
        <div style={{ textAlign: "center", padding: "24px", color: "#9ca3af", fontSize: "14px" }}>
          Cargando artículos...
        </div>
      ) : tieneGrupos ? (
        // Renderizado con acordeón por grupo
        grupos.map(([grupoNombre, arts]) => {
          const isOpen = !!openGrupos[grupoNombre];
          const seleccionados = countGrupo(arts);
          const label = grupoNombre === '__sin_grupo__' ? 'Sin sección' : grupoNombre;
          return (
            <div key={grupoNombre} style={{ marginBottom: "8px", borderRadius: "10px", border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
              <div
                onClick={() => toggleGrupo(grupoNombre)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  minHeight: "52px", cursor: "pointer", padding: "0 16px",
                  background: isOpen ? "#f9fafb" : "#e5e7eb", userSelect: "none",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#111827", textTransform: "uppercase" }}>
                  {label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {seleccionados > 0 && (
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "12px" }}>
                      {seleccionados} seleccionado{seleccionados !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span style={{ fontSize: "18px", color: "#6b7280" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding: "12px" }}>
                  {arts.map(art => (
                    <ArticuloItem key={art.nro} art={art}
                      checked={checks[art.nro]} obsValue={obsArt[art.nro]}
                      onCheck={v => setCheck(art.nro, v)} onObs={v => setObs(art.nro, v)} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        // Lista plana (sin grupos, ej: geriátricos)
        articulos.map(art => (
          <ArticuloItem key={art.nro} art={art}
            checked={checks[art.nro]} obsValue={obsArt[art.nro]}
            onCheck={v => setCheck(art.nro, v)} onObs={v => setObs(art.nro, v)} />
        ))
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        <BtnNav onClick={onBack}>← Datos Generales</BtnNav>
        <BtnNav primary onClick={onNext}>Ver Informe →</BtnNav>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function InformeArqGeriatricos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const esNuevo = !id;

  const [step, setStep] = useState(0);
  const [generales, setGenerales] = useState(GENERALES_VACÍO);
  const [checks, setChecks]   = useState({});
  const [obsArt, setObsArt]   = useState({});
  const [articulos, setArticulos]     = useState([]);
  const [tipologiaId, setTipologiaId] = useState(location.state?.tipologia_id || null);
  const [tipologiaNombre, setTipologiaNombre] = useState(location.state?.tipologia_nombre || null);
  const [loadingArticulos, setLoadingArticulos] = useState(true);
  const [arquitectos, setArquitectos] = useState([]);

  const [guardando, setGuardando]       = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [guardadoOk, setGuardadoOk]     = useState(false);
  const [errorMsg, setErrorMsg]         = useState("");
  const [cargando, setCargando]         = useState(!esNuevo);

  // Cargar arquitectos desde la BD
  useEffect(() => {
    const cargarArquitectos = async () => {
      try {
        const res = await authAPI.getUsuariosLogin();
        const arqs = (res.data || []).filter(u => u.rol === 'arquitecto');
        setArquitectos(arqs.map(a => a.nombre));
      } catch {
        setArquitectos([]);
      }
    };
    cargarArquitectos();
  }, []);

  // Cargar items de tipología desde la BD (por id o por nombre "Geriátricos")
  useEffect(() => {
    const cargarItems = async () => {
      try {
        let arts;
        if (tipologiaId) {
          const r = await informesTemplatesAPI.getItems(tipologiaId);
          arts = (r.data || []).map(it => ({ nro: it.nro, desc: it.descripcion, grupo: it.grupo || null }));
        } else {
          const r = await informesTemplatesAPI.getTipologiaPorNombre('Geriátricos');
          setTipologiaId(r.data.id);
          if (!tipologiaNombre) setTipologiaNombre(r.data.nombre);
          arts = (r.data.items || []).map(it => ({ nro: it.nro, desc: it.descripcion, grupo: it.grupo || null }));
        }
        const lista = arts.length > 0 ? arts : ARTICULOS_FALLBACK;
        setArticulos(lista);
        setChecks(prev => ({ ...Object.fromEntries(lista.map(a => [a.nro, false])), ...prev }));
        setObsArt(prev => ({ ...Object.fromEntries(lista.map(a => [a.nro, ""])), ...prev }));
      } catch {
        setArticulos(ARTICULOS_FALLBACK);
        setChecks(prev => ({ ...Object.fromEntries(ARTICULOS_FALLBACK.map(a => [a.nro, false])), ...prev }));
        setObsArt(prev => ({ ...Object.fromEntries(ARTICULOS_FALLBACK.map(a => [a.nro, ""])), ...prev }));
      } finally {
        setLoadingArticulos(false);
      }
    };
    cargarItems();
  }, [tipologiaId]);

  // Cargar informe existente
  useEffect(() => {
    if (!esNuevo) {
      informesAPI.getById(id)
        .then(res => {
          const df = res.data.datos_formulario || {};
          setGenerales({ ...GENERALES_VACÍO, ...(df.generales || {}) });
          if (df.tipologia_id) setTipologiaId(df.tipologia_id);
          if (df.tipologia_nombre) setTipologiaNombre(df.tipologia_nombre);
          if (df.checks) setChecks(prev => ({ ...prev, ...df.checks }));
          if (df.observaciones) setObsArt(prev => ({ ...prev, ...df.observaciones }));
        })
        .catch(() => setErrorMsg("No se pudo cargar el informe."))
        .finally(() => setCargando(false));
    }
  }, [id]);

  const articulosObservados = articulos.filter(a => checks[a.nro]).map(a => ({ ...a, obs: obsArt[a.nro] || "" }));
  const totalChecked = articulosObservados.length;

  const setGen   = (fid, val) => setGenerales(g => ({ ...g, [fid]: val }));
  const setCheck = (nro, val) => setChecks(c => ({ ...c, [nro]: val }));
  const setObs   = (nro, val) => setObsArt(o => ({ ...o, [nro]: val }));

  const guardar = async () => {
    setGuardando(true); setErrorMsg("");
    const payload = {
      establecimiento_nombre: generales.nombreEst || "",
      establecimiento_direccion: generales.direccion || "",
      establecimiento_localidad: generales.barrio || "",
      expediente: generales.expDigital || generales.expPapel || "",
      fecha: generales.fecha || new Date().toISOString().split('T')[0],
      datos_formulario: { generales, checks, observaciones: obsArt, tipo: "geriatrico", tipologia_id: tipologiaId, tipologia_nombre: tipologiaNombre },
      observaciones: generales.observaciones || "",
      tipo: "geriatrico",
    };
    try {
      if (esNuevo) {
        const res = await informesAPI.create(payload);
        setGuardadoOk(true);
        setTimeout(() => navigate(`/informe/geriatricos/${res.data.id}`, { replace: true }), 600);
      } else {
        await informesAPI.update(id, payload);
        setGuardadoOk(true);
        setTimeout(() => setGuardadoOk(false), 2500);
      }
    } catch { setErrorMsg("Error al guardar. Intentá de nuevo."); }
    finally { setGuardando(false); }
  };

  const handleGenerarPDF = async () => {
    setGenerandoPDF(true); setErrorMsg("");
    try {
      const response = await api.post("/pdf/geriatrico", {
        ...generales,
        fecha: formatDate(generales.fecha),
        articulosObservados,
        tipologia_nombre: tipologiaNombre || 'Geriátricos',
      }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      const partes = [
        'Evaluación técnica Arquitectura',
        generales.nombreEst || '',
        generales.expDigital || generales.expPapel || '',
      ].filter(Boolean).join(' - ');
      link.setAttribute("download", `${partes}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { setErrorMsg("Error al generar el PDF."); }
    finally { setGenerandoPDF(false); }
  };

  const conclusionColor = {
    "ADECUADO": { bg: "#f0fdf4", border: "#86efac", text: "#15803d" },
    "OBSERVADO": { bg: "#fffbeb", border: "#fcd34d", text: "#b45309" },
    "EN ESPERA DE ACLARACION Y/O DOCUMENTACION": { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },
  }[generales.conclusion] || {};

  const tabs = ["Datos Generales", `Artículos${totalChecked > 0 ? ` (${totalChecked})` : ""}`, "Vista Previa"];

  if (cargando) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", color: "#9ca3af", fontSize: "14px" }}>
      Cargando informe...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: "860px", margin: "0 auto", padding: "1.5rem 1rem 4rem", color: "#111827" }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <button type="button" onClick={() => navigate("/informes")}
              style={{ fontSize: "12px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}>
              ← Mis Informes
            </button>
            <span style={{ color: "#d1d5db" }}>/</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", background: "#f3e8ff", padding: "2px 9px", borderRadius: "20px", letterSpacing: "0.05em" }}>
              {(tipologiaNombre || 'GERIÁTRICOS').toUpperCase()}
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
            {generales.nombreEst || (esNuevo ? "Nuevo Informe" : "Informe")}
          </h1>
          {generales.arquitecto && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>{generales.arquitecto}</p>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {guardadoOk && (
            <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              ✓ Guardado
            </span>
          )}
          <button type="button" onClick={guardar} disabled={guardando} style={{
            padding: "9px 20px", fontSize: "13px", fontWeight: 700,
            borderRadius: "8px", cursor: guardando ? "not-allowed" : "pointer",
            border: "none", background: guardando ? "#9ca3af" : "#16a34a",
            color: "#fff", transition: "background 0.15s",
          }}>
            {guardando ? "Guardando..." : esNuevo ? "Crear informe" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: "1rem", padding: "10px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#dc2626" }}>
          {errorMsg}
        </div>
      )}

      {/* ── TABS ── */}
      <div style={{ display: "flex", gap: "2px", marginBottom: "1.5rem", background: "#f3f4f6", borderRadius: "10px", padding: "4px" }}>
        {tabs.map((t, i) => (
          <button key={i} type="button" onClick={() => setStep(i)} style={{
            flex: 1, padding: "9px 12px", fontSize: "13px", fontWeight: step === i ? 700 : 400,
            color: step === i ? "#2563eb" : "#6b7280",
            background: step === i ? "#fff" : "transparent",
            border: "none", borderRadius: "8px",
            cursor: "pointer", transition: "all 0.15s",
            boxShadow: step === i ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── PASO 0: DATOS GENERALES ── */}
      {step === 0 && (
        <div>
          {SECCIONES
            .filter(sec => {
              if ((tipologiaNombre || '').toLowerCase().includes('geriátrico')) {
                return sec.titulo !== 'Radiofísica' && sec.titulo !== 'Otros';
              }
              return true;
            })
            .map(sec => (
            <div key={sec.titulo} style={S.card}>
              <p style={S.sectionTitle}>{sec.titulo}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {sec.campos.map(c => (
                  <div key={c.id} style={{ gridColumn: (c.textarea || c.fullWidth || c.tipo === "conclusion") ? "1 / -1" : "auto" }}>
                    <Campo 
                      c={c} 
                      valor={generales[c.id]} 
                      onChange={v => setGen(c.id, v)}
                      opciones={c.id === "arquitecto" ? arquitectos : c.opciones}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <BtnNav primary onClick={() => setStep(1)}>Siguiente → Artículos</BtnNav>
          </div>
        </div>
      )}

      {/* ── PASO 1: ARTÍCULOS ── */}
      {step === 1 && (
        <ArticulosStep
          articulos={articulos}
          loadingArticulos={loadingArticulos}
          checks={checks} obsArt={obsArt}
          totalChecked={totalChecked}
          setCheck={setCheck} setObs={setObs}
          onBack={() => setStep(0)} onNext={() => setStep(2)}
        />
      )}

      {/* ── PASO 2: VISTA PREVIA ── */}
      {step === 2 && (
        <div>
          {/* Cabecera del informe */}
          <div style={S.card}>
            <p style={{ ...S.sectionTitle, marginBottom: "16px" }}>Evaluación Técnica {tipologiaNombre || 'Geriátricos'} — Fiscalización Edilicia</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px", fontSize: "13px" }}>
              {[
                ["Auditor Arquitectura", generales.arquitecto],
                ["Establecimiento", generales.nombreEst],
                ["Dirección", generales.direccion],
                ["Barrio / Localidad", generales.barrio],
                ["Expte. Papel N°", generales.expPapel || "-"],
                ["Expte. Digital N°", generales.expDigital],
                ["Metros cuadrados", generales.metros2 ? generales.metros2 + " m²" : null],
                ["Fecha", generales.fecha || null],
                ["Fojas / Órdenes", generales.fojasOrdenes],
                ["Cant. camas", generales.cantCamas],
                ["Pileta", generales.pileta],
                ["Hab. Municipal", generales.habMunicipal || null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <span style={{ fontWeight: 600, color: "#6b7280" }}>{k}: </span>
                  <span style={{ color: "#111827" }}>{v}</span>
                </div>
              ))}
            </div>
            {(generales.circ || generales.manzana) && (
              <p style={{ marginTop: "10px", fontSize: "13px" }}>
                <span style={{ fontWeight: 600, color: "#6b7280" }}>Nomenclatura Catastral: </span>
                {[generales.circ && `CIRC: ${generales.circ}`, generales.seccion && `SEC: ${generales.seccion}`, generales.manzana && `MZ: ${generales.manzana}`, generales.parcela && `PARC: ${generales.parcela}`].filter(Boolean).join(" — ")}
              </p>
            )}
            {generales.observaciones && (
              <p style={{ marginTop: "10px", fontSize: "13px" }}><span style={{ fontWeight: 600, color: "#6b7280" }}>Observaciones: </span>{generales.observaciones}</p>
            )}
          </div>

          {/* Conclusión destacada */}
          {generales.conclusion && (
            <div style={{ ...S.card, background: conclusionColor.bg || "#f9fafb", border: `1.5px solid ${conclusionColor.border || "#e5e7eb"}`, marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: conclusionColor.text || "#374151" }}>
                CONCLUSIÓN: {generales.conclusion}
              </p>
            </div>
          )}

          {/* Artículos */}
          {articulosObservados.length === 0 ? (
            <div style={{ ...S.card, textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
              No hay artículos observados. Volvé a la pestaña Artículos para seleccionarlos.
            </div>
          ) : (
            articulosObservados.map(art => (
              <div key={art.nro} style={{ ...S.card, borderLeft: "4px solid #2563eb", paddingLeft: "20px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", fontFamily: "monospace", letterSpacing: "0.03em" }}>Art. {art.nro}</span>
                <p style={{ margin: "6px 0 8px", fontSize: "13px", lineHeight: "1.65", color: "#374151" }}>{art.desc}</p>
                {art.obs
                  ? <div style={{ padding: "8px 12px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "6px", fontSize: "13px", color: "#92400e" }}>
                      <strong>Observación:</strong> {art.obs}
                    </div>
                  : <p style={{ fontSize: "12px", fontStyle: "italic", color: "#9ca3af", margin: 0 }}>(sin observaciones adicionales)</p>
                }
              </div>
            ))
          )}

          <p style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic", lineHeight: 1.6, marginTop: "8px" }}>
            [*] El presente informe técnico incluye la evaluación de requisitos mínimos relacionados con normativas propias del Ministerio de Salud de la Pcia. de Córdoba.
          </p>

          {/* Botones */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", flexWrap: "wrap", gap: "10px" }}>
            <BtnNav onClick={() => setStep(1)}>← Volver a Artículos</BtnNav>
            <BtnNav primary disabled={generandoPDF} onClick={handleGenerarPDF}>
              {generandoPDF ? "Generando PDF..." : "⬇ Descargar PDF"}
            </BtnNav>
          </div>
        </div>
      )}
    </div>
  );
}
