// Multi-channel notifications: email + WhatsApp + in-app.
// Uses SendGrid (email) and Twilio (WhatsApp) when env vars are provided,
// otherwise logs to console so the app still runs in dev.
const axios = require('axios');
let sgMail = null;
try { sgMail = require('@sendgrid/mail'); } catch (_) { /* optional */ }

if (sgMail && process.env.SENDGRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html, text }) {
  if (!to) return { ok: false, reason: 'no-recipient' };
  if (sgMail && process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
    await sgMail.send({ to, from: process.env.EMAIL_FROM, subject, html, text });
    return { ok: true, channel: 'sendgrid' };
  }
  console.log(`[reloop] email (dev) → ${to} :: ${subject}`);
  return { ok: true, channel: 'console' };
}

async function sendWhatsApp({ to, message }) {
  if (!to || !message) return { ok: false, reason: 'missing' };
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
