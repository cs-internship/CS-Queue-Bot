const { GROUP_ID, ADMIN_GROUP_ID } = require("../config/config");
const { errorReply } = require("./errorReply");

const groupValidator = (ctx) => {
    try {
        if (
            ctx.message.chat.id != GROUP_ID &&
            ctx.message.chat.id != ADMIN_GROUP_ID
        ) {
            ctx.reply(
                "سلام\nاین بات فقط در گروه صف برنامه CS Internship قابل استفاده است.\n\nhttps://t.me/+X_TxP_odRO5iOWFi"
            );
            return false;
        }
        return true;
    } catch (error) {
        errorReply(ctx, error);
        return false;
    }
};

module.exports = { groupValidator };
