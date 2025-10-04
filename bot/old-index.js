const { Telegraf } = require("telegraf");
const express = require("express");
const { isSpamming } = require("./utils/spamProtection");
const config = require("./config/config");

if (!config.TELEGRAM_BOT_TOKEN) {
    console.error("❗️ TELEGRAM_BOT_TOKEN is not set.");
    process.exit(1);
}

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
const app = express();
app.use(express.json());

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

// Register handlers
require("./handlers/startMessage")(bot);
require("./handlers/messages")(bot);
require("./handlers/newMembers")(bot);
require("./handlers/callback")(bot);

// Register commands
require("./commands/registerCommands")(bot);

// Express health check
app.get("/", (_req, res) => {
    res.send("Bot is running!");
});

app.listen(3000, () => {
    console.log("✅ Express server is running on port 3000");
});

// Handle bot launch & errors
bot.launch().then(() => {
    console.log("🤖 Bot launched successfully");
});

bot.catch(async (err, ctx) => {
    console.error("❗️Unhandled bot error:", err);

    const sendErrorToAdmin = async () => {
        try {
            await ctx.telegram.sendMessage(
                config.ADMIN_GROUP_ID,
                `⚠️ خطای غیرمنتظره در بات (بعد از delay):\n\n<code>${err.message}</code>\n\n` +
                    `👤 کاربر: ${ctx.from?.first_name ?? "?"} (@${
                        ctx.from?.username ?? "—"
                    })\n` +
                    `🆔 ${ctx.from?.id ?? "?"}\n\n` +
                    `https://dashboard.render.com/web/srv-cu55kthu0jms73feuhi0/logs\n\n@Ali_Sdg90`,
                { parse_mode: "HTML" }
            );
        } catch (sendErr) {
            console.warn(
                "❗️ Failed to send the error message to the admin group:",
                sendErr.message
            );
        }
    };

    if (err?.response?.error_code === 429) {
        const retryAfter = err.response.parameters?.retry_after ?? 120;

        console.warn(`🚫 Rate limit! >> ${retryAfter}`);

        setTimeout(sendErrorToAdmin, retryAfter * 1000 + 5000);
        return;
    }

    if (ctx?.telegram) {
        await sendErrorToAdmin();
    }
});

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
