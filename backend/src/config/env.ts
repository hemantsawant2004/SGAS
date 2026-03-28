import "dotenv/config";

const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};

const parseOrigins = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const allowedOrigins = parseOrigins(process.env.WEB_ORIGIN);

export const env = {
  JWT_SECRET: need("JWT_SECRET"),
  WEB_ORIGIN: process.env.WEB_ORIGIN || "http://localhost:3000",
  ALLOWED_ORIGINS: allowedOrigins.length
    ? allowedOrigins
    : ["http://localhost:3000", "http://localhost:5173"],
  COOKIE_SECRET: process.env.COOKIE_SECRET || "default_secret",
  COOKIE_SAME_SITE:
    process.env.COOKIE_SAME_SITE === "none" ||
    process.env.COOKIE_SAME_SITE === "strict" ||
    process.env.COOKIE_SAME_SITE === "lax"
      ? process.env.COOKIE_SAME_SITE
      : "lax",
  COOKIE_SECURE:
    process.env.COOKIE_SECURE === "true"
      ? true
      : process.env.COOKIE_SECURE === "false"
        ? false
        : process.env.NODE_ENV === "production",
};
