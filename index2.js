require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const axios = require("axios");

const ORGANIZATION = "cs-internship";
const PROJECT = "CS Internship Program";
const PARENT_ID = 30789;
const WORKITEM_ID = 31256;

const SPAM_THRESHOLD = 10;
const SPAM_TIME_WINDOW = 10 * 1000;
const COMMAND_COOLDOWN = 2 * 1000;

const GROUP_ID = "-1002368870938";
const ADMIN_GROUP_ID = process.env.Admin_Group_ID;
const PAT = process.env.PAT_TOKEN;

const BOT_VERSION = "v2.1";

const userCooldowns = new Map();
const userMessageCounts = new Map();
const blockedUsers = new Set();

const AUTH = `Basic ${Buffer.from(`:${PAT}`).toString("base64")}`;
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const app = express();
app.use(express.json());

const createWorkItem = async (ctx, userData, isNewID) => {
    if (!userData.username) {
        ctx.reply(`کاربر یوزرنیم ندارد! 🤖`);
        return;
    }

    try {
        const res = await axios.get(
            `https://dev.azure.com/${ORGANIZATION}/${PROJECT}/_apis/wit/workitems/${WORKITEM_ID}?api-version=7.1-preview.3`,
            { headers: { Authorization: AUTH } }
        );

        const originalWorkItem = res.data;
        const fieldsToCopy = {
            "System.Title": `Entrance Path: @${userData.username} - ${
                (userData.first_name ? userData.first_name : "") +
                " " +
                (userData.last_name ? userData.last_name : "")
            }`,
            "System.Description": `<div style="text-align: right;">تاریخ ورود به گروه: ${new Date(
                ctx.message.date * 1000
            ).toLocaleString("fa-IR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: false,
            })}<br/></br><a href="https://t.me/c/1191433472/${
                ctx.message.message_id
            }">https://t.me/c/1191433472/${ctx.message.message_id}</a></div>`,

            "System.AreaPath": originalWorkItem.fields["System.AreaPath"],
            "System.IterationPath":
                originalWorkItem.fields["System.IterationPath"],
            "Microsoft.VSTS.Common.Priority":
                originalWorkItem.fields["Microsoft.VSTS.Common.Priority"] || 2,
        };

        const payload = Object.entries(fieldsToCopy).map(([key, value]) => ({
            op: "add",
            path: `/fields/${key}`,
            value,
        }));

        payload.push({
            op: "add",
            path: "/relations/-",
            value: {
                rel: "System.LinkTypes.Hierarchy-Reverse",
                url: `https://dev.azure.com/${ORGANIZATION}/${PROJECT}/_apis/wit/workItems/${PARENT_ID}`,
                attributes: { isLocked: false, name: "Parent" },
            },
        });

        await axios.post(
            `https://dev.azure.com/${ORGANIZATION}/${PROJECT}/_apis/wit/workitems/$Product%20Backlog%20Item?api-version=7.1-preview.3`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json-patch+json",
                    Authorization: AUTH,
                },
            }
        );
    } catch (error) {
        errorReply(ctx);
    } finally {
        if (isNewID) {
            ctx.reply(`سلام @${userData.username}
یوزرنیم شما ثبت شد.

برای آشنایی با فرآیند مصاحبه، لطفاً پیام‌های پین‌شده گروه را مطالعه کنید.
اگر درباره برنامه یا فرآیند مصاحبه سؤالی داشتید، می‌توانید در گروه مطرح کنید؛ خوشحال می‌شویم راهنمایی‌تان کنیم.

موفق باشید🌱`);
        }
    }
};

setInterval(() => {
    const now = Date.now();

    for (const [userId, data] of userMessageCounts.entries()) {
        if (data.banned) continue;

        if (Array.isArray(data)) {
            userMessageCounts.set(
                userId,
                data.filter((t) => now - t < SPAM_TIME_WINDOW)
            );

            if (userMessageCounts.get(userId).length === 0) {
                userMessageCounts.delete(userId);
            }
        }
    }

    for (const [userId, lastUsed] of userCooldowns.entries()) {
        if (now - lastUsed > COMMAND_COOLDOWN * 5) {
            userCooldowns.delete(userId);
        }
    }
}, 3 * 60 * 1000);

const sendIDKEmoji = async (ctx) => {
    try {
        await ctx.telegram.callApi("setMessageReaction", {
            chat_id: ctx.chat.id,
            message_id: ctx.message.message_id,
            reaction: [{ type: "emoji", emoji: "🤷‍♂️" }],
        });
    } catch (error) {
        errorReply(ctx);
    }
};

const errorReply = (ctx) => {
    ctx.reply("خطایی رخ داده است! 🤖");
};

const isAdminTalking = async (ctx) => {
    try {
        const member = await ctx.telegram.getChatMember(
            ctx.chat.id,
            ctx.from.id
        );

        if (member.status === "administrator" || member.status === "creator") {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        errorReply(ctx);
        return false;
    }
};

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
            errorReply(ctx);
        }
        return;
    }
});

