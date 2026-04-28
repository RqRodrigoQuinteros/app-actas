// Script para cargar las 3 tipologías de unidades móviles
// Ejecutar: node seed_moviles.js (desde la carpeta backend)
require('dotenv').config();
const supabase = require('./services/supabaseClient');

function token(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60);
}

async function crearTipologia(nombre) {
  const { data, error } = await supabase
    .from('template_tipologia')
    .insert({ nombre, activo: true })
    .select()
    .single();
  if (error) throw new Error(`Error creando tipología "${nombre}": ${error.message}`);
  console.log(`  ✓ Tipología: ${nombre} (id=${data.id})`);
  return data.id;
}

async function crearSeccion(tipologia_id, titulo, orden, repetible = false, texto_previo = null) {
  const { data, error } = await supabase
    .from('template_secciones')
    .insert({ tipologia_id, titulo, orden, repetible, texto_previo })
    .select()
    .single();
  if (error) throw new Error(`Error creando sección "${titulo}": ${error.message}`);
  console.log(`    ✓ Sección: ${titulo} (id=${data.id})`);
  return data.id;
}

async function crearCampos(seccion_id, campos) {
  for (let i = 0; i < campos.length; i++) {
    const { etiqueta, tipo } = campos[i];
    const { error } = await supabase
      .from('template_campos')
      .insert({ seccion_id, etiqueta, tipo, orden: i, token: token(etiqueta) });
    if (error) throw new Error(`Error creando campo "${etiqueta}": ${error.message}`);
    console.log(`      - ${etiqueta} (${tipo})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRASLADO SOCIAL
// ─────────────────────────────────────────────────────────────────────────────
async function seedTrasladoSocial() {
  console.log('\n=== TRASLADO SOCIAL ===');
  const tid = await crearTipologia('Traslado Social');

  let sid = await crearSeccion(tid, 'Flota Vehicular', 0, true);
  await crearCampos(sid, [
    { etiqueta: 'Marca', tipo: 'texto' },
    { etiqueta: 'Modelo', tipo: 'texto' },
    { etiqueta: 'Dominio', tipo: 'texto' },
  ]);

  sid = await crearSeccion(tid, 'De las Medidas de la Unidad', 1);
  await crearCampos(sid, [
    { etiqueta: 'Largo 2.20 m.', tipo: 'tabla_unidades' },
    { etiqueta: 'Alto 1.60 m.', tipo: 'tabla_unidades' },
    { etiqueta: 'Ancho 1.60 m.', tipo: 'tabla_unidades' },
    { etiqueta: 'Inventario Actualizado', tipo: 'tabla_unidades' },
    { etiqueta: 'Tarjeta Verde', tipo: 'tabla_unidades' },
    { etiqueta: 'Verificación Técnica Vehicular', tipo: 'tabla_unidades' },
    { etiqueta: 'Inscripción Municipal', tipo: 'tabla_unidades' },
    { etiqueta: 'Ambiente Climatizado', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Estado de la Unidad', 2);
  await crearCampos(sid, [
    { etiqueta: 'Número de Interno', tipo: 'tabla_unidades' },
    { etiqueta: 'Nombre fantasía Laterales Puerta Trasera Capot', tipo: 'tabla_unidades' },
    { etiqueta: 'Iluminación interna', tipo: 'tabla_unidades' },
    { etiqueta: 'Bueno - regular - malo', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Del Habitáculo del Paciente', 3);
  await crearCampos(sid, [
    { etiqueta: 'Acceso trasero y lateral', tipo: 'tabla_unidades' },
    { etiqueta: 'Comunicación con cabina de conducción', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Cada Móvil de Traslado Contará Con', 4);
  await crearCampos(sid, [
    { etiqueta: 'Silla de ruedas o camilla con elementos de sujeción', tipo: 'tabla_unidades' },
    { etiqueta: 'Tubo de oxígeno fijo con máscara', tipo: 'tabla_unidades' },
    { etiqueta: 'Almohada', tipo: 'tabla_unidades' },
    { etiqueta: 'Frazadas (2) dos', tipo: 'tabla_unidades' },
    { etiqueta: 'Sábanas', tipo: 'tabla_unidades' },
    { etiqueta: 'Botiquín Primeros Auxilios', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Equipamiento Solicitado para Unidades Móviles de Traslado Social', 5);
  await crearCampos(sid, [
    { etiqueta: 'Maletín médico con estetoscopio', tipo: 'tabla_unidades' },
    { etiqueta: 'Tensiómetro', tipo: 'tabla_unidades' },
    { etiqueta: 'Termómetros', tipo: 'tabla_unidades' },
    { etiqueta: 'Linterna', tipo: 'tabla_unidades' },
    { etiqueta: 'Baja lenguas', tipo: 'tabla_unidades' },
    { etiqueta: 'Kit de seguridad: guantes', tipo: 'tabla_unidades' },
    { etiqueta: 'Batas', tipo: 'tabla_unidades' },
    { etiqueta: 'Barbijos', tipo: 'tabla_unidades' },
    { etiqueta: 'Gafas', tipo: 'tabla_unidades' },
    { etiqueta: 'Sujetador de tabla espinal, tipo spider straps, con 6 cinturones de altura regulable, con fijación por velcro', tipo: 'tabla_unidades' },
    { etiqueta: 'Tabla de raquis. Adulto', tipo: 'tabla_unidades' },
    { etiqueta: 'Set férulas para miembros', tipo: 'tabla_unidades' },
    { etiqueta: 'Set férulas cervicales', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Infraestructura', 6);
  await crearCampos(sid, [
    { etiqueta: 'Playa o cocheras', tipo: 'si_no' },
    { etiqueta: 'Servicio técnico mecánico', tipo: 'si_no' },
    { etiqueta: 'Medio de comunicación', tipo: 'si_no' },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// TRASLADO BAJA COMPLEJIDAD
// ─────────────────────────────────────────────────────────────────────────────
async function seedTrasladoBajaComplejidad() {
  console.log('\n=== TRASLADO BAJA COMPLEJIDAD ===');
  const tid = await crearTipologia('Traslado Baja Complejidad');

  let sid = await crearSeccion(tid, 'Flota Vehicular', 0, true);
  await crearCampos(sid, [
    { etiqueta: 'Marca', tipo: 'texto' },
    { etiqueta: 'Modelo', tipo: 'texto' },
    { etiqueta: 'Dominio', tipo: 'texto' },
  ]);

  sid = await crearSeccion(tid, 'De las Medidas de la Unidad', 1);
  await crearCampos(sid, [
    { etiqueta: 'Largo 2.20 m.', tipo: 'tabla_unidades' },
    { etiqueta: 'Alto 1.60 m.', tipo: 'tabla_unidades' },
    { etiqueta: 'Ancho 1.60 m.', tipo: 'tabla_unidades' },
    { etiqueta: 'Inventario Actualizado', tipo: 'tabla_unidades' },
    { etiqueta: 'Tarjeta Verde', tipo: 'tabla_unidades' },
    { etiqueta: 'Verificación Técnica Vehicular', tipo: 'tabla_unidades' },
    { etiqueta: 'Inscripción Municipal', tipo: 'tabla_unidades' },
    { etiqueta: 'Ambiente Climatizado', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Estado de la Unidad', 2);
  await crearCampos(sid, [
    { etiqueta: 'Número de Interno', tipo: 'tabla_unidades' },
    { etiqueta: 'Nombre fantasía Laterales Puerta Trasera Capot', tipo: 'tabla_unidades' },
    { etiqueta: 'Iluminación interna', tipo: 'tabla_unidades' },
    { etiqueta: 'Bueno - regular - malo', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Del Habitáculo del Paciente', 3);
  await crearCampos(sid, [
    { etiqueta: 'Acceso trasero y lateral', tipo: 'tabla_unidades' },
    { etiqueta: 'Comunicación con cabina de conducción', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Cada Móvil de Traslado Contará Con', 4);
  await crearCampos(sid, [
    { etiqueta: 'Silla de ruedas o camilla con elementos de sujeción', tipo: 'tabla_unidades' },
    { etiqueta: 'Tubo de oxígeno fijo con máscara', tipo: 'tabla_unidades' },
    { etiqueta: 'Almohada', tipo: 'tabla_unidades' },
    { etiqueta: 'Frazadas (2) dos', tipo: 'tabla_unidades' },
    { etiqueta: 'Sábanas', tipo: 'tabla_unidades' },
    { etiqueta: 'Botiquín Primeros Auxilios', tipo: 'tabla_unidades' },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIDADES MÓVILES DE EMERGENCIA
// ─────────────────────────────────────────────────────────────────────────────
async function seedEmergencia() {
  console.log('\n=== UNIDADES MÓVILES DE EMERGENCIA ===');
  const tid = await crearTipologia('Unidades Móviles de Emergencia');

  let sid = await crearSeccion(tid, 'Flota Vehicular', 0, true);
  await crearCampos(sid, [
    { etiqueta: 'Marca', tipo: 'texto' },
    { etiqueta: 'Modelo', tipo: 'texto' },
    { etiqueta: 'Dominio', tipo: 'texto' },
  ]);

  sid = await crearSeccion(tid, 'De las Medidas de la Unidad', 1);
  await crearCampos(sid, [
    { etiqueta: 'Largo 2.30 m.', tipo: 'tabla_unidades' },
    { etiqueta: 'Alto 1.70 m.', tipo: 'tabla_unidades' },
    { etiqueta: 'Ancho 1.70 m.', tipo: 'tabla_unidades' },
    { etiqueta: 'Inventario Actualizado', tipo: 'tabla_unidades' },
    { etiqueta: 'Tarjeta Verde', tipo: 'tabla_unidades' },
    { etiqueta: 'Verificación Técnica Vehicular', tipo: 'tabla_unidades' },
    { etiqueta: 'Inscripción Municipal', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Del Estado de la Unidad', 2);
  await crearCampos(sid, [
    { etiqueta: 'Número de Interno', tipo: 'tabla_unidades' },
    { etiqueta: 'Emergencia en Laterales Puerta Trasera y Capot', tipo: 'tabla_unidades' },
    { etiqueta: 'Bueno – regular – malo', tipo: 'tabla_unidades' },
    { etiqueta: 'Iluminación interna', tipo: 'tabla_unidades' },
    { etiqueta: 'Hermeticidad', tipo: 'tabla_unidades' },
    { etiqueta: 'Toma corriente de 12 Volts', tipo: 'tabla_unidades' },
    { etiqueta: 'Aditamento "Privado"', tipo: 'tabla_unidades' },
    { etiqueta: 'Señal acústica y óptica externa', tipo: 'tabla_unidades' },
    { etiqueta: 'Estrella de Vida', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'De los Móviles', 3);
  await crearCampos(sid, [
    { etiqueta: 'Acorde a las normas municipales vigentes', tipo: 'tabla_unidades' },
    { etiqueta: 'Luces de Balizas Externa', tipo: 'tabla_unidades' },
    { etiqueta: 'Intensidad de Sonido', tipo: 'tabla_unidades' },
    { etiqueta: 'Color del Vehículo', tipo: 'tabla_unidades' },
    { etiqueta: 'Luces Traseras', tipo: 'tabla_unidades' },
    { etiqueta: 'Asientos c/cinturón de Seguridad Inerciales', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Del Habitáculo del Paciente', 4);
  await crearCampos(sid, [
    { etiqueta: 'Acceso trasero y lateral', tipo: 'tabla_unidades' },
    { etiqueta: 'Comunicación con cabina de conducción', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Del Interior del Móvil', 5);
  await crearCampos(sid, [
    { etiqueta: 'Anaqueles y/o armarios', tipo: 'tabla_unidades' },
    { etiqueta: 'Estante y Puerta con cierre magnético y/o traba', tipo: 'tabla_unidades' },
    { etiqueta: 'Superficie Interna libre de protusiones', tipo: 'tabla_unidades' },
    { etiqueta: 'Paredes y Pisos Laminados', tipo: 'tabla_unidades' },
    { etiqueta: 'Zócalos sanitarios con elementos antideslizantes', tipo: 'tabla_unidades' },
    { etiqueta: 'Control de Temperatura y Ventilación', tipo: 'tabla_unidades' },
    { etiqueta: 'Señal acústica y óptica externa', tipo: 'tabla_unidades' },
    { etiqueta: 'Iluminación Interna', tipo: 'tabla_unidades' },
    { etiqueta: 'Espacio de 60 cm cabecera de camilla', tipo: 'tabla_unidades' },
    { etiqueta: 'Barral metálico a lo largo del Techo', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Equipamiento Solicitado para Unidades de Emergencia', 6);
  await crearCampos(sid, [
    { etiqueta: 'Un (1) tubo de oxígeno fijo y dos (2) portátiles (con acople rápido tipo Yoke)', tipo: 'tabla_unidades' },
    { etiqueta: 'Equipo de asistencia ventilatoria (Ambu, bolsa, máscara, adaptador...)', tipo: 'tabla_unidades' },
    { etiqueta: 'Respirador mecánico automático', tipo: 'tabla_unidades' },
    { etiqueta: 'Electrocardiógrafo portátil, con pasta conductora para ECG', tipo: 'tabla_unidades' },
    { etiqueta: 'Cardiodesfibrilador con monitor a batería y con toma de 220 Voltios. Con bolsas de parches', tipo: 'tabla_unidades' },
    { etiqueta: 'Set para Pericardiocentesis', tipo: 'tabla_unidades' },
    { etiqueta: 'Marcapasos transitorio externo compacto a pilas, con modos a demanda y sobre estimulación (Optativo)', tipo: 'tabla_unidades' },
    { etiqueta: 'Aspirador central con depósito de fluidos', tipo: 'tabla_unidades' },
    { etiqueta: 'Aspirador manual portátil, con pico largo de plástico extra suave adulto/pediátrico/neonatal', tipo: 'tabla_unidades' },
    { etiqueta: 'Equipos varios (cateterización mínima y material para inyectables)', tipo: 'tabla_unidades' },
    { etiqueta: 'Laringoscopio de fibra óptica. Ramas rectas y curvas, para adultos, No 0 para prematuros, No 1 para neonatos, No 2 y 3 para pediatría', tipo: 'tabla_unidades' },
    { etiqueta: 'Tubos endotraqueales de cada una de las medidas del No 2.5 a 5.5 traslúcidos', tipo: 'tabla_unidades' },
    { etiqueta: 'No 6 al 9 traslúcidos con balón de baja presión', tipo: 'tabla_unidades' },
    { etiqueta: 'Set de cricostotomia de emergencia, con cánula adulto/pediátrico/neonatológico', tipo: 'tabla_unidades' },
    { etiqueta: 'Caja de cirugía menor', tipo: 'tabla_unidades' },
    { etiqueta: 'Maletín médico con estetoscopio', tipo: 'tabla_unidades' },
    { etiqueta: 'Tensiómetro', tipo: 'tabla_unidades' },
    { etiqueta: 'Termómetros', tipo: 'tabla_unidades' },
    { etiqueta: 'Linterna', tipo: 'tabla_unidades' },
    { etiqueta: 'Bajalenguas', tipo: 'tabla_unidades' },
    { etiqueta: 'Kit de bioseguridad: guantes', tipo: 'tabla_unidades' },
    { etiqueta: 'Batas', tipo: 'tabla_unidades' },
    { etiqueta: 'Barbijos', tipo: 'tabla_unidades' },
    { etiqueta: 'Gafas', tipo: 'tabla_unidades' },
    { etiqueta: 'Chaleco de extricación de material plástico totalmente ballenado', tipo: 'tabla_unidades' },
    { etiqueta: 'Inmovilizadores latero cervicales, con suplemento occipital. Descartable', tipo: 'tabla_unidades' },
    { etiqueta: 'Juego de collares cervicales, cinco puntos de apoyo - Adultos(4) Pediátricos(2)', tipo: 'tabla_unidades' },
    { etiqueta: 'Suplementos Occipitales tipo pad pack, de 0.15 x 0.15 mts.', tipo: 'tabla_unidades' },
    { etiqueta: 'Set férulas para miembros', tipo: 'tabla_unidades' },
    { etiqueta: 'Set férulas cervicales', tipo: 'tabla_unidades' },
    { etiqueta: 'Sábanas estériles para quemados', tipo: 'tabla_unidades' },
    { etiqueta: 'Sujetador de tabla espinal, tipo spider straps, con 6 cinturones de altura regulable, con fijación por velcro', tipo: 'tabla_unidades' },
  ]);

  sid = await crearSeccion(tid, 'Equipamiento para Servicio de Emergencia - Atención de Menores', 7);
  await crearCampos(sid, [
    { etiqueta: 'Cardiodesfibrilador con monitor a batería y con toma de 220 Voltios, con paleta de cardioversión Pediátrica', tipo: 'tabla_unidades' },
    { etiqueta: 'Caja de reanimación cardio-respiratoria Pediátrica', tipo: 'tabla_unidades' },
    { etiqueta: 'Equipos varios de curación', tipo: 'tabla_unidades' },
    { etiqueta: 'Equipos varios de suturas', tipo: 'tabla_unidades' },
    { etiqueta: 'Laringoscopio con ramas neonatales y pediátricas', tipo: 'tabla_unidades' },
    { etiqueta: 'Tubos endotraqueales', tipo: 'tabla_unidades' },
    { etiqueta: 'Tensiómetro pediátrico', tipo: 'tabla_unidades' },
    { etiqueta: 'Bomba infusora parenteral', tipo: 'tabla_unidades' },
    { etiqueta: 'Ventilador neonatal', tipo: 'tabla_unidades' },
    { etiqueta: 'Oxímetro de pulso con sensores neonatales o Pediátricos', tipo: 'tabla_unidades' },
    { etiqueta: 'Sets de trauma Pediátrico', tipo: 'tabla_unidades' },
    { etiqueta: 'Halos tamaño neonatal y Pediátrico', tipo: 'tabla_unidades' },
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Iniciando carga de tipologías de unidades móviles...');
  try {
    await seedTrasladoSocial();
    await seedTrasladoBajaComplejidad();
    await seedEmergencia();
    console.log('\n✅ Carga completa.');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
