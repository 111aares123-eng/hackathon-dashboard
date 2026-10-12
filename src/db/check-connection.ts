import { pool } from "./index";
import { checkDatabaseHealth } from "./health";
import { env } from "@/env";

async function main() {
  console.log("--------------------------------------------------");
  console.log("REC AI & DS Opportunities Portal - DB Health Probe");
  console.log("--------------------------------------------------");
  console.log(`Configured DATABASE_URL: ${env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log("Testing PostgreSQL connection...");

  const health = await checkDatabaseHealth();

  if (health.connected) {
    console.log(`✓ PostgreSQL connection successful (Latency: ${health.latencyMs}ms)`);
    process.exit(0);
  } else {
    console.error(`✗ PostgreSQL connection failed: ${health.error}`);
    console.log("\nAction required:");
    console.log("1. Ensure Docker Desktop is running and execute: docker compose up -d");
    console.log("2. Or ensure local PostgreSQL service is running on port 5432.");
    console.log("3. Verify credentials in .env against .env.example.");
    process.exit(1);
  }
}

main().finally(async () => {
  await pool.end();
});
