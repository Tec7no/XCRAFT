import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#0D0D0D;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">XCRAFT</h1>
            <p style="margin:4px 0 0;color:#C8A96A;font-size:10px;letter-spacing:3px;text-transform:uppercase;">Fashion Redefined</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee;">
            <p style="margin:0;color:#999999;font-size:11px;">© 2026 Xcraft. All rights reserved.</p>
            <p style="margin:8px 0 0;color:#bbbbbb;font-size:10px;">If you didn't request this, please ignore this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const sendOtpMail = async (email: string, otp: string) => {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#0D0D0D;font-size:20px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">Verify Your Email</h2>
    <p style="margin:0 0 32px;color:#666666;font-size:14px;line-height:1.6;">Use the code below to complete your registration. It's valid for <strong>5 minutes</strong>.</p>
    <div style="background:#f5f5f5;border:2px dashed #C8A96A;border-radius:4px;padding:24px;text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 8px;color:#999999;font-size:10px;letter-spacing:3px;text-transform:uppercase;">Your Verification Code</p>
      <p style="margin:0;color:#0D0D0D;font-size:42px;font-weight:900;letter-spacing:12px;font-family:monospace;">${otp}</p>
    </div>
    <p style="margin:0;color:#999999;font-size:12px;text-align:center;">Never share this code with anyone.</p>
  `);

  await transporter.sendMail({
    from: `"Xcraft" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Verification Code — Xcraft",
    text: `Your Xcraft verification code is: ${otp}. Valid for 5 minutes.`,
    html,
  });
};

export const sendResetMail = async (email: string, resetLink: string) => {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#0D0D0D;font-size:20px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">Reset Your Password</h2>
    <p style="margin:0 0 32px;color:#666666;font-size:14px;line-height:1.6;">We received a request to reset your password. Click the button below. This link expires in <strong>15 minutes</strong>.</p>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${resetLink}" style="display:inline-block;background:#0D0D0D;color:#ffffff;text-decoration:none;padding:16px 40px;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;border-radius:2px;">Reset Password</a>
    </div>
    <p style="margin:0;color:#999999;font-size:12px;text-align:center;">Or copy this link: <a href="${resetLink}" style="color:#C8A96A;">${resetLink}</a></p>
  `);

  await transporter.sendMail({
    from: `"Xcraft" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password — Xcraft",
    text: `Reset your Xcraft password: ${resetLink}`,
    html,
  });
};

export const sendMail = async (email: string, message: string) => {
  await transporter.sendMail({
    from: `"Xcraft" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Xcraft Notification",
    text: message,
  });
};