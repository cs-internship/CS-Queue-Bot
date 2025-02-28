require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const welcomeMessage = (username, firstName) => {
    return `سلام ${username ? "@" + username : firstName}
به گروه صف برنامه CS Internship خوش‌آمدید.

برای آشنایی با فرآیند مصاحبه، لطفاً پیام‌های پین‌شده گروه را مطالعه کنید.
اگر درباره برنامه یا فرآیند مصاحبه سؤالی داشتید، می‌توانید در گروه مطرح کنید؛ خوشحال می‌شویم راهنمایی‌تان کنیم.

موفق باشید🌱`;
};

bot.on("new_chat_members", (ctx) => {
    const newMembers = ctx.message.new_chat_members;

    newMembers.forEach((member) => {
        const username = member.username;
        const firstName = member.first_name || "";

        ctx.reply(welcomeMessage(username, firstName));
    });
});

bot.launch();
console.log("Bot is ALIVE!");

// Express Section for using port for the bot

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
