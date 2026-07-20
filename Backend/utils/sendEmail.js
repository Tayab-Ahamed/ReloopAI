// ReLoop AI — SendGrid transport (soft-fails when not configured)
const sgMail = require('@sendgrid/mail');
const axios = require('axios');

const sendEmail = async (to, subject, text, html) => {
  if (process.env.BREVO_API_KEY && process.env.EMAIL_FROM) {
    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { email: process.env.EMAIL_FROM, name: 'ReLoop AI' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html || `<p>${text}</p>`,
        textContent: text || 'Please enable HTML to view this email'
      }, {
        headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
        timeout: 8000
      });
      return { ok: true, channel: 'brevo-email' };
    } catch (err) {
      console.error('[reloop] Brevo email delivery failed:', err.response?.data || err.message);
      throw err;
    }
  }

  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('Email delivery is not configured');
  }
  if (!process.env.SENDGRID_EMAIL && !process.env.EMAIL_FROM) {
    throw new Error('SENDGRID_EMAIL / EMAIL_FROM is not configured');
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_EMAIL || process.env.EMAIL_FROM,
      name: 'ReLoop AI',
    },
    subject,
    text: text || 'Please enable HTML to view this email',
    html,
  };

  try {
    const response = await sgMail.send(msg);
    return { ok: true, status: response[0].statusCode };
  } catch (error) {
    console.error('[reloop] SendGrid delivery failed');
    throw error;
  }
};

module.exports = sendEmail;
