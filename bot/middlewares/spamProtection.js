const { isSpamming } = require("../utils/spamProtection");
const config = require("../config/config");

module.exports = async (bot) => {
    bot.use(async (ctx, next) => {
        console.log("Middleware: Spam Protection triggered");

        try {
            if (ctx.message && ctx.message.chat.id === config.GROUP_ID) {
                const userId = ctx.from.id;

                // بررسی banned
                const userData = config.userMessageCounts.get(userId);
                if (userData?.banned) return;

                // بررسی اسپم (اگر تابع async هست، از await استفاده کن)
                const spam = await isSpamming(userId);
                if (spam) {
                    await ctx.reply(
                        `کاربر @${ctx.from.username || ctx.from.first_name} به دلیل ارسال پیام‌های زیاد به عنوان اسپم شناسایی شد و از گروه حذف شد.`
                    );

                    await ctx.kickChatMember(userId);
                    config.userMessageCounts.set(userId, { banned: true });
                    return;
                }
            }

            await next();
        } catch (err) {
            console.error("❗️ Spam protection error:", err);
        }
    });
};
