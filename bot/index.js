const { Telegraf } = require("telegraf");
const express = require("express");
const config = require("./config");

if (!config.TELEGRAM_BOT_TOKEN) {
    console.error("❗️ TELEGRAM_BOT_TOKEN is not set.");
    process.exit(1);
}

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
const app = express();
app.use(express.json());

// Register handlers
require("./handlers/commands")(bot);
require("./handlers/messages")(bot);
require("./handlers/newMembers")(bot);
require("./handlers/callback")(bot);

// Express health check
app.get("/", (req, res) => {
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

    if (err?.response?.error_code === 429) {
        const retryAfter = err.response.parameters?.retry_after ?? 120;

        console.warn(`🚫 Rate limit! باید ${retryAfter} ثانیه صبر کنیم.`);

        setTimeout(async () => {
            try {
                await ctx.telegram.sendMessage(
                    config.ADMIN_GROUP_ID,
                    `⚠️ خطای غیرمنتظره در بات (بعد از delay):\n\n<code>${err.message}</code>\n\n` +
                        `👤 کاربر: ${ctx.from?.first_name ?? "?"} (@${
                            ctx.from?.username ?? "—"
                        })\n` +
                        `🆔 ${
                            ctx.from?.id ?? "?"
                        }\n\nhttps://dashboard.render.com/web/srv-cu55kthu0jms73feuhi0/logs\n\n@Ali_Sdg90`,
                    { parse_mode: "HTML" }
                );
            } catch (sendErr) {
                console.warn(
                    "❗️ حتی بعد از delay هم نتونستیم پیام خطا رو بفرستیم:",
                    sendErr.message
                );
            }
        }, retryAfter * 1000 + 5000);

        return;
    }

    if (ctx?.telegram) {
        try {
            await ctx.telegram.sendMessage(
                ADMIN_GROUP_ID,
                `⚠️ خطای غیرمنتظره در بات:\n\n<code>${err.message}</code>\n\n` +
                    `👤 کاربر: ${ctx.from?.first_name ?? "?"} (@${
                        ctx.from?.username ?? "—"
                    })\n` +
                    `🆔 ${ctx.from?.id ?? "?"}`,
                { parse_mode: "HTML" }
            );
        } catch (sendErr) {
            console.warn(
                "❗️ نتونستیم پیام خطا رو برای ادمین هم بفرستیم:",
                sendErr.message
            );
        }
    }
});

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
