const { groupValidator } = require("../utils/groupValidator");

const alohaCommand = async (ctx) => {
    if (!groupValidator(ctx)) {
        return;
    }

    if (ctx.message.from.username) {
        ctx.reply(
            `Aloha :)\n\n@${ctx.message.from.username || ctx.message.from.first_name}\n@Ali_Sdg90`
        );
    }
};

module.exports = { alohaCommand };
