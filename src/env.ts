import "dotenv/config";
import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL connection string")
    .default("postgresql://postgres:postgres@localhost:5432/hackathon_portal"),
  NEXTAUTH_URL: z.string().url().optional(),
  ALLOWED_INSTITUTIONAL_DOMAINS: z
    .string()
    .default("rajalakshmi.edu.in"),
  APP_URL: z
    .string()
    .url("APP_URL must be a valid URL")
    .default("http://localhost:3000"),
  EMAIL_PROVIDER: z
    .enum(["console", "resend", "mock"])
    .default("console"),
  EMAIL_FROM: z
    .string()
    .default("REC AI & DS Opportunities Portal <noreply@rajalakshmi.edu.in>"),
  RESEND_API_KEY: z.string().optional(),
});

/**
 * Validates and parses environment variables.
 * Server-only variables are strictly encapsulated and not exported to client bundles.
 */
function getEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration. Check your .env file against .env.example.");
  }
  return parsed.data;
}

export const env = getEnv();
