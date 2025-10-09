jest.resetModules();

test("messages handler returns early on pinned_message present", async () => {
    const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };
    jest.doMock("../../config/config", () => ({
        ADMIN_GROUP_ID: 1,
        blockedUsers: new Set(),
    }));
    jest.doMock("../../utils/spamProtection", () => ({
        isSpamming: () => false,
    }));
    const register = require("../../handlers/messages");
    register(bot);

    const ctx = {
        message: { pinned_message: {} },
        chat: { type: "private" },
        from: { id: 1 },
    };
    await bot._handler(ctx, jest.fn());
    // if no exception thrown, test passes
});

test("startMessage handles error when pinChatMessage fails", async () => {
    const bot = { start: (fn) => (bot._handler = fn) };
    const register = require("../../handlers/startMessage");
    register(bot);

    const ctx = {
        chat: { type: "private", id: 10 },
        from: { first_name: "F", last_name: "L" },
        reply: jest.fn().mockResolvedValue({ message_id: 55 }),
        pinChatMessage: jest.fn().mockRejectedValue(new Error("pin fail")),
        telegram: { sendMessage: jest.fn() },
    };

    await bot._handler(ctx);
    // no throw equals pass
});
