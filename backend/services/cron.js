const cron = require('node-cron');
const { enviarAlertasPendientes } = require('./vencimientoService');

function iniciarCron() {
  const schedule = process.env.CRON_SCHEDULE || '0 8 * * *';
  const habilitado = process.env.CRON_HABILITADO !== 'false';

  if (!habilitado) {
    console.log('[CRON] Scheduler deshabilitado via CRON_HABILITADO=false');
    return;
  }

  if (!cron.validate(schedule)) {
    console.error(`[CRON] Expresión inválida: "${schedule}". Se usará default "0 8 * * *"`);
  }

  const tarea = cron.schedule(schedule, async () => {
    console.log(`[CRON] Ejecutando revisión programada: ${new Date().toISOString()}`);
    try {
      const resultado = await enviarAlertasPendientes();
      console.log(`[CRON] Resultado: ${JSON.stringify(resultado)}`);
    } catch (err) {
      console.error(`[CRON] Error en ejecución:`, err.message);
    }
  }, {
    scheduled: true,
    timezone: 'America/Argentina/Buenos_Aires',
  });

  console.log(`[CRON] Scheduler iniciado con schedule: ${schedule} (Timezone: America/Argentina/Buenos_Aires)`);
  return tarea;
}

module.exports = { iniciarCron };
