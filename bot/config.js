require("dotenv").config();

module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    PAT_TOKEN: process.env.PAT_TOKEN,
    ADMIN_GROUP_ID: process.env.Admin_Group_ID,
    // GROUP_ID: "-1002368870938",
    GROUP_ID: "-1001191433472",
    ORGANIZATION: "cs-internship",
    PROJECT: "CS Internship Program",
    PARENT_ID: 30789,
    WORKITEM_ID: 31256,
    BOT_VERSION: "v2.2",
    SPAM_THRESHOLD: 6,
    SPAM_TIME_WINDOW: 6 * 1000,
    COMMAND_COOLDOWN: 3 * 1000,
    blockedUsers: new Set(),
    userMessageCounts: new Map(),
};
