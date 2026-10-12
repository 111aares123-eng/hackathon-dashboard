import type { EmailProvider, SendEmailOptions, SendEmailResult } from "../types";

/**
 * ResendEmailProvider
 *
 * Production email delivery provider using the Resend REST API via native fetch.
 * Does not require external SDK dependencies.
 */
export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";
  private readonly apiKey: string;
  private readonly from: string;

  constructor(apiKey?: string, from = "REC AI & DS Opportunities Portal <noreply@rajalakshmi.edu.in>") {
    this.apiKey = apiKey || "";
    this.from = from;
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.apiKey || this.apiKey.trim() === "") {
      const err = "Email delivery failed: RESEND_API_KEY environment variable is not configured.";
      console.error(err);
      return { success: false, error: err };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.from,
          to: [options.to],
          subject: options.subject,
          text: options.text,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          (errorData as { message?: string }).message ||
          `Resend API error HTTP ${response.status}: ${response.statusText}`;
        console.error("Resend API error:", message);
        return { success: false, error: message };
      }

      const data = (await response.json()) as { id?: string };
      return {
        success: true,
        messageId: data.id || `resend-${Date.now()}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error during email dispatch.";
      console.error("Resend dispatch network error:", message);
      return { success: false, error: message };
    }
  }
}
