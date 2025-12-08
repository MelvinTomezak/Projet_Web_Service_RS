import { app } from "./app";
import { env } from "./config/env";

const bootstrap = async (): Promise<void> => {
  try {
    // Vérifie que les secrets Supabase requis sont définis côté runtime
    env.requireSupabaseSecrets();
  } catch (err) {
    console.warn(
      "Avertissement: variables Supabase manquantes. Certaines fonctionnalités peuvent ne pas fonctionner en local.",
    );
  }

  const port = env.port;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API lancée sur http://localhost:${port}`);
  });
};

void bootstrap();

