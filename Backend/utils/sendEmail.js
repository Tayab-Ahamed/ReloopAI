// ReLoop AI — SendGrid transport (soft-fails when not configured)
const sgMail = require('@sendgrid/mail');

const sendEmail = async (to, subject, text, html) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[reloop] SENDGRID_API_KEY not set — skipping email to', to);
    console.warn(`[reloop] [MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return { skipped: true };
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
    console.error('[reloop] SendGrid error:', error.message, error.response?.body?.errors);
    throw error;
  }
};

module.exports = sendEmail;
