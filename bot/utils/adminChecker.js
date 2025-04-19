const isAdminTalking = async (ctx) => {
    try {
        const member = await ctx.telegram.getChatMember(
            ctx.chat.id,
            ctx.from.id
        );

        if (member.status === "administrator" || member.status === "creator") {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        errorReply(ctx);
        return false;
    }
};

module.exports = { isAdminTalking };
