// const { isOnCooldown, setCooldown } = require("../utils/cooldown");
const { createWorkItem } = require("../services/azure");
const { errorReply } = require("../utils/error");
const {
    BOT_VERSION,
    GROUP_ID,
    ADMIN_GROUP_ID,
    blockedUsers,
} = require("../config/config");
const { isAdminTalking } = require("../utils/adminChecker");

module.exports = function registerCommands(bot) {
    bot.command("Version", async (ctx) => {
        if (ctx.from.username === "Ali_Sdg90") {
            ctx.reply(`🤖 Bot Version: ${BOT_VERSION}`);
        } else {
            try {
                await ctx.telegram.callApi("setMessageReaction", {
                    chat_id: ctx.chat.id,
                    message_id: ctx.message.message_id,
                    reaction: [{ type: "emoji", emoji: "👀" }],
                });
            } catch (error) {
                errorReply(ctx, error);
            }
        }
    });

    bot.command("add_ID", async (ctx) => {
        if (ctx.message.chat.id != GROUP_ID) {
            ctx.reply(
                "سلام\nاین بات فقط در گروه صف برنامه CS Internship قابل استفاده است.\n\nhttps://t.me/+X_TxP_odRO5iOWFi"
            );
            return;
        }

        if (!(await isAdminTalking(ctx))) {
            try {
                await ctx.telegram.callApi("setMessageReaction", {
                    chat_id: ctx.chat.id,
                    message_id: ctx.message.message_id,
                    reaction: [{ type: "emoji", emoji: "👀" }],
                });
            } catch (error) {
                errorReply(ctx, error);
            }
            return;
        }

        if (!ctx.message.reply_to_message) {
            sendIDKEmoji(ctx, "🤷‍♂️");
            return;
        }

        createWorkItem(ctx, ctx.message.reply_to_message.from, true);
    });

    bot.command("Aloha", async (ctx) => {
        if (ctx.message.chat.id != GROUP_ID) {
            ctx.reply(
                "سلام\nاین بات فقط در گروه صف برنامه CS Internship قابل استفاده است.\n\nhttps://t.me/+X_TxP_odRO5iOWFi"
            );
            return;
        }

        if (ctx.message.from.username) {
            ctx.reply(`Aloha :)\n\n@${ctx.message.from.username}\n@Ali_Sdg90`);
        }
    });

    bot.command("Ban", async (ctx) => {
        if (ctx.message.chat.id != ADMIN_GROUP_ID) {
            ctx.reply(
                "سلام\nاین بات فقط در گروه صف برنامه CS Internship قابل استفاده است.\n\nhttps://t.me/+X_TxP_odRO5iOWFi"
            );
            return;
        }

        if (!(await isAdminTalking(ctx))) {
            try {
                await ctx.telegram.callApi("setMessageReaction", {
                    chat_id: ctx.chat.id,
                    message_id: ctx.message.message_id,
                    reaction: [{ type: "emoji", emoji: "👀" }],
                });
            } catch (error) {
                errorReply(ctx, error);
            }
            return;
        }

        const admin = ctx.from;

        if (!ctx.message.reply_to_message) {
            return ctx.reply(
                "❗️ برای بلاک کردن، این دستور را روی پیام کاربر ریپلای کنید."
            );
        }

        const repliedText = ctx.message.reply_to_message.text;

        const idMatch = repliedText?.match(/🆔 (\d+)/);
        if (!idMatch) {
            return ctx.reply("❗️ آی‌دی کاربر در پیام ریپلای‌شده پیدا نشد.");
        }

        const targetUserId = parseInt(idMatch[1]);

        if (isNaN(targetUserId)) {
            return ctx.reply("❗️ آی‌دی معتبر نیست.");
        }

        if (blockedUsers.has(targetUserId)) {
            return ctx.reply("ℹ️ این کاربر قبلاً بلاک شده است.");
        }

        blockedUsers.add(targetUserId);

        try {
            await ctx.telegram.sendMessage(
                targetUserId,
                "🚫 شما توسط ادمین بلاک شدید. دیگر پیام‌هایتان برای ادمین فرستاده نخواهد شد."
            );
        } catch (err) {
            console.warn("❗️ ارسال پیام به کاربر ممکن نبود:", err.description);
        }

        await ctx.telegram.sendMessage(
            ADMIN_GROUP_ID,
            `🚫 کاربر با آی‌دی ${targetUserId} توسط @${admin.username} بلاک شد.\n\n#Ban`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔓 رفع بلاک",
                                callback_data: `unban_${targetUserId}`,
                            },
                        ],
                    ],
                },
            }
        );

        await ctx.reply("🚫 کاربر با موفقیت بلاک شد.");
    });
};
