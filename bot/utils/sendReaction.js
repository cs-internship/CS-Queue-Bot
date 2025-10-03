const { errorReply } = require("./error");

const sendReaction = async (ctx, emoji) => {
    if (!ctx?.chat?.id || !ctx?.message?.message_id) {
        return errorReply(
            ctx,
            new Error("Invalid context: chat or message not found.")
        );
    }

    try {
        await ctx.telegram.callApi("setMessageReaction", {
            chat_id: ctx.chat.id,
            message_id: ctx.message.message_id,
            reaction: [{ type: "emoji", emoji }],
        });
    } catch (error) {
        errorReply(ctx, error);
    }
};

module.exports = { sendReaction };
