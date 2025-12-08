"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const bootstrap = async () => {
    try {
        // Vérifie que les secrets Supabase requis sont définis côté runtime
        env_1.env.requireSupabaseSecrets();
    }
    catch (err) {
        console.warn("Avertissement: variables Supabase manquantes. Certaines fonctionnalités peuvent ne pas fonctionner en local.");
    }
    const port = env_1.env.port;
    app_1.app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`API lancée sur http://localhost:${port}`);
    });
};
void bootstrap();
