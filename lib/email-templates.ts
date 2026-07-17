/**
 * Email template for password reset
 */
export function resetPasswordEmailHtml({
  username,
  resetUrl,
}: {
  username: string;
  resetUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <tr>
            <td style="padding:40px 32px;background-color:#09090b;border:1px solid #27272a;border-radius:24px;">
              <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#ffffff;text-align:center;">
                Reset Your Password
              </h1>
              <p style="margin:0 0 24px 0;font-size:14px;color:#a1a1aa;text-align:center;">
                Hi ${username}, we received a request to reset your PFOS password.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px 0;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background-color:#ffffff;color:#000000;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#52525b;text-align:center;">
                This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Email template for email verification
 */
export function verifyEmailHtml({
  username,
  verifyUrl,
}: {
  username: string;
  verifyUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <tr>
            <td style="padding:40px 32px;background-color:#09090b;border:1px solid #27272a;border-radius:24px;">
              <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#ffffff;text-align:center;">
                Verify Your Email
              </h1>
              <p style="margin:0 0 24px 0;font-size:14px;color:#a1a1aa;text-align:center;">
                Hi ${username}, please verify your email address to secure your PFOS account.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px 0;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background-color:#ffffff;color:#000000;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#52525b;text-align:center;">
                This link expires in 1 hour.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
