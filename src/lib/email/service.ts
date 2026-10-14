import { env } from "@/env";
import type { EmailProvider, SendEmailResult } from "./types";
import { ConsoleEmailProvider } from "./providers/console";
import { ResendEmailProvider } from "./providers/resend";
import { MockEmailProvider } from "./providers/mock";

let customProvider: EmailProvider | null = null;

/**
 * Retrieves the currently active EmailProvider.
 * Respects override in test environments.
 */
export function getEmailProvider(): EmailProvider {
  if (customProvider) {
    return customProvider;
  }

  switch (env.EMAIL_PROVIDER) {
    case "resend":
      return new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
    case "mock":
      return new MockEmailProvider();
    case "console":
    default:
      return new ConsoleEmailProvider();
  }
}

/**
 * Sets a custom EmailProvider (primarily for unit/integration testing).
 */
export function setEmailProvider(provider: EmailProvider | null) {
  customProvider = provider;
}

/**
 * Sends the institutional email verification link to a student.
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
): Promise<SendEmailResult> {
  const provider = getEmailProvider();

  const subject = "Verify your institutional email — REC AI & DS Opportunities Portal";

  const text = `
Rajalakshmi Engineering College (Autonomous)
Department of Artificial Intelligence & Data Science

Please verify your institutional email address to complete your registration for the REC AI & DS Opportunities Portal.

Click the link below or copy and paste it into your browser to verify your email address:
${verificationUrl}

Notice:
- This single-use link will expire in 30 minutes.
- If you did not create an account on the REC AI & DS Opportunities Portal, you can safely ignore this message.
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F3EB; margin: 0; padding: 24px; color: #202820;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #DAD7CD; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(32, 40, 32, 0.04);">
    <tr>
      <td style="background-color: #344E41; padding: 20px 24px; border-bottom: 3px solid #A3B18A;">
        <h1 style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 700; letter-spacing: 0.5px;">
          RAJALAKSHMI ENGINEERING COLLEGE
        </h1>
        <p style="color: #DAD7CD; font-size: 12px; margin: 4px 0 0 0;">
          Department of Artificial Intelligence and Data Science
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 24px;">
        <h2 style="font-size: 20px; color: #202820; margin-top: 0; margin-bottom: 12px; font-weight: 700;">
          Verify Your Institutional Email
        </h2>
        <p style="font-size: 14px; line-height: 1.6; color: #586B5A; margin-bottom: 24px;">
          Thank you for creating an account on the official <strong>REC AI &amp; DS Hackathon &amp; Opportunities Portal</strong>. To activate student bookmarking and full discovery features, please verify your official college email address.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${verificationUrl}" style="background-color: #344E41; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 12px; color: #586B5A; line-height: 1.5; margin-top: 24px; border-top: 1px solid #DAD7CD; padding-top: 16px;">
          <strong>Security Notice:</strong> This single-use link will expire in <strong>30 minutes</strong>. If you did not register for this portal, please ignore this email.
        </p>
        <p style="font-size: 11px; color: #586B5A; word-break: break-all; margin-top: 12px;">
          If the button does not work, copy and paste this URL into your browser:<br>
          <a href="${verificationUrl}" style="color: #344E41; font-weight: 600;">${verificationUrl}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #F5F3EB; padding: 16px 24px; border-top: 1px solid #DAD7CD; font-size: 11px; color: #586B5A; text-align: center;">
        Rajalakshmi Nagar, Thandalam, Chennai - 602 105 • NAAC 'A++' Accredited
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return provider.sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}
