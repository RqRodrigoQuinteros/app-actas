import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { informesAPI } from "../utils/api";
import api from "../utils/api";

const CAMPOS_GENERALES = [
  { id: "expDigital",    label: "N° Expediente Digital",     placeholder: "0425-XXXXXX/2025" },
  { id: "expPapel",      label: "N° Expediente Papel",       placeholder: "-" },
  { id: "nombreEst",     label: "Nombre del establecimiento",placeholder: "Nombre...", fullWidth: true },
  { id: "arquitecto",    label: "Nombre del Arquitecto",     placeholder: "Nombre y apellido" },
  { id: "matricula",     label: "Matrícula",                 placeholder: "N° matrícula" },
  { id: "direccion",     label: "Dirección",                 placeholder: "Av. Italia N° 1537" },
  { id: "barrio",        label: "Barrio / Localidad",        placeholder: "Río Cuarto" },
  { id: "departamento",  label: "Departamento",              placeholder: "RÍO CUARTO" },
  { id: "metros2",       label: "Metros cuadrados",          placeholder: "m²" },
  { id: "fecha",         label: "Fecha",                     placeholder: "dd/mm/aaaa" },
  { id: "fojasOrdenes",  label: "Fojas u Órdenes",           placeholder: "Nros de informe y plano", fullWidth: true },
  { id: "circ",          label: "Circunscripción",           placeholder: "1" },
  { id: "seccion",       label: "Sección",                   placeholder: "2" },
  { id: "manzana",       label: "Manzana",                   placeholder: "226" },
  { id: "parcela",       label: "Parcela",                   placeholder: "21" },
  { id: "loteOficial",   label: "Lote Oficial",              placeholder: "-" },
  { id: "cantCamas",     label: "Cantidad de camas",         placeholder: "22" },
  { id: "pileta",        label: "Pileta",                    placeholder: "SI / NO" },
  { id: "habMunicipal",  label: "Habilitación Municipal",    placeholder: "-" },
  { id: "verificarInsp", label: "Verificar en Inspección",   placeholder: "-", fullWidth: true },
  { id: "observaciones", label: "Observaciones",             placeholder: "Observaciones generales...", textarea: true },
  { id: "conclusion",    label: "Conclusión",                placeholder: "EN ESPERA DE ACLARACION Y/O DOCUMENTACION", fullWidth: true },
];

