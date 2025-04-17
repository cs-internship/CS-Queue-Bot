const {
    SPAM_TIME_WINDOW,
    SPAM_THRESHOLD,
    userMessageCounts,
} = require("../config");

function isSpamming(userId) {
    const now = Date.now();

    if (!userMessageCounts.has(userId)) {
        userMessageCounts.set(userId, []);
    }

    const timestamps = userMessageCounts.get(userId);
    timestamps.push(now);

    const recent = timestamps.filter((t) => now - t < SPAM_TIME_WINDOW);
    userMessageCounts.set(userId, recent);

    return recent.length > SPAM_THRESHOLD;
}

module.exports = { isSpamming, userMessageCounts };
