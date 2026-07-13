// ReLoop AI — welcome / registration confirmation email
function RegisteredTemplate(name = 'there') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ReLoop AI</title>
</head>
<body style="margin:0;background:#0B0B14;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#E8E8F0;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="padding:28px;border-radius:16px;background:linear-gradient(180deg,#111121 0%,#0F0F1E 100%);border:1px solid rgba(255,255,255,0.06);">
      <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:linear-gradient(90deg,#7C5CFF,#22D3B1);color:#fff;font-size:12px;letter-spacing:.14em;text-transform:uppercase;">Welcome</div>
      <h1 style="margin:18px 0 8px;font-size:26px;font-weight:600;color:#fff;">You're in the loop, ${name} 👋</h1>
      <p style="margin:0 0 16px;line-height:1.7;color:#B8B8CC;">
        ReLoop AI matches surplus resources — food, electronics, furniture, books, clothes, medical supplies, and recyclables — with the right recipient using Vision AI, OCR, LLMs, and n8n automation.
      </p>
      <ul style="padding-left:18px;margin:0 0 20px;color:#B8B8CC;line-height:1.8;">
        <li>Upload a photo — the AI writes the listing for you</li>
        <li>Smart matching to NGOs, volunteers, and recyclers nearby</li>
        <li>Automated pickups with route planning and reminders</li>
        <li>An AI-generated impact report after every donation</li>
      </ul>
      <a href="${process.env.PUBLIC_APP_URL || '#'}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:linear-gradient(90deg,#7C5CFF,#22D3B1);color:#fff;text-decoration:none;font-weight:600;">Open my dashboard</a>
    </div>
    <p style="margin:16px 0 0;text-align:center;color:#6B6B85;font-size:12px;">© ${new Date().getFullYear()} ReLoop AI — Intelligent redistribution of surplus resources.</p>
  </div>
</body>
</html>`;
}

module.exports = RegisteredTemplate;
