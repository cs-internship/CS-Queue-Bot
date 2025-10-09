jest.resetModules();

test("spamProtection returns early when user already banned", async () => {
    const bot = { use: (fn) => (bot._middleware = fn) };
    jest.doMock("../../config/config", () => ({
        GROUP_ID: 1,
        userMessageCounts: new Map([[7, { banned: true }]]),
    }));
    jest.doMock("../../utils/spamProtection", () => ({
        isSpamming: () => false,
    }));
    const spam = require("../../middlewares/spamProtection");
    await spam(bot);

    const ctx = { message: { chat: { id: 1 } }, from: { id: 7 } };
    let calledNext = false;
    await bot._middleware(ctx, () => {
        calledNext = true;
    });
    // should not call next when banned
    expect(calledNext).toBe(false);
});
