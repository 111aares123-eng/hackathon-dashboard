import type { EmailProvider, SendEmailOptions, SendEmailResult } from "../types";

/**
 * MockEmailProvider
 *
 * In-memory email provider for unit and integration testing.
 * Captures sent emails for assertions without making external network calls.
 */
export class MockEmailProvider implements EmailProvider {
  readonly name = "mock";
  private sentEmails: SendEmailOptions[] = [];
  private failNext = false;
  private failError = "Simulated email provider failure.";

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    if (this.failNext) {
      this.failNext = false;
      return { success: false, error: this.failError };
    }

    this.sentEmails.push({ ...options });
    return {
      success: true,
      messageId: `mock-${this.sentEmails.length}-${Date.now()}`,
    };
  }

  getSentEmails(): SendEmailOptions[] {
    return [...this.sentEmails];
  }

  getLastEmail(): SendEmailOptions | undefined {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  simulateFailure(error = "Simulated email provider failure.") {
    this.failNext = true;
    this.failError = error;
  }

  clear() {
    this.sentEmails = [];
    this.failNext = false;
  }
}
