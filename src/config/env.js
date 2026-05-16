const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_NAME: z.string().min(1).default("DSHub Auth Service"),
  CORS_ORIGIN: z.string().default("http://localhost:3000,http://localhost:4000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  REFRESH_COOKIE_NAME: z.string().default("dshub_refresh_token"),
  REFRESH_COOKIE_MAX_AGE_MS: z.coerce.number().int().positive().default(604800000),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  ADMIN_BOOTSTRAP_NAME: z.string().optional(),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8).optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => issue.message).join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

module.exports = parsed.data;
