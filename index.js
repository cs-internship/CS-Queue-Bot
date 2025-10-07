const { bot } = require("./bot");
const { startServer } = require("./bot/server");
const config = require("./bot/config/config");

console.log("Starting bot with the following configuration:");
console.log({
    BOT_VERSION: config.BOT_VERSION,
    PORT: config.PORT,
    GROUP_ID: config.GROUP_ID ? "SET" : "NOT SET",
    ADMIN_GROUP_ID: config.ADMIN_GROUP_ID ? "SET" : "NOT SET",
    ORGANIZATION: config.ORGANIZATION,
    PROJECT: config.PROJECT,
    PARENT_ID: config.PARENT_ID,
    WORKITEM_ID: config.WORKITEM_ID,
    startCalendarDate: config.startCalendarDate,
    TELEGRAM_BOT_TOKEN: config.TELEGRAM_BOT_TOKEN ? "SET" : "NOT SET",
    PAT_TOKEN: config.PAT_TOKEN ? "SET" : "NOT SET",
});

if (!config.TELEGRAM_BOT_TOKEN) {
    console.error("❗️ TELEGRAM_BOT_TOKEN is not set.");
    process.exit(1);
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
        process.exit(1);
    }
})();
