const { ADMIN_GROUP_ID, blockedUsers } = require("../config/config");
const { isSpamming } = require("../utils/spamProtection");

function escapeHtml(str = "") {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function getTehranParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Tehran",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);

    const get = (type) => parts.find((p) => p.type === type)?.value;

    const weekdayStr = get("weekday"); // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    const hour = Number(get("hour"));
    const minute = Number(get("minute"));

    const weekdayMap = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };

    return {
        dayOfWeek: weekdayMap[weekdayStr],
        hour,
        minute,
    };
}

function formatTehranDateTimeFa(date = new Date()) {
    return new Intl.DateTimeFormat("fa-IR", {
        timeZone: "Asia/Tehran",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(date);
}

module.exports = function registerPrivateMessageHandler(bot) {
    bot.on("message", async (ctx, next) => {
        const chat = ctx.chat;
        const user = ctx.from;
        let isValidUsername = false;

        if (ctx.message?.pinned_message !== undefined) {
            return;
        }

        if (chat.type !== "private") {
            await next();
            return;
        }

        if (blockedUsers.has(user.id)) {
            console.log(`⛔️ Blocked user ${user.id} tried to send a message.`);
            return;
        }

        if (isSpamming(user.id)) {
            blockedUsers.add(user.id);

            await ctx.telegram.sendMessage(
                user.id,
                "🚫 شما به دلیل ارسال بیش از حد پیام بلاک شده‌اید. از این به بعد پیام‌هایتان برای برنامه فرستاده نخواهد شد."
            );

            await ctx.telegram.sendMessage(
                ADMIN_GROUP_ID,
                `🚫 کاربر ${user.first_name ?? ""} با یوزرنیم @${
                    user.username ?? "—"
                } با آی‌دی ${user.id} به دلیل اسپم بلاک شد.\n\n#SpamBlocked`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "🔓 رفع بلاک",
                                    callback_data: `unban_${user.id}`,
                                },
                            ],
                        ],
                    },
                }
            );

            return;
        }

        const now = new Date();

        const { dayOfWeek, hour, minute } = getTehranParts(now);
        const totalMinutes = hour * 60 + minute;

        const start = 17 * 60 + 40; // 17:40
        const end = 18 * 60; // 18:00

        const isAllowedDay = dayOfWeek === 0 || dayOfWeek === 2;
        const isAllowedTime = totalMinutes >= start && totalMinutes <= end;

        const messageText =
            ctx.message.text ||
            `[پیام غیر متنی]\n\nچک کردن لاگ پیام:\nhttps://dashboard.render.com/web/srv-cu55kthu0jms73feuhi0/logs`;

        if (!ctx.message.text) {
            console.log(
                `⛔️ Non-text message from user ${user.id}:`,
                ctx.message
            );
        }

        if (
            typeof messageText === "string" &&
            messageText.startsWith("@") &&
            messageText.length > 1
        ) {
            const username = messageText.slice(1);
            const regex = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/;

            if (
                regex.test(username) &&
                !username.includes("__") &&
                !username.endsWith("_")
            ) {
                if (isAllowedDay && isAllowedTime) {
                    await ctx.reply("✅ یوزرنیم شما با موفقیت ثبت شد.");
                }
                isValidUsername = true;
            }
        }

        const timeString = formatTehranDateTimeFa(now);

        const safeMessageText = escapeHtml(String(messageText));

        await ctx.telegram.sendMessage(
            ADMIN_GROUP_ID,
            `📥 پیام جدید در PV:\n\n🕒 ${timeString}\n👤 ${user.first_name ?? ""} ${
                user.last_name ?? ""
            } (@${user.username ?? "—"})\n🆔 <code>${user.id}</code>\n\n📝 پیام:\n\n${
                isValidUsername ? "✅" : "❌"
            } <code>${safeMessageText}</code>\n\n#PrivateMessage`,
            { parse_mode: "HTML" }
        );
    });
};
