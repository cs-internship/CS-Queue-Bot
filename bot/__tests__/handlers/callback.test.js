describe("callback handler", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("unban for existing blocked user sends messages", async () => {
        jest.mock("../../config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set([55]),
        }));

        const bot = { on: jest.fn() };
        require("../../handlers/callback")(bot);
        const handler = bot.on.mock.calls[0][1];

        const ctx = {
            callbackQuery: { data: "unban_55", id: "cid" },
            from: { username: "admin" },
            telegram: {
                sendMessage: jest.fn().mockResolvedValue(true),
                answerCbQuery: jest.fn().mockResolvedValue(true),
            },
        };

        await handler(ctx);
        expect(ctx.telegram.sendMessage).toHaveBeenCalled();
        expect(ctx.telegram.answerCbQuery).toHaveBeenCalled();
    });

    test("callback query with non-unban data does nothing", async () => {
        jest.doMock("../../config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set([1]),
        }));
        const bot = { on: jest.fn() };
        require("../../handlers/callback")(bot);
        const handler = bot.on.mock.calls[0][1];

        const ctx = {
            callbackQuery: { data: "something_else", id: "x" },
            from: { username: "admin" },
            telegram: { sendMessage: jest.fn(), answerCbQuery: jest.fn() },
        };

        await handler(ctx);

        expect(ctx.telegram.sendMessage).not.toHaveBeenCalled();
        expect(ctx.telegram.answerCbQuery).not.toHaveBeenCalled();
    });

    test("unban for not-blocked user notifies admin group", async () => {
        jest.mock("../../config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set(),
        }));

        const bot = { on: jest.fn() };
        require("../../handlers/callback")(bot);
        const handler = bot.on.mock.calls[0][1];

        const ctx = {
            callbackQuery: { data: "unban_12", id: "cid2" },
            from: { username: "admin" },
            telegram: {
                sendMessage: jest.fn().mockResolvedValue(true),
                answerCbQuery: jest.fn().mockResolvedValue(true),
            },
        };

        await handler(ctx);
        expect(ctx.telegram.sendMessage).toHaveBeenCalled();
    });

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
});
