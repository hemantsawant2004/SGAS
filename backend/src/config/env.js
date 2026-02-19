"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const need = (k) => {
    const v = process.env[k];
    if (!v)
        throw new Error(`Missing env: ${k}`);
    return v;
};
exports.env = {
    JWT_SECRET: need('JWT_SECRET'),
    WEB_ORIGIN: process.env.WEB_ORIGIN || 'http://localhost:3000',
};
