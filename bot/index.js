const { Telegraf } = require("telegraf");
const config = require("./config/config");
const spamProtection = require("./middlewares/spamProtection");
const errorHandler = require("./middlewares/errorHandler");
const { isSpamming } = require("./utils/spamProtection");

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

// Middlewares
// bot.use(spamProtection);

bot.use(async (ctx, next) => {
    if (ctx.message && ctx.message.chat.id == config.GROUP_ID) {
        const userId = ctx.from.id;

        if (
            config.userMessageCounts.has(userId) &&
            config.userMessageCounts.get(userId).banned
        ) {
            return;
        }

        if (isSpamming(userId)) {
            ctx.reply(
                `کاربر @${ctx.from.username} به دلیل ارسال پیام‌های زیاد به عنوان اسپم شناسایی شد و از گروه حذف شد.`
            );

            await ctx.kickChatMember(userId);
            config.userMessageCounts.set(userId, { banned: true });
            return;
        }
    }
    await next();
});

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
