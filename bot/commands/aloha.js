const { GROUP_ID } = require("../config/config");

const aloha = async (ctx) => {
    if (ctx.message.chat.id != GROUP_ID) {
        ctx.reply(
            "سلام\nاین بات فقط در گروه صف برنامه CS Internship قابل استفاده است.\n\nhttps://t.me/+X_TxP_odRO5iOWFi"
        );
        return;
    }

    if (ctx.message.from.username) {
        ctx.reply(`Aloha :)\n\n@${ctx.message.from.username}\n@Ali_Sdg90`);
    }
};

module.exports = { aloha };
