// Edge Function: notify-devoto
// Se dispara via Database Webhook cuando se inserta una fila en public.devotos
// Envía un email a dulcinea@elviajededulcinea.es con los datos del devoto
// y un enlace directo para aprobar su acceso en Supabase.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_PROJECT = 'mjdaeihmvlkhajmpxuet';

serve(async (req: Request) => {
  try {
    // Supabase Database Webhooks envían un POST con el payload del registro
    const payload = await req.json();

    // El webhook de Supabase envuelve el registro en { type, table, record, ... }
    const devoto = payload.record ?? payload;

    const nombre  = devoto.nombre  || '(sin nombre)';
    const correo  = devoto.correo  || '(sin correo)';
    const ciudad  = devoto.ciudad  || '—';
    const red     = devoto.red     || '—';
    const usuario = devoto.usuario || '—';
    const id      = devoto.id      || '';
    const fecha   = new Date(devoto.creado_en || Date.now()).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

    // URL directa al Table Editor de Supabase para aprobar al devoto
    const urlAprobar = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/editor?schema=public&table=devotos`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva solicitud de Devoto</title>
</head>
<body style="margin:0;padding:0;background:#0e0c0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;padding:32px 16px;">
    <tr>
      <td>
        <!-- Cabecera -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid #C9A24B;padding-bottom:20px;margin-bottom:28px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:#C9A24B;text-transform:uppercase;">El Viaje de Dulcinea del Toboso</p>
              <h1 style="margin:0;font-size:26px;font-weight:400;color:#f5edda;line-height:1.2;">Nueva solicitud de Devoto</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#9e8e78;">${fecha}</p>
            </td>
          </tr>
        </table>

        <!-- Datos del devoto -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(201,162,75,0.2);border-radius:6px;padding:24px;margin-bottom:28px;">
          <tr><td style="padding-bottom:16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:130px;font-size:11px;letter-spacing:2px;color:#C9A24B;vertical-align:top;padding-bottom:12px;text-transform:uppercase;">Nombre</td>
                <td style="font-size:16px;color:#f5edda;padding-bottom:12px;">${nombre}</td>
              </tr>
              <tr>
                <td style="width:130px;font-size:11px;letter-spacing:2px;color:#C9A24B;vertical-align:top;padding-bottom:12px;text-transform:uppercase;">Correo</td>
                <td style="font-size:16px;color:#f5edda;padding-bottom:12px;"><a href="mailto:${correo}" style="color:#f5edda;text-decoration:none;">${correo}</a></td>
              </tr>
              <tr>
                <td style="width:130px;font-size:11px;letter-spacing:2px;color:#C9A24B;vertical-align:top;padding-bottom:12px;text-transform:uppercase;">Ciudad</td>
                <td style="font-size:16px;color:#f5edda;padding-bottom:12px;">${ciudad}</td>
              </tr>
              <tr>
                <td style="width:130px;font-size:11px;letter-spacing:2px;color:#C9A24B;vertical-align:top;padding-bottom:12px;text-transform:uppercase;">Red social</td>
                <td style="font-size:16px;color:#f5edda;padding-bottom:12px;">${red}</td>
              </tr>
              <tr>
                <td style="width:130px;font-size:11px;letter-spacing:2px;color:#C9A24B;vertical-align:top;text-transform:uppercase;">Usuario</td>
                <td style="font-size:16px;color:#f5edda;">${usuario}</td>
              </tr>
            </table>
          </td></tr>
        </table>

        <!-- Botón aprobar -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="${urlAprobar}"
                 style="display:inline-block;padding:14px 36px;background:#C9A24B;border-radius:3px;color:#0e0c0a;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:1px;">
                Aprobar acceso →
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:10px;">
              <p style="margin:0;font-size:12px;color:#9e8e78;">
                En Supabase, busca la fila con el correo <strong style="color:#C9A24B;">${correo}</strong><br>
                y cambia <code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:2px;color:#f5edda;">aprobado</code> a <code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:2px;color:#f5edda;">true</code>.
              </p>
            </td>
          </tr>
        </table>

        <!-- Pie -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(201,162,75,0.15);padding-top:20px;">
          <tr>
            <td align="center">
              <p style="margin:0;font-size:11px;color:#9e8e78;opacity:.6;">
                El Viaje de Dulcinea del Toboso · elviajededulcinea.es
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

    // Enviar con Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'El Viaje de Dulcinea <dulcinea@elviajededulcinea.es>',
        to:      ['dulcinea@elviajededulcinea.es'],
        subject: `🕯 Nuevo Devoto: ${nombre} (${correo})`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (e) {
    console.error('notify-devoto error:', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
