const config = require("../config/config");

module.exports = async (err, ctx) => {
    console.error("❗️ Unhandled bot error:", err);

    const sendErrorToAdmin = async () => {
        try {
            await ctx.telegram.sendMessage(
                config.ADMIN_GROUP_ID,
                `⚠️ خطای غیرمنتظره در بات (بعد از delay):\n\n<code>${err.message}</code>\n\n` +
                    `👤 کاربر: ${ctx.from?.first_name ?? "?"} (@${
                        ctx.from?.username ?? "—"
                    })\n` +
                    `🆔 ${ctx.from?.id ?? "?"}\n\n` +
                    `🔗 Logs:\nhttps://dashboard.render.com/web/srv-cu55kthu0jms73feuhi0/logs\n\n@Ali_Sdg90`,
                { parse_mode: "HTML" }
            );
        } catch (sendErr) {
            console.warn(
                "❗️ Failed to send error to admin group:",
                sendErr.message
            );
        }
    };

    // Rate limit handling (429)
    if (err?.response?.error_code === 429) {
        const retryAfter = err.response.parameters?.retry_after ?? 120;
        console.warn(`🚫 Rate limit! Retrying after ${retryAfter}s`);

        setTimeout(sendErrorToAdmin, retryAfter * 1000 + 5000);
        return;
    }

    if (ctx?.telegram) {
        await sendErrorToAdmin();
    }
};
