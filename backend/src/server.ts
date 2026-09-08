import { buildApp } from "./app";
import { config } from "./config/env";

async function start() {
  const app = buildApp();

  try {
    const address = await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    app.log.info(`🚀 MissCall WhatsApp Backend running on ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
