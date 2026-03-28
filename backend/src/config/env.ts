import "dotenv/config";

type CookieSameSite = "lax" | "strict" | "none";

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
const rawCookieSameSite = process.env.COOKIE_SAME_SITE;

const cookieSameSite: CookieSameSite =
  rawCookieSameSite === "none" ||
  rawCookieSameSite === "strict" ||
  rawCookieSameSite === "lax"
    ? rawCookieSameSite
    : "lax";

export const env = {
  JWT_SECRET: need("JWT_SECRET"),
  WEB_ORIGIN: process.env.WEB_ORIGIN || "http://localhost:3000",
  ALLOWED_ORIGINS: allowedOrigins.length
    ? allowedOrigins
    : ["http://localhost:3000", "http://localhost:5173"],
  COOKIE_SECRET: process.env.COOKIE_SECRET || "default_secret",
  COOKIE_SAME_SITE: cookieSameSite,
  COOKIE_SECURE:
    process.env.COOKIE_SECURE === "true"
      ? true
      : process.env.COOKIE_SECURE === "false"
        ? false
        : process.env.NODE_ENV === "production",
};
