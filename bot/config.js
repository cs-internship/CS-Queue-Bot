require("dotenv").config();

module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    PAT_TOKEN: process.env.PAT_TOKEN,
    ADMIN_GROUP_ID: process.env.Admin_Group_ID,
    GROUP_ID: "-1002368870938",
    ORGANIZATION: "cs-internship",
    PROJECT: "CS Internship Program",
    PARENT_ID: 30789,
    WORKITEM_ID: 31256,
    BOT_VERSION: "v2.1",
    SPAM_THRESHOLD: 10,
    SPAM_TIME_WINDOW: 10 * 1000,
    COMMAND_COOLDOWN: 2 * 1000,
    blockedUsers: new Set(),
    userMessageCounts: new Map(),
    SPAM_THRESHOLD: 6,
    SPAM_TIME_WINDOW: 6 * 1000,
    COMMAND_COOLDOWN: 3 * 1000,
};
