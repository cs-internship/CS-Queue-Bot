require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const axios = require("axios");

const ORGANIZATION = "cs-internship";
const PROJECT = "CS Internship Program";
const PARENT_ID = 30789;
const workItemId = 30791;
const groupID = "-1002368870938"; // Test group ID

const AUTH = `Basic ${Buffer.from(`:${process.env.PAT_TOKEN}`).toString(
    "base64"
)}`;

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const app = express();
app.use(express.json());

const createWorkItem = async (ctx, userData, isNewID) => {
    try {
        ctx.reply(`در حال دریافت اطلاعات Work Item ${workItemId}...`);

        console.log(ctx.message);

        const res = await axios.get(
            `https://dev.azure.com/${ORGANIZATION}/${PROJECT}/_apis/wit/workitems/${workItemId}?api-version=7.1-preview.3`,
            { headers: { Authorization: AUTH } }
        );

        const originalWorkItem = res.data;
        const fieldsToCopy = {
            "System.Title": `Entrance Path: @${userData.username} - ${
                userData.first_name
                    ? userData.first_name
                    : "" + " " + userData?.last_name
                    ? userData.last_name
                    : ""
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

        ctx.reply("در حال ایجاد کلون جدید...");
        const createRes = await axios.post(
            `https://dev.azure.com/${ORGANIZATION}/${PROJECT}/_apis/wit/workitems/$Task?api-version=7.1-preview.3`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json-patch+json",
                    Authorization: AUTH,
                },
            }
        );

        ctx.reply(`کلون با موفقیت ایجاد شد! ID: ${createRes.data.id}`);
    } catch (error) {
        console.error("Error cloning work item >>", error);
        ctx.reply("خطا در کلون کردن Work Item.");
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

bot.command("add_ID", async (ctx) => {
    if (!ctx.message.reply_to_message) {
        await ctx.telegram.callApi("setMessageReaction", {
            chat_id: ctx.chat.id,
            message_id: ctx.message.message_id,
            reaction: [{ type: "emoji", emoji: "🤷‍♂️" }],
        });
        return;
    }

    ctx.reply("@" + ctx.message.reply_to_message.from.username);

    createWorkItem(ctx, ctx.message.reply_to_message.from, true);
});

bot.on("new_chat_members", async (ctx) => {
    if (ctx.message.chat.id != groupID) {
        ctx.reply(
            "سلام\nاین بات فقط در گروه صف برنامه CS Internship قابل استفاده است.\n\nhttps://t.me/+X_TxP_odRO5iOWFi"
        );
        return;
    }

    if (ctx.message.new_chat_participant.is_bot) {
        const botInfo =
            `🚫 ورود بات‌ها به گروه مجاز نیست! 🚫\n\n` +
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

app.use(bot.webhookCallback("/bot"));
app.listen(3000, () => {
    console.log("Express server running on port 3000");
});

bot.launch();
