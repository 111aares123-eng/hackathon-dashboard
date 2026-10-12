# Rajalakshmi Engineering College (Autonomous)
## Department of Artificial Intelligence & Data Science
### Opportunities & Hackathon Portal

A production-ready portal for AI & DS students to discover hackathons, workshops, conferences, and internships with institutional access governance.

---

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env` or `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables:
- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://postgres:postgres@localhost:5432/hackathon_portal`).
- `ALLOWED_INSTITUTIONAL_DOMAINS`: `rajalakshmi.edu.in` (strictly enforced exact domain).
- `APP_URL`: Base application URL (default: `http://localhost:3000`).
- `EMAIL_PROVIDER`: Email dispatch provider (`console`, `resend`, or `mock`).
  - `console` (Default for local development): Prints verification emails directly to terminal `stdout`.
  - `resend`: Production provider using Resend REST API (requires `RESEND_API_KEY`).
  - `mock`: In-memory provider for automated testing.
- `EMAIL_FROM`: Sender address header for verification emails.

### 2. Database Migrations

Ensure local PostgreSQL is running, then run schema validation and migrations:

```bash
pnpm run db:check
pnpm run db:migrate
```

### 3. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Phase 8: Institutional Email Ownership Verification

### Architecture & Security Invariants

1. **Domain Policy Enforcement:**
   - Registration strictly requires exact institutional email addresses ending in `@rajalakshmi.edu.in`.
   - Subdomains (`@aids.rajalakshmi.edu.in`), external domains, and lookalike domains are rejected.

2. **Single-Use Cryptographic Tokens:**
   - On registration or resend, a cryptographically secure 256-bit (64 hex characters) token is generated.
   - Only the **SHA-256 hash** of the token is persisted in PostgreSQL (`verification_tokens` table). Raw tokens are never stored in the database.
   - Tokens expire after **30 minutes**.
   - Creating or resending a token automatically invalidates any prior outstanding tokens for that email.

3. **Atomic Redemption:**
   - Verification links route to `/verify-email?token=<rawToken>`.
   - The token is verified against the SHA-256 hash and deleted inside a serialized database transaction to prevent concurrent or repeat reuse.
   - `users.emailVerified` is updated with the current timestamp.
   - Sensitive tokens are never leaked into server logs or audit trails.

4. **Student Feature Protection:**
   - Protected student operations (such as saving/bookmarking opportunities in `/saved` or `saveEvent`) require verified institutional emails (`assertEmailVerified`).
   - Unverified students are prompted to verify their email before managing bookmarks.

5. **Rate-Limited Resend Flow:**
   - Resend requests (`/verify-email`) enforce rate limiting (maximum 3 requests per minute per IP / email).
   - Returns generic enumeration-safe responses so external actors cannot discover if an email exists.

6. **Email Provider Abstraction:**
   - Provider interface (`EmailProvider`) decouples business logic from delivery mechanism:
     - `ConsoleEmailProvider`: Outputs formatted verification email and link to terminal stdout in local development without credentials.
     - `ResendEmailProvider`: REST-based production dispatch via native fetch; fails safely with clear errors if credentials are missing.
     - `MockEmailProvider`: In-memory provider for unit and integration testing.

---

## Verification & Testing

Run all automated test suites (including authentication, guards, event lifecycle, and email verification):

```bash
pnpm test
```

Run ESLint:

```bash
pnpm lint
```

Compile production build:

```bash
pnpm build
```
