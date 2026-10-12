/**
 * Validates institutional email domain based on environment configuration.
 *
 * If allowedDomainsConfig is empty or not set, domain restriction is disabled
 * and any valid email is accepted.
 * If configured (e.g. "rajalakshmi.edu.in"), emails must match one of the allowed domains.
 *
 * Requirements:
 * - Proper email parsing: separate local-part and domain part.
 * - Strict format validation: rejects whitespace, multiple '@' symbols, missing parts.
 * - Case-insensitive domain comparison.
 * - Rejects lookalike domains (e.g., 'rajalakshmi.edu.in.fake.com', 'notrajalakshmi.edu.in', 'fake-rajalakshmi.edu.in').
 * - Note: Domain policy matching validates organizational affiliation eligibility for registration,
 *   but does NOT verify email inbox ownership (which requires verification tokens/links).
 */
export function validateInstitutionalEmail(
  email: string | null | undefined,
  allowedDomainsConfig?: string
): { valid: boolean; reason?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Email address is required." };
  }

  const trimmed = email.trim();

  // Strict email format validation: local-part @ domain.tld
  // Requires at least one dot in domain, no whitespace, no consecutive dots, valid labels
  const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: "Invalid email format." };
  }

  const atParts = trimmed.split("@");
  if (atParts.length !== 2) {
    return { valid: false, reason: "Invalid email format." };
  }

  const [localPart, rawDomain] = atParts;
  if (!localPart || !rawDomain) {
    return { valid: false, reason: "Invalid email format." };
  }

  const emailDomain = rawDomain.toLowerCase();

  // Domain configuration check (empty/unconfigured accepts any valid email)
  if (!allowedDomainsConfig || allowedDomainsConfig.trim() === "") {
    return { valid: true };
  }

  const allowedDomains = allowedDomainsConfig
    .split(",")
    .map((d) => d.trim().toLowerCase().replace(/^@/, "").replace(/\.+$/, ""))
    .filter(Boolean);

  if (allowedDomains.length === 0) {
    return { valid: true };
  }

  // Exact domain match only (case-insensitive)
  // Each configured domain matches strictly; subdomains (e.g. 'aids.rajalakshmi.edu.in')
  // are rejected unless explicitly configured as separate allowed domains.
  // Lookalikes such as 'notrajalakshmi.edu.in' or 'rajalakshmi.edu.in.fake.com' are strictly rejected.
  const isAllowed = allowedDomains.includes(emailDomain);

  if (!isAllowed) {
    return {
      valid: false,
      reason: `Email domain '@${emailDomain}' is not authorized. Allowed domains: ${allowedDomains.map((d) => `@${d}`).join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validates callback/redirect URLs to prevent Open Redirect attacks.
 * Only allows relative paths starting with a single '/' and not '//' or '/\'.
 */
export function validateSafeRedirect(
  targetUrl: string | null | undefined,
  fallback = "/"
): string {
  if (!targetUrl || typeof targetUrl !== "string") {
    return fallback;
  }

  const trimmed = targetUrl.trim();

  // Must begin with a single slash, not a double slash (protocol-relative), backslash, or external URL
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    // Disallow javascript: or data: pseudo-protocols
    if (trimmed.toLowerCase().includes("javascript:") || trimmed.toLowerCase().includes("data:")) {
      return fallback;
    }
    return trimmed;
  }

  return fallback;
}
