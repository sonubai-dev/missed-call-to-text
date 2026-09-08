"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
async function start() {
    const app = (0, app_1.buildApp)();
    try {
        const address = await app.listen({
            port: env_1.config.PORT,
            host: env_1.config.HOST,
        });
        app.log.info(`🚀 MissCall WhatsApp Backend running on ${address}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
if (require.main === module) {
    start();
}
//# sourceMappingURL=server.js.map