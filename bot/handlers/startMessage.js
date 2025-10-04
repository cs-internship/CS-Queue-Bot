const { sendReaction } = require("../utils/sendReaction");

module.exports = function startMessage(bot) {
    bot.start(async (ctx) => {
        try {
            if (ctx.chat.type !== "private") {
                sendReaction(ctx, "👀");
                return;
            }

            const sentMessage = await ctx.reply(
                `سلام ${ctx.from.first_name || ""} ${ctx.from.last_name || ""} 

برای ثبت و پیگیری حضور شما در جلسات پرسش‌وپاسخ برنامه‌ی CS Internship، لطفاً پیش از شروع جلساتی که در آن شرکت می‌کنید، یوزرنیم حساب تلگرام‌تان را از طریق پیام خصوصی برای بات ارسال کنید.

🔹 توجه داشته باشید که یوزرنیم باید با علامت @ آغاز شود (برای مثال: @yourusername).

با ارسال یوزرنیم، پس از پایان هر جلسه‌ی پرسش‌وپاسخ، کارت حضور شما توسط برگزارکننده به مرحله‌ی بعد منتقل خواهد شد.

با تشکر ☘️`
            );

            await ctx.pinChatMessage(sentMessage.message_id);

            await ctx.telegram.sendMessage(ctx.chat.id, "@yourusername");
        } catch (err) {
            console.error("Error sending or pinning the message:", err);
        }
    });
};
