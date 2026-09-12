import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  JWT_SECRET: z.string().default("misscall_jwt_super_secret_signing_key_2026"),
  DATABASE_URL: z.string().optional(),
  WEBHOOK_SECRET: z.string().default("whsec_missed_call_android_secret_key_v1"),
  RAZORPAY_WEBHOOK_SECRET: z.string().default("test_secret_bypass"),
  META_VERIFY_TOKEN: z.string().default("meta_whatsapp_verify_token_secure"),
  META_APP_SECRET: z.string().default("meta_app_secret_hex_signing_key"),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

export const config = envSchema.parse(process.env);
