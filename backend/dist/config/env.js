"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const required = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`La variable d'environnement ${key} est requise.`);
    }
    return value;
};
const parseOrigins = (origins) => {
    if (!origins)
        return [];
    return origins
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
};
exports.env = {
    port: Number(process.env.PORT) || 4000,
    corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,
    requireSupabaseSecrets: () => {
        required("SUPABASE_URL");
        required("SUPABASE_ANON_KEY");
        required("SUPABASE_SERVICE_ROLE_KEY");
        required("SUPABASE_JWT_SECRET");
    },
};