bot.command("Ban", async (ctx) => {
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
                    "✅ شما از بلاک خارج شدید."
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

bot.on("message", async (ctx, next) => {
    const chat = ctx.chat;
    const user = ctx.from;

    if (chat.type === "private") {
        if (blockedUsers.has(user.id)) {
            console.log(`⛔️ Blocked user ${user.id} tried to send a message.`);
            return;
        }

        if (isSpamming(user.id)) {
            blockedUsers.add(user.id);

            await ctx.telegram.sendMessage(
                user.id,
                "🚫 شما به دلیل ارسال بیش از حد پیام بلاک شده‌اید. از این به بعد پیام‌هایتان برای ادمین فرستاده نخواهد شد."
            );

            await ctx.telegram.sendMessage(
                ADMIN_GROUP_ID,
                `🚫 کاربر ${user.first_name} با یوزرنیم @${
                    user.username ?? "—"
                } با آی‌دی ${user.id} به دلیل اسپم بلاک شد.\n\n#SpamBlocked`
            );

            return;
        }

        const messageText = ctx.message.text || "[پیام غیرمتنی]";
        const now = new Date();
        const timeString = now.toLocaleString("fa-IR", {
            timeZone: "Asia/Tehran",
            hour12: false,
        });

        await ctx.telegram.sendMessage(
            ADMIN_GROUP_ID,
            `📥 پیام جدید در PV:\n\n🕒 ${timeString}\n👤 ${
                user.first_name ?? ""
            } ${user.last_name ?? ""} (@${user.username ?? "—"})\n🆔 ${
                user.id
            }\n\n📝 پیام:\n\n<code>${messageText}</code>\n\n#PrivateMessage`,
            {
                parse_mode: "HTML",
            }
        );

        return;
    }

    await next();
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

const isSpamming = (userId) => {
    const now = Date.now();
    if (!userMessageCounts.has(userId)) {
        userMessageCounts.set(userId, []);
    }
    const timestamps = userMessageCounts.get(userId);
    timestamps.push(now);
    userMessageCounts.set(
        userId,
        timestamps.filter((t) => now - t < SPAM_TIME_WINDOW)
    );

    if (timestamps.length > SPAM_THRESHOLD) {
        return true;
    }
    return false;
};

const isOnCooldown = (userId) => {
    const lastUsed = userCooldowns.get(userId) || 0;
    return Date.now() - lastUsed < COMMAND_COOLDOWN;
};

bot.use(async (ctx, next) => {
    if (ctx.message && ctx.message.chat.id == GROUP_ID) {
        const userId = ctx.from.id;

        if (
            userMessageCounts.has(userId) &&
            userMessageCounts.get(userId).banned
        ) {
            return;
        }

        if (isSpamming(userId)) {
            ctx.reply(
                `کاربر @${ctx.from.username} به دلیل ارسال پیام‌های زیاد به عنوان اسپم شناسایی شد و از گروه حذف شد.`
            );

            await ctx.kickChatMember(userId);
            userMessageCounts.set(userId, { banned: true });
            return;
        }
    }
    await next();
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
            errorReply(ctx);
        }
        return;
    }

    const userId = ctx.from.id;
    if (isOnCooldown(userId)) {
        ctx.reply(`⏳ لطفاً کمی صبر کنید و سپس دوباره تلاش کنید.`);
        return;
    }
    userCooldowns.set(userId, Date.now());

    if (!ctx.message.reply_to_message) {
        sendIDKEmoji(ctx);
        return;
    }

    createWorkItem(ctx, ctx.message.reply_to_message.from, true);
});

bot.on("new_chat_members", async (ctx) => {
    if (ctx.message.chat.id != GROUP_ID) {
        ctx.reply(
            "سلام\nاین بات فقط در گروه صف برنامه CS Internship قابل استفاده است.\n\nhttps://t.me/+X_TxP_odRO5iOWFi"
        );
        return;
    }

    if (ctx.message.new_chat_participant.is_bot) {
        const botInfo =
            `🚫 ورود بات‌ به گروه مجاز نیست! 🚫\n\n` +
            `<b>نام بات:</b> ${
                ctx.message.new_chat_participant.first_name || "نامشخص"
            }\n` +
            `<b>آیدی عددی:</b> <code>${ctx.message.new_chat_participant.id}</code>\n` +
            `<b>یوزرنیم:</b> ${
                ctx.message.new_chat_participant.username
                    ? `@${ctx.message.new_chat_participant.username}`
                    : "ندارد"
            }`;

        ctx.replyWithHTML(botInfo);
        ctx.kickChatMember(ctx.message.new_chat_participant.id);
        return;
    }

    if (!ctx.message.new_chat_participant.username) {
        ctx.reply(`سلام ${ctx.message.new_chat_participant.first_name}
به گروه صف برنامه CS Internship خوش آمدید.

لطفاً برای حساب کاربری تلگرام خود یک Username تنظیم کنید و پس از انجام این کار، در گروه اطلاع دهید.
توجه داشته باشید که داشتن Username برای شرکت در جلسات گروه و همچنین جلسه مصاحبه الزامی است.

سپاس از همکاری شما 🌱`);

        return;
    }

    ctx.reply(`سلام @${ctx.message.new_chat_participant.username}
به گروه صف برنامه CS Internship خوش‌ آمدید.

برای آشنایی با فرآیند مصاحبه، لطفاً پیام‌های پین‌شده گروه را مطالعه کنید.
اگر درباره برنامه یا فرآیند مصاحبه سؤالی داشتید، می‌توانید در گروه مطرح کنید؛ خوشحال می‌شویم راهنمایی‌تان کنیم.

موفق باشید🌱`);

    createWorkItem(ctx, ctx.message.new_chat_participant, false);
});

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

// app.use(bot.webhookCallback("/bot"));
app.listen(3000, () => {
    console.log("Express server running on port 3000");
});

bot.launch();