const ARTICULOS = [
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

const GENERALES_VACÍO = Object.fromEntries(CAMPOS_GENERALES.map(c => [c.id, ""]));
const CHECKS_VACÍO    = Object.fromEntries(ARTICULOS.map(a => [a.nro, false]));
const OBS_VACÍO       = Object.fromEntries(ARTICULOS.map(a => [a.nro, ""]));

function ArticuloItem({ art, checked, obsValue, onCheck, onObs }) {
  return (
    <div style={{
      borderBottom: "1px solid var(--color-border-tertiary)",
      padding: "14px 0",
      background: checked ? "var(--color-background-secondary)" : "transparent",
      borderRadius: checked ? "8px" : "0",
      paddingLeft: checked ? "12px" : "0", paddingRight: checked ? "12px" : "0",
      marginLeft: checked ? "-12px" : "0", marginRight: checked ? "-12px" : "0",
    }}>
      <label style={{ display: "flex", gap: "12px", cursor: "pointer", alignItems: "flex-start" }}>
        <input type="checkbox" checked={checked} onChange={e => onCheck(e.target.checked)}
          style={{ marginTop: "3px", width: "17px", height: "17px", flexShrink: 0, cursor: "pointer", accentColor: "#1a5fa8" }} />
        <div style={{ flex: 1 }}>
          <span style={{ display: "inline-block", fontWeight: 600, fontSize: "12px", color: "var(--color-text-secondary)", background: "var(--color-background-tertiary)", padding: "2px 7px", borderRadius: "4px", fontFamily: "var(--font-mono)", marginBottom: "5px" }}>
            Art. {art.nro}
          </span>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.55", color: "var(--color-text-primary)" }}>{art.desc}</p>
        </div>
      </label>
      {checked && (
        <div style={{ marginTop: "10px", marginLeft: "29px" }}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: "5px" }}>Observaciones</label>
          <textarea value={obsValue} onChange={e => onObs(e.target.value)} rows={3}
            placeholder="Ingrese las observaciones para este artículo..."
            style={{ width: "100%", boxSizing: "border-box", fontSize: "13px", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", resize: "vertical", fontFamily: "var(--font-sans)", lineHeight: "1.5" }} />
        </div>
      )}
    </div>
  );
}

export default function InformeArqGeriatricos() {
  const { id } = useParams();           // undefined si es /nuevo
  const navigate = useNavigate();
  const esNuevo = !id;

  const [step, setStep] = useState(0);
  const [generales, setGenerales] = useState(GENERALES_VACÍO);
  const [checks, setChecks]       = useState(CHECKS_VACÍO);
  const [observaciones, setObs]   = useState(OBS_VACÍO);

  const [guardando, setGuardando]     = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [guardadoOk, setGuardadoOk]   = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");
  const [cargando, setCargando]       = useState(!esNuevo);

  // ── Cargar informe existente ──────────────────────────────────────────────
  useEffect(() => {
    if (!esNuevo) {
      informesAPI.getById(id)
        .then(res => {
          const inf = res.data;
          const df  = inf.datos_formulario || {};
          setGenerales(df.generales || GENERALES_VACÍO);
          setChecks(df.checks     || CHECKS_VACÍO);
          setObs(df.observaciones || OBS_VACÍO);
        })
        .catch(() => setErrorMsg("No se pudo cargar el informe."))
        .finally(() => setCargando(false));
    }
  }, [id]);

  const articulosObservados = ARTICULOS.filter(a => checks[a.nro]).map(a => ({
    ...a, obs: observaciones[a.nro] || "",
  }));
  const totalChecked = articulosObservados.length;

  const setGen   = (fid, val) => setGenerales(g => ({ ...g, [fid]: val }));
  const setCheck = (nro, val) => setChecks(c => ({ ...c, [nro]: val }));
  const setObsF  = (nro, val) => setObs(o => ({ ...o, [nro]: val }));

  // ── Guardar en Supabase ───────────────────────────────────────────────────
  const guardar = async () => {
    setGuardando(true);
    setErrorMsg("");
    const payload = {
      establecimiento_nombre: generales.nombreEst || "",
      establecimiento_direccion: generales.direccion || "",
      establecimiento_localidad: generales.barrio || "",
      expediente: generales.expDigital || generales.expPapel || "",
      fecha: generales.fecha || null,
      datos_formulario: { generales, checks, observaciones },
      observaciones: generales.observaciones || "",
      tipo: "geriatrico",
    };
    try {
      if (esNuevo) {
        const res = await informesAPI.create(payload);
        setGuardadoOk(true);
        setTimeout(() => navigate(`/informe/geriatricos/${res.data.id}`, { replace: true }), 800);
      } else {
        await informesAPI.update(id, payload);
        setGuardadoOk(true);
        setTimeout(() => setGuardadoOk(false), 2500);
      }
    } catch (e) {
      setErrorMsg("Error al guardar. Intentá de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Generar PDF ───────────────────────────────────────────────────────────
  const handleGenerarPDF = async () => {
    setGenerandoPDF(true);
    setErrorMsg("");
    try {
      const response = await api.post("/pdf/geriatrico", { ...generales, articulosObservados }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `geriatrico_${generales.expDigital || generales.nombreEst || "informe"}.pdf`.replace(/[^a-zA-Z0-9_.\-]/g, "_"));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setErrorMsg("Error al generar el PDF.");
    } finally {
      setGenerandoPDF(false);
    }
  };

  const tabs = ["Datos Generales", "Artículos", "Vista Previa"];

  if (cargando) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", color: "var(--color-text-secondary)" }}>Cargando informe...</div>;
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: "820px", margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <button onClick={() => navigate("/informes")} style={{ fontSize: "12px", color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              ← Mis Informes
            </button>
            <span style={{ color: "var(--color-text-secondary)" }}>/</span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-info)", background: "var(--color-background-info)", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>Geriátricos</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {generales.nombreEst || (esNuevo ? "Nuevo Informe" : "Informe")}
          </h1>
          {generales.arquitecto && <p style={{ margin: "3px 0 0", fontSize: "13px", color: "var(--color-text-secondary)" }}>Arq. {generales.arquitecto}</p>}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {guardadoOk && <span style={{ fontSize: "13px", color: "var(--color-text-success)" }}>✓ Guardado</span>}
          <button onClick={guardar} disabled={guardando}
            style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 600, background: guardando ? "#aaa" : "#2a6" , color: "#fff", border: "none", borderRadius: "7px", cursor: guardando ? "not-allowed" : "pointer" }}>
            {guardando ? "Guardando..." : esNuevo ? "Crear informe" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ marginBottom: "1rem", padding: "10px 14px", background: "var(--color-background-danger)", borderRadius: "7px", fontSize: "13px", color: "var(--color-text-danger)" }}>
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-border-tertiary)" }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setStep(i)} style={{ padding: "8px 16px", fontSize: "13.5px", fontWeight: step === i ? 600 : 400, color: step === i ? "var(--color-text-info)" : "var(--color-text-secondary)", background: "transparent", border: "none", borderBottom: step === i ? "2px solid #1a5fa8" : "2px solid transparent", cursor: "pointer", marginBottom: "-1px", borderRadius: 0 }}>
            {t}{i === 1 && totalChecked > 0 ? ` (${totalChecked})` : ""}
          </button>
        ))}
      </div>

      {/* ── PASO 0: DATOS GENERALES ── */}
      {step === 0 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {CAMPOS_GENERALES.map(c => (
              <div key={c.id} style={{ gridColumn: (c.textarea || c.fullWidth) ? "1 / -1" : "auto" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</label>
                {c.textarea ? (
                  <textarea rows={3} value={generales[c.id]} onChange={e => setGen(c.id, e.target.value)} placeholder={c.placeholder}
                    style={{ width: "100%", boxSizing: "border-box", fontSize: "13.5px", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", resize: "vertical", fontFamily: "var(--font-sans)" }} />
                ) : (
                  <input type="text" value={generales[c.id]} onChange={e => setGen(c.id, e.target.value)} placeholder={c.placeholder}
                    style={{ width: "100%", boxSizing: "border-box", fontSize: "13.5px", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setStep(1)} style={{ padding: "9px 22px", fontSize: "14px", fontWeight: 600, background: "#1a5fa8", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer" }}>Siguiente → Artículos</button>
          </div>
        </div>
      )}

      {/* ── PASO 1: ARTÍCULOS ── */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: "1rem", padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "7px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
            Marcá los artículos que presentan observaciones. Al tildar se despliega el campo para ingresarlas.
          </div>
          {ARTICULOS.map(art => (
            <ArticuloItem key={art.nro} art={art} checked={checks[art.nro]} obsValue={observaciones[art.nro]}
              onCheck={v => setCheck(art.nro, v)} onObs={v => setObsF(art.nro, v)} />
          ))}
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(0)} style={{ padding: "9px 22px", fontSize: "14px", background: "transparent", border: "1px solid var(--color-border-secondary)", borderRadius: "7px", cursor: "pointer", color: "var(--color-text-primary)" }}>← Datos Generales</button>
            <button onClick={() => setStep(2)} style={{ padding: "9px 22px", fontSize: "14px", fontWeight: 600, background: "#1a5fa8", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer" }}>Ver Informe →</button>
          </div>
        </div>
      )}

      {/* ── PASO 2: VISTA PREVIA ── */}
      {step === 2 && (
        <div>
          <div style={{ border: "1px solid var(--color-border-secondary)", borderRadius: "8px", padding: "20px 24px", marginBottom: "1.5rem", background: "var(--color-background-secondary)" }}>
            <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>Evaluación Técnica Geriátricos — Fiscalización Edilicia</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: "13px" }}>
              {[["Auditor Arquitectura", generales.arquitecto], ["Matrícula", generales.matricula], ["Establecimiento", generales.nombreEst], ["Dirección", generales.direccion], ["Expte. Papel N°", generales.expPapel || "-"], ["Expte. Digital N°", generales.expDigital], ["Metros cuadrados", generales.metros2 ? generales.metros2 + " m²" : null], ["Fecha", generales.fecha || null], ["Fojas / Órdenes", generales.fojasOrdenes], ["Cant. camas", generales.cantCamas], ["Pileta", generales.pileta], ["Hab. Municipal", generales.habMunicipal || null]]
                .filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}><span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>{k}: </span><span>{v}</span></div>
                ))}
            </div>
            {generales.observaciones && <p style={{ marginTop: "8px", fontSize: "13px" }}><strong>Observaciones:</strong> {generales.observaciones}</p>}
            {generales.conclusion && <p style={{ marginTop: "8px", fontSize: "13px" }}><strong>Conclusión:</strong> {generales.conclusion}</p>}
          </div>

          {articulosObservados.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-secondary)", fontSize: "14px", background: "var(--color-background-secondary)", borderRadius: "8px" }}>No hay artículos observados.</div>
          ) : (
            articulosObservados.map(art => (
              <div key={art.nro} style={{ borderLeft: "3px solid #1a5fa8", paddingLeft: "16px", marginBottom: "18px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a5fa8", fontFamily: "var(--font-mono)" }}>Art. {art.nro}</span>
                <p style={{ margin: "5px 0 6px", fontSize: "13px", lineHeight: "1.6" }}>{art.desc}</p>
                {art.obs
                  ? <div style={{ fontSize: "13px", padding: "7px 11px", background: "var(--color-background-warning)", borderRadius: "5px", color: "var(--color-text-warning)" }}><strong>Observación:</strong> {art.obs}</div>
                  : <p style={{ fontSize: "12px", fontStyle: "italic", color: "var(--color-text-secondary)" }}>(sin observaciones adicionales)</p>}
              </div>
            ))
          )}

          <p style={{ marginTop: "1.5rem", fontSize: "12px", color: "var(--color-text-secondary)", fontStyle: "italic", lineHeight: 1.6 }}>
            [*] Nota: el presente informe técnico incluye la evaluación de requisitos mínimos relacionados con normativas propias del Ministerio de Salud de la Pcia. de Córdoba.
          </p>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "10px", justifyContent: "space-between", flexWrap: "wrap" }}>
            <button onClick={() => setStep(1)} style={{ padding: "9px 22px", fontSize: "14px", background: "transparent", border: "1px solid var(--color-border-secondary)", borderRadius: "7px", cursor: "pointer", color: "var(--color-text-primary)" }}>← Volver a Artículos</button>
            <button onClick={handleGenerarPDF} disabled={generandoPDF}
              style={{ padding: "9px 28px", fontSize: "14px", fontWeight: 600, background: generandoPDF ? "#888" : "#1a5fa8", color: "#fff", border: "none", borderRadius: "7px", cursor: generandoPDF ? "not-allowed" : "pointer" }}>
              {generandoPDF ? "Generando PDF..." : "⬇ Descargar PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
