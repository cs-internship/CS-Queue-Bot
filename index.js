/* eslint-disable no-console */
const { bot } = require("./bot");
const config = require("./bot/config/config");
const { startServer } = require("./bot/server");

if (!config.TELEGRAM_BOT_TOKEN) {
    console.error("❗️ TELEGRAM_BOT_TOKEN is not set.");
}

(async () => {
    try {
        console.log("Launching bot...");
        bot.launch();
        console.log("🤖 Bot launched successfully");

        startServer(config.PORT);

        console.log(`✅ Server and Bot are LIVE on port ${config.PORT}`);

        // Graceful shutdown
        process.once("SIGINT", () => bot.stop("SIGINT"));
        process.once("SIGTERM", () => bot.stop("SIGTERM"));
    } catch (err) {
        console.error("❗️ Failed to launch bot:", err);
    }
})();
