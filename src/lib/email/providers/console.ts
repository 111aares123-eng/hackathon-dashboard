import type { EmailProvider, SendEmailOptions, SendEmailResult } from "../types";

/**
 * ConsoleEmailProvider
 *
 * Development-only provider. Outputs formatted email details and verification link
 * directly to the terminal stdout for local verification testing without external credentials.
 */
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const divider = "=".repeat(60);
    console.info(`\n${divider}`);
    console.info(`[DEV EMAIL DELIVERY - CONSOLE PROVIDER]`);
    console.info(`To:      ${options.to}`);
    console.info(`Subject: ${options.subject}`);
    console.info(`${"-".repeat(60)}`);
    console.info(options.text);
    console.info(`${divider}\n`);

    return {
      success: true,
      messageId: `console-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }
}
