// Multi-channel notifications: email + WhatsApp + in-app.
// Uses SendGrid (email) and Twilio (WhatsApp) when env vars are provided,
// otherwise logs to console so the app still runs in dev.
const axios = require('axios');
let sgMail = null;
try { sgMail = require('@sendgrid/mail'); } catch (_) { /* optional */ }

if (sgMail && process.env.SENDGRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html, text }) {
  if (!to) return { ok: false, reason: 'no-recipient' };

  if (process.env.BREVO_API_KEY && process.env.EMAIL_FROM) {
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { email: process.env.EMAIL_FROM, name: 'ReLoop AI' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html || `<p>${text}</p>`,
        textContent: text
      }, {
        headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
        timeout: 8000
      });
      return { ok: true, channel: 'brevo-email' };
    } catch (err) {
      console.error('[reloop] Brevo email failed:', err.response?.data || err.message);
      throw err;
    }
  }

  if (sgMail && process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
    await sgMail.send({ to, from: process.env.EMAIL_FROM, subject, html, text });
    return { ok: true, channel: 'sendgrid' };
  }
  console.log(`[reloop] email (dev) → ${to} :: ${subject}`);
  return { ok: true, channel: 'console' };
}

async function sendWhatsApp({ to, message }) {
  if (!to || !message) return { ok: false, reason: 'missing' };

  if (process.env.BREVO_API_KEY) {
    try {
      const formattedTo = to.startsWith('+') ? to : `+${to}`;
      await axios.post('https://api.brevo.com/v3/transactionalSMS/sms', {
        sender: 'ReLoop',
        recipient: formattedTo,
        content: message
      }, {
        headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
        timeout: 8000
      });
      return { ok: true, channel: 'brevo-sms' };
    } catch (err) {
      console.error('[reloop] Brevo SMS failed:', err.response?.data || err.message);
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        From: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        To:   `whatsapp:${to}`,
        Body: message,
      }).toString(),
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return { ok: true, channel: 'twilio-whatsapp' };
  }
  console.log(`[reloop] whatsapp (dev) → ${to} :: ${message}`);
  return { ok: true, channel: 'console' };
}

async function fanout({ user, subject, message, html }) {
  const jobs = [];
  if (user?.channels?.email !== false)     jobs.push(sendEmail({ to: user.email, subject, html: html || `<p>${message}</p>`, text: message }));
  if (user?.channels?.whatsapp && user.whatsappNumber) jobs.push(sendWhatsApp({ to: user.whatsappNumber, message }));
  return Promise.all(jobs);
}

module.exports = { sendEmail, sendWhatsApp, fanout };
