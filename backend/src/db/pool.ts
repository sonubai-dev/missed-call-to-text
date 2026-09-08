import { Pool } from "pg";
import { config } from "../config/env";
import pino from "pino";

const logger = pino({ name: "db-pool" });

let poolInstance: Pool | null = null;

export function getDbPool(): Pool | null {
  if (!config.DATABASE_URL) {
    return null;
  }

  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: config.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    poolInstance.on("error", (err) => {
      logger.error({ err }, "Unexpected error on idle PostgreSQL client");
    });
  }

  return poolInstance;
}
