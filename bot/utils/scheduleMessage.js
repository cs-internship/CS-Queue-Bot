const cron = require("node-cron");
const { ADMIN_GROUP_ID } = require("../config/config");
const { getTodayEvent } = require("./getTodayEvent");

const scheduleAdminMessage = (bot) => {
    // node-cron syntax: * * * * * *
    // (second, minute, hour, day of month, month, day of week)
    //
    const cronExpression = "0 40 17 * * 0,2"; // At 17:40 on Sunday and Tuesday

    cron.schedule(
        cronExpression,
        async () => {
            try {
                const { hasEvent, title } = getTodayEvent();

                if (!hasEvent) {
                    console.log(
                        `[ℹ️] No event today. Skipping message at ${new Date().toLocaleString()}`
                    );
                    return;
                }

                await bot.telegram.sendMessage(
                    ADMIN_GROUP_ID,
                    `سلام دوستان،
لینک جلسه‌ی ${title} از الان باز شده و تا راس ساعت ۱۸ لینک باز می‌مونه تا بتونید وارد لینک جلسه بشید.

لطفاً افرادی که وارد جلسه امروز شدند، پیش از شروع جلسه، یوزرنیم اکانت تلگرام خودشون رو از طریق پیام خصوصی برای «بات گروه صف» ارسال کنند.
این‌ کار برای به‌روزرسانی کارت حضور شما در جلسات معارفه و ورود به برنامه لازم است.

لینک بات گروه:

https://t.me/CSQueueBot`,
                    {
                        parse_mode: "Markdown",
                    }
                );
            } catch (error) {
                console.error("❗️ Error sending scheduled message:", error);

                try {
                    await bot.telegram.sendMessage(
                        ADMIN_GROUP_ID,
                        `❗️خطا در ارسال پیام زمان‌بندی‌شده:\n\`\`\`${error.message}\`\`\``,
                        { parse_mode: "Markdown" }
                    );
                } catch (innerError) {
                    console.error(
                        "❌ Failed to notify admin group about error:",
                        innerError
                    );
                }
            }
        },
        {
            timezone: "Asia/Tehran",
        }
    );
};

module.exports = { scheduleAdminMessage };
