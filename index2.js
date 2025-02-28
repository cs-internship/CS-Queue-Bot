require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const axios = require("axios");

const ORGANIZATION = "cs-internship";
const PROJECT = "CS Internship Program";
const PARENT_ID = 30789;
const GROUPID = "-1002368870938"; // Test group ID
const SPAM_THRESHOLD = 10;
const SPAM_TIME_WINDOW = 10 * 1000;
const COMMAND_COOLDOWN = 2 * 1000;

const workItemId = 31256;
const userCooldowns = new Map();
const userMessageCounts = new Map();

const AUTH = `Basic ${Buffer.from(`:${process.env.PAT_TOKEN}`).toString(
    "base64"
)}`;

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
            `https://dev.azure.com/${ORGANIZATION}/${PROJECT}/_apis/wit/workitems/${workItemId}?api-version=7.1-preview.3`,
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
            })}<br/></br><a href="https://t.me/${ctx.message.chat.username}/${
                ctx.message.message_id
            }">https://t.me/${ctx.message.chat.username}/${
                ctx.message.message_id
            }</a></div>`,

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

bot.command("Aloha", async (ctx) => {
    if (ctx.message.chat.id != GROUPID) {
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
    if (ctx.message && ctx.message.chat.id == GROUPID) {
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
    if (ctx.message.chat.id != GROUPID) {
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
    if (ctx.message.chat.id != GROUPID) {
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

// app.use(bot.webhookCallback("/bot"));
app.listen(3000, () => {
    console.log("Express server running on port 3000");
});

bot.launch();
