describe("callback handler", () => {
    beforeEach(() => jest.resetModules());

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
});
