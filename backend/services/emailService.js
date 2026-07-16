const nodemailer = require('nodemailer');

// ─── Create transporter ───────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Base HTML Template ───────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkillBridge AI</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.1); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .body { padding: 32px; }
    .body h2 { color: #1e1b4b; font-size: 22px; margin-top: 0; }
    .body p { color: #4b5563; line-height: 1.6; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white !important; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .footer { padding: 20px 32px; background: #f8f9ff; text-align: center; font-size: 12px; color: #9ca3af; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ SkillBridge AI</h1>
      <p>AI-Powered Career Roadmap Generator</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© 2024 SkillBridge AI. All rights reserved.</p>
      <p>You received this email because you registered on SkillBridge AI.</p>
    </div>
  </div>
</body>
</html>`;

// ─── Send Password Reset Email ─────────────────────────────────────────────────
exports.sendPasswordReset = async (email, name, resetURL) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"SkillBridge AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔑 Reset Your SkillBridge AI Password',
    html: baseTemplate(`
      <h2>Hi ${name},</h2>
      <p>You requested to reset your password. Click the button below to set a new password.</p>
      <p>This link expires in <strong>10 minutes</strong>.</p>
      <a href="${resetURL}" class="btn">Reset Password</a>
      <div class="divider"></div>
      <p style="font-size: 13px; color: #9ca3af;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">Or paste this link: ${resetURL}</p>
    `),
  });
};

// ─── Send Welcome Email ───────────────────────────────────────────────────────
exports.sendWelcome = async (email, name) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"SkillBridge AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🚀 Welcome to SkillBridge AI!',
    html: baseTemplate(`
      <h2>Welcome aboard, ${name}! 🎉</h2>
      <p>You've successfully created your SkillBridge AI account. We're excited to help you become placement-ready!</p>
      <p>Here's how to get started:</p>
      <ol style="color: #4b5563; line-height: 2;">
        <li>Complete your profile</li>
        <li>Select your target career role</li>
        <li>Add your current skills</li>
        <li>Upload your resume (optional)</li>
        <li>Generate your AI-powered learning roadmap</li>
      </ol>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard →</a>
    `),
  });
};

// ─── Send Weekly Progress Email ───────────────────────────────────────────────
exports.sendWeeklyProgress = async (email, name, progressData) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"SkillBridge AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📊 Your Weekly Progress Report — SkillBridge AI`,
    html: baseTemplate(`
      <h2>Weekly Progress Report 📊</h2>
      <p>Hi ${name}, here's your progress summary for this week:</p>
      <div style="background: #f8f9ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p>🎯 <strong>Career Readiness:</strong> ${progressData.readinessScore}%</p>
        <p>📚 <strong>Skills Learned:</strong> ${progressData.skillsLearned?.join(', ') || 'None'}</p>
        <p>⏱️ <strong>Hours Studied:</strong> ${progressData.hoursStudied} hours</p>
        <p>✅ <strong>Roadmap Steps Completed:</strong> ${progressData.roadmapStepsCompleted}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">View Full Dashboard →</a>
    `),
  });
};
