const { Telegraf } = require("telegraf");
const config = require("./config/config");
const errorHandler = require("./middlewares/errorHandler");

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

// Middlewares
require("./middlewares/spamProtection")(bot);

// Handlers
require("./handlers/startMessage")(bot);
require("./handlers/messages")(bot);
require("./handlers/newMembers")(bot);
require("./handlers/callback")(bot);

// Commands
require("./commands/registerCommands")(bot);

// Global error handler
bot.catch(errorHandler);

module.exports = { bot };
