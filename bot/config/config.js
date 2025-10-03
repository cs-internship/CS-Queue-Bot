require("dotenv").config();
const { version } = require("../../package.json");

module.exports = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    PAT_TOKEN: process.env.PAT_TOKEN,
    ADMIN_GROUP_ID: process.env.Admin_Group_ID,
    GROUP_ID: process.env.Group_ID,
    ORGANIZATION: "cs-internship",
    PROJECT: "CS Internship Program",
    PARENT_ID: 30789,
    WORKITEM_ID: 31256,
    BOT_VERSION: `v${version}`,
    SPAM_THRESHOLD: 6,
    SPAM_TIME_WINDOW: 6 * 1000,
    COMMAND_COOLDOWN: 3 * 1000,
    blockedUsers: new Set(),
    userMessageCounts: new Map(),
    PORT: process.env.PORT || 3000,
};

// Ensure that the environment variables are set
if (!module.exports.TELEGRAM_BOT_TOKEN) {
    throw new Error(
        "ERR>> TELEGRAM_BOT_TOKEN is not set in the environment variables."
    );
}
if (!module.exports.PAT_TOKEN) {
    throw new Error("ERR>> PAT_TOKEN is not set in the environment variables.");
}
if (!module.exports.ADMIN_GROUP_ID) {
    throw new Error(
        "ERR>> ADMIN_GROUP_ID is not set in the environment variables."
    );
}
if (!module.exports.GROUP_ID) {
    throw new Error("ERR>> GROUP_ID is not set in the environment variables.");
}
if (!module.exports.PORT) {
    console.warn("⚠️ PORT is not set, defaulting to 3000.");
    module.exports.port = 3000; // Default port
}
