const { isSpamming } = require("../utils/spamProtection");
const config = require("../config/config");

module.exports = async (bot) => {
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
};
