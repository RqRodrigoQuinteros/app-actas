const nodemailer = require('nodemailer');

const TRANSPORTER = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function buildAlertHtml({ inspectorNombre, actas }) {
  const rows = actas.map(a => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:13px;">${a.establecimiento_nombre || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:13px;">${a.expediente || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:13px;">${a.fecha || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#dc2626;">${a.diasVencido} días</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#1e3a5f;color:#fff;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
        <h2 style="margin:0;font-size:18px;">Ministerio de Salud - Córdoba</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:0.9;">Dirección General de Regulación Sanitaria</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 8px 8px;">
        <p style="font-size:14px;color:#374151;">Hola <strong>${inspectorNombre}</strong>,</p>
        <p style="font-size:14px;color:#374151;">Las siguientes inspecciones tienen el plazo de emplazamiento <strong style="color:#dc2626;">vencido</strong>:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Establecimiento</th>
              <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Expediente</th>
              <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Fecha</th>
              <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Vencido</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size:13px;color:#6b7280;margin-top:16px;">Por favor, regularice la situación a la brevedad.</p>
        <p style="font-size:12px;color:#9ca3af;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:12px;">
          Este es un mensaje automático del Sistema de Inspecciones Sanitarias.
        </p>
      </div>
    </div>
  `;
}

async function enviarAlertaVencimiento({ inspectorNombre, inspectorEmail, actas }) {
  if (!inspectorEmail) {
    return { success: false, error: 'Email no configurado para el inspector' };
  }

  const html = buildAlertHtml({ inspectorNombre, actas });

  try {
    const info = await TRANSPORTER.sendMail({
      from: `"Sistema Inspecciones" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: inspectorEmail,
      subject: `⚠️ Alerta de Vencimiento - ${actas.length} inspección(es) con plazo vencido`,
      html,
    });
    console.log(`[EMAIL] Alerta enviada a ${inspectorEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error enviando a ${inspectorEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { enviarAlertaVencimiento };
