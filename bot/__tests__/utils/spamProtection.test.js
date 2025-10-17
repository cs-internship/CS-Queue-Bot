describe("spamProtection util", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test("isSpamming returns false for few messages", () => {
        jest.mock("../../config/config", () => ({
            SPAM_TIME_WINDOW: 6000,
            SPAM_THRESHOLD: 6,
            userMessageCounts: new Map(),
        }));
        const {
            isSpamming,
            userMessageCounts,
        } = require("../../utils/spamProtection");
        const userId = "u1";
        // ensure clean
        userMessageCounts.clear();

        expect(isSpamming(userId)).toBe(false);
    });

    test("isSpamming returns true when threshold exceeded", () => {
        jest.mock("../../config/config", () => ({
            SPAM_TIME_WINDOW: 6000,
            SPAM_THRESHOLD: 6,
            userMessageCounts: new Map(),
        }));
        const {
            isSpamming,
            userMessageCounts,
        } = require("../../utils/spamProtection");
        const userId = "u2";
        userMessageCounts.clear();

        // simulate many messages within window
        const now = Date.now();
        const { SPAM_THRESHOLD } = require("../../config/config");
        const timestamps = new Array(SPAM_THRESHOLD + 2).fill(now);
        userMessageCounts.set(userId, timestamps);

        expect(isSpamming(userId)).toBe(true);
    });
});
