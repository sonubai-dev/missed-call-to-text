"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z.coerce.number().default(4000),
    HOST: zod_1.z.string().default("0.0.0.0"),
    JWT_SECRET: zod_1.z.string().default("misscall_jwt_super_secret_signing_key_2026"),
    DATABASE_URL: zod_1.z.string().optional(),
    WEBHOOK_SECRET: zod_1.z.string().default("whsec_missed_call_android_secret_key_v1"),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().default("test_secret_bypass"),
    META_VERIFY_TOKEN: zod_1.z.string().default("meta_whatsapp_verify_token_secure"),
    META_APP_SECRET: zod_1.z.string().default("meta_app_secret_hex_signing_key"),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().default(100),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().default(60000),
});
exports.config = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map