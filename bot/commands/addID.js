const { GROUP_ID } = require("../config/config");
const { createWorkItem } = require("../services/azure");
const { isAdminTalking } = require("../utils/adminChecker");
const { errorReply } = require("../utils/error");
const { sendIDKEmoji } = require("../utils/sendReaction");

const addID = async (ctx) => {
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
};

module.exports = { addID };
