const groupIDCommand = async (ctx) => {
    ctx.reply(`🤖 Group ID: ${ctx.chat.id}`, {
        reply_markup: {
            remove_keyboard: true,
        },
    });
};

module.exports = { groupIDCommand };
