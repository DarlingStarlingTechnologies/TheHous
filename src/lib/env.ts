const required = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
] as const;

const optional = [
  "SENDGRID_API_KEY",
  "SENDGRID_FROM_EMAIL",
  "SENDGRID_FROM_NAME",
] as const;

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Check your .env file or deployment environment."
    );
  }

  const warnings: string[] = [];
  for (const key of optional) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }
  if (warnings.length > 0) {
    console.warn(
      `[ENV] Optional variables not set: ${warnings.join(", ")}. Some features may be disabled.`
    );
  }
}
