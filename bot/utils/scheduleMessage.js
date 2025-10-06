const cron = require("node-cron");
const { ADMIN_GROUP_ID } = require("../config/config");

const scheduleAdminMessage = (bot, message) => {
    // node-cron syntax: * * * * * *
    // (second, minute, hour, day of month, month, day of week)
    //
    // const cronExpression = "0 40 17 * * 0,2";
    const cronExpression = "50 52 16 * * 0,2";

    cron.schedule(
        cronExpression,
        async () => {
            try {
                await bot.telegram.sendMessage(ADMIN_GROUP_ID, "test message", {
                    parse_mode: "Markdown",
                });
                console.log(
                    `[✅] Message sent at ${new Date().toLocaleString()}`
                );
            } catch (error) {
                // errorReply(ctx, error);
                console.error("❗️ Error sending scheduled message:", error);
            }
        },
        {
            timezone: "Asia/Tehran",
        }
    );

    console.log("📆 Scheduler initialized: Sundays & Tuesdays at 17:40");
};

module.exports = { scheduleAdminMessage };
