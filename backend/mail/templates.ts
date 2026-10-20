export interface EmailContent {
	subject: string;
	html: string;
	text: string;
}

const escapeHtml = (value: string): string =>
	value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

const layout = (title: string, body: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">${title}</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    ${body}
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>`;

export const verificationEmail = (code: string): EmailContent => ({
	subject: "Verify your email",
	html: layout(
		"Verify Your Email",
		`<p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${escapeHtml(code)}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 24 hours.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>`,
	),
	text: `Your verification code is: ${code}\n\nEnter this code on the verification page. It expires in 24 hours.`,
});

export const welcomeEmail = (name: string): EmailContent => ({
	subject: "Welcome!",
	html: layout(
		`Welcome, ${escapeHtml(name)}!`,
		`<p>Hello ${escapeHtml(name)},</p>
    <p>Your email has been verified and your account is now active.</p>
    <p>You can log in any time to access your dashboard.</p>`,
	),
	text: `Hello ${name},\n\nYour email has been verified and your account is now active.`,
});

export const passwordResetEmail = (resetUrl: string): EmailContent => ({
	subject: "Reset your password",
	html: layout(
		"Password Reset",
		`<p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${escapeHtml(resetUrl)}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>`,
	),
	text: `Reset your password using this link (valid for 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
});

export const passwordResetSuccessEmail = (): EmailContent => ({
	subject: "Your password was changed",
	html: layout(
		"Password Reset Successful",
		`<p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">✓</div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>`,
	),
	text: "Your password has been reset successfully. If this wasn't you, contact support immediately.",
});
