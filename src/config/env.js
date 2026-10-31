import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(5000),

  CLIENT_URL: z.string().url(),

  MONGODB_URI: z.string().min(1),

  COOKIE_NAME: z.string().default("task_session"),

  COOKIE_SECURE: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default("false"),

  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),

  COOKIE_DOMAIN: z.string().optional().default(""),

  SESSION_TTL_DAYS: z.coerce.number().positive().default(7),

  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().positive().default(15),

  EMAIL_VERIFICATION_TTL_HOURS: z.coerce.number().positive().default(24),

  SMTP_HOST: z.string().optional().default(""),

  SMTP_PORT: z.coerce.number().default(587),

  SMTP_USER: z.string().optional().default(""),

  SMTP_PASSWORD: z.string().optional().default(""),

  MAIL_FROM: z.string().optional().default(""),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment configuration:",
    parsedEnv.error.flatten().fieldErrors
  );

  process.exit(1);
}

export const env = parsedEnv.data;
