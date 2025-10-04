const { BOT_VERSION } = require("../config/config");
const { errorReply } = require("../utils/errorReply");
const { sendReaction } = require("../utils/sendReaction");

const versionCommand = async (ctx) => {
    try {
        if (ctx.from.username === "Ali_Sdg90") {
            ctx.reply(`🤖 Bot Version: ${BOT_VERSION}`);
        } else {
            sendReaction(ctx, "👀");
        }
    } catch (error) {
        errorReply(ctx, error);
    }
};

module.exports = { versionCommand };
