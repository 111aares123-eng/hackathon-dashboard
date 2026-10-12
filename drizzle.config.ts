import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load local environment files if present
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/hackathon_portal",
  },
  strict: true,
  verbose: true,
});
