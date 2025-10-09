jest.resetModules();

test("callback unban for non-blocked user sends info message and answers callback", async () => {
    const sendMessage = jest.fn();
    const answerCbQuery = jest.fn();

    const blocked = new Set();
    jest.doMock("../../config/config", () => ({
        ADMIN_GROUP_ID: 999,
        blockedUsers: blocked,
    }));
    const register = require("../../handlers/callback");

    const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };
    register(bot);

    const ctx = {
        callbackQuery: { data: "unban_123", id: "cb1" },
        from: { username: "admin" },
        telegram: { sendMessage, answerCbQuery },
    };

    await bot._handler(ctx);

    expect(sendMessage).toHaveBeenCalled();
    expect(answerCbQuery).toHaveBeenCalledWith("cb1", expect.any(Object));
});
