const { BOT_VERSION } = require("../config/config");
const { errorReply } = require("../utils/error");

const versionCommand = async (ctx) => {
    try {
        if (ctx.from.username === "Ali_Sdg90") {
            ctx.reply(`🤖 Bot Version: ${BOT_VERSION}`);
        } else {
            await ctx.telegram.callApi("setMessageReaction", {
                chat_id: ctx.chat.id,
                message_id: ctx.message.message_id,
                reaction: [{ type: "emoji", emoji: "👀" }],
            });
        }
    } catch (error) {
        errorReply(ctx, error);
    }
};

module.exports = { versionCommand };
