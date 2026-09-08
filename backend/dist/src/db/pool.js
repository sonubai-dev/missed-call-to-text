"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbPool = getDbPool;
const pg_1 = require("pg");
const env_1 = require("../config/env");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ name: "db-pool" });
let poolInstance = null;
function getDbPool() {
    if (!env_1.config.DATABASE_URL) {
        return null;
    }
    if (!poolInstance) {
        poolInstance = new pg_1.Pool({
            connectionString: env_1.config.DATABASE_URL,
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
//# sourceMappingURL=pool.js.map