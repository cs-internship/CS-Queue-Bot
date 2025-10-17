require("dotenv").config();
const { version } = require("../../package.json");

// Helper to read env with fallback and normalized names
function readEnv(name, alt) {
    return process.env[name] || (alt ? process.env[alt] : undefined);
}

const isTest = process.env.NODE_ENV === "test";

const TELEGRAM_BOT_TOKEN =
    readEnv("TELEGRAM_BOT_TOKEN") ||
    (isTest ? "TEST_TELEGRAM_TOKEN" : undefined);
const PAT_TOKEN =
    readEnv("PAT_TOKEN") || (isTest ? "TEST_PAT_TOKEN" : undefined);
const ADMIN_GROUP_ID =
    readEnv("ADMIN_GROUP_ID", "Admin_Group_ID") ||
    (isTest ? "-1001234567890" : undefined);
const GROUP_ID =
    readEnv("GROUP_ID", "Group_ID") || (isTest ? "-1009876543210" : undefined);

const config = {
    TELEGRAM_BOT_TOKEN,
    PAT_TOKEN,
    ADMIN_GROUP_ID,
    GROUP_ID,
    ORGANIZATION: "cs-internship",
    PROJECT: "CS Internship Program",
    PARENT_ID: 30789,
    WORKITEM_ID: 31256,
    BOT_VERSION: version,
    SPAM_THRESHOLD: 6,
    SPAM_TIME_WINDOW: 6 * 1000,
    COMMAND_COOLDOWN: 3 * 1000,
    PORT: process.env.PORT || 3000,
    blockedUsers: new Set(),
    userMessageCounts: new Map(),
    startCalendarDate: "2025-01-13",
};

// During normal runs, enforce required env vars; during tests provide defaults
if (!isTest) {
    if (!config.TELEGRAM_BOT_TOKEN) {
        throw new Error(
            "ERR>> TELEGRAM_BOT_TOKEN is not set in the environment variables."
        );
    }
    if (!config.PAT_TOKEN) {
        throw new Error(
            "ERR>> PAT_TOKEN is not set in the environment variables."
        );
    }
    if (!config.ADMIN_GROUP_ID) {
        throw new Error(
            "ERR>> ADMIN_GROUP_ID is not set in the environment variables."
        );
    }
    if (!config.GROUP_ID) {
        throw new Error(
            "ERR>> GROUP_ID is not set in the environment variables."
        );
    }
}

module.exports = config;
