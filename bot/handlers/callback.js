const { ADMIN_GROUP_ID, blockedUsers } = require("../config");

module.exports = function registerCallbackHandler(bot) {
    bot.on("callback_query", async (ctx) => {
        const data = ctx.callbackQuery.data;
        const admin = ctx.from;

        if (data.startsWith("unban_")) {
            const userId = parseInt(data.split("_")[1]);

            if (blockedUsers.has(userId)) {
                blockedUsers.delete(userId);

                try {
                    await ctx.telegram.sendMessage(
                        userId,
                        "✅ شما توسط ادمین از بلاک خارج شدید."
                    );
                } catch (err) {
                    console.warn(
                        "❗️ ارسال پیام رفع بلاک به کاربر ممکن نبود:",
                        err.description
                    );
                }

                await ctx.telegram.sendMessage(
                    ADMIN_GROUP_ID,
                    `✅ کاربر ${userId} توسط @${admin.username} از بلاک خارج شد.\n\n#Unblock`
                );
            } else {
                await ctx.telegram.sendMessage(
                    ADMIN_GROUP_ID,
                    `ℹ️ کاربر ${userId} در لیست بلاک نبود.`
                );
            }

            await ctx.telegram.answerCbQuery(ctx.callbackQuery.id, {
                text: "✅ انجام شد.",
            });
        }
    });
};
