 import 'dotenv/config';

const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};
 export const env = {
 JWT_SECRET: need('JWT_SECRET'),
 WEB_ORIGIN: process.env.WEB_ORIGIN || 'http://localhost:3000',
 }