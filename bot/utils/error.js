const { ADMIN_GROUP_ID } = require("../config");

const errorReply = async (ctx, error) => {
    await ctx.reply("خطایی رخ داده است! 🤖");

    let errorText = "⚠️ *خطایی رخ داده است!*\n\n";

    if (ctx.chat) {
        errorText += `*چت:* [${
            ctx.chat.title || ctx.chat.username || ctx.chat.first_name
        }](tg://user?id=${ctx.chat.id})\n`;
        errorText += `*چت آیدی:* \`${ctx.chat.id}\`\n`;
    }

    if (ctx.from) {
        errorText += `*کاربر:* [${ctx.from.first_name}](tg://user?id=${ctx.from.id})\n`;
        errorText += `*کاربر آیدی:* \`${ctx.from.id}\`\n`;
    }

    if (error.response) {
        errorText += `\n*کد خطا:* \`${error.response.error_code}\`\n`;
        errorText += `*توضیح:* \`${error.response.description}\``;
    } else if (error.message) {
        errorText += `\n*پیام خطا:* \`${error.message}\``;
    } else {
        errorText += `\n*خطای ناشناخته:* \`${JSON.stringify(error)}\``;
    }

    errorText += `\n\n[مشاهده لاگ بات](https://dashboard.render.com/web/srv-cu55kthu0jms73feuhi0/logs)`;

    await ctx.telegram.sendMessage(ADMIN_GROUP_ID, errorText, {
        parse_mode: "Markdown",
    });
};

module.exports = { errorReply };
