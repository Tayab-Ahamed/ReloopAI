// ReLoop AI — branded OTP email template
function otpVerificationTemplate(name, otp, type) {
  const titleText   = type === 'verification' ? 'Email Verification' : 'Password Reset';
  const messageText = type === 'verification'
    ? 'Welcome to ReLoop AI. Please use the following one-time code to verify your email and finish setting up your account.'
    : 'To reset your password, use the following one-time code. If you did not request this, you can safely ignore this email.';

  const digits = String(otp || '').padEnd(6, ' ').slice(0, 6).split('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titleText} — ReLoop AI</title>
</head>
<body style="margin:0;background:#0B0B14;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#E8E8F0;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="padding:28px;border-radius:16px;background:linear-gradient(180deg,#111121 0%,#0F0F1E 100%);border:1px solid rgba(255,255,255,0.06);">
      <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:linear-gradient(90deg,#7C5CFF,#22D3B1);color:#fff;font-size:12px;letter-spacing:.14em;text-transform:uppercase;">ReLoop AI</div>
      <h1 style="margin:18px 0 8px;font-size:24px;font-weight:600;color:#fff;">${titleText}</h1>
      <p style="margin:0 0 20px;line-height:1.6;color:#B8B8CC;">Hi <strong style="color:#fff;">${name}</strong>, ${messageText}</p>
      <div style="display:flex;gap:8px;justify-content:center;margin:24px 0;">
        ${digits.map((d) => `<span style="display:inline-block;min-width:38px;padding:12px 14px;border-radius:10px;background:rgba(124,92,255,0.12);border:1px solid rgba(124,92,255,0.35);color:#fff;font-size:22px;font-weight:600;text-align:center;letter-spacing:.05em;">${d.trim() || '&nbsp;'}</span>`).join('')}
      </div>
      <p style="margin:0;color:#8E8EA8;font-size:13px;line-height:1.6;">This code expires in 10 minutes. If you didn’t request it, ignore this email.</p>
    </div>
    <p style="margin:16px 0 0;text-align:center;color:#6B6B85;font-size:12px;">© ${new Date().getFullYear()} ReLoop AI — Intelligent redistribution of surplus resources.</p>
  </div>
</body>
</html>`;
}

module.exports = otpVerificationTemplate;
