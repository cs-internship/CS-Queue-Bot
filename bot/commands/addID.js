const { createWorkItem } = require("../services/azure");
const { isAdminTalking } = require("../utils/adminChecker");
const { groupValidator } = require("../utils/groupValidator");
const { sendReaction } = require("../utils/sendReaction");

const addIDCommand = async (ctx) => {
    if (!groupValidator(ctx)) {
        return;
    }
    if (!(await isAdminTalking(ctx))) {
        sendReaction(ctx, "👀");
        return;
    }
    if (!ctx.message.reply_to_message) {
        sendReaction(ctx, "🤷‍♂️");
        return;
    }

    createWorkItem(ctx, ctx.message.reply_to_message.from, true);
};

module.exports = { addIDCommand };
