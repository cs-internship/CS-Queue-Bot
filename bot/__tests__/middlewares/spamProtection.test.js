jest.resetModules();

describe("spamProtection middleware", () => {
    it("kicks and replies when isSpamming returns true", async () => {
        const mockIsSpamming = jest.fn().mockReturnValue(true);
        jest.doMock("../../utils/spamProtection", () => ({
            isSpamming: mockIsSpamming,
        }));

        const cfg = { GROUP_ID: 1, userMessageCounts: new Map() };
        jest.doMock("../../config/config", () => cfg);

        const middlewareFactory = require("../../middlewares/spamProtection");
        const bot = { use: jest.fn() };

        await middlewareFactory(bot);

        // extract middleware function passed to bot.use
        expect(bot.use).toHaveBeenCalled();
        const mw = bot.use.mock.calls[0][0];

        const ctx = {
            message: { chat: { id: 1 } },
            from: { id: 42, username: "spammy" },
            reply: jest.fn(),
            kickChatMember: jest.fn().mockResolvedValue(true),
        };

        const next = jest.fn();

        await mw(ctx, next);

        expect(ctx.reply).toHaveBeenCalled();
        expect(ctx.kickChatMember).toHaveBeenCalledWith(42);
        expect(cfg.userMessageCounts.get(42)).toEqual({ banned: true });
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next when not spamming", async () => {
        jest.resetModules();
        jest.doMock("../../utils/spamProtection", () => ({
            isSpamming: () => false,
        }));
        const cfg = { GROUP_ID: 1, userMessageCounts: new Map() };
        jest.doMock("../../config/config", () => cfg);
        const middlewareFactory = require("../../middlewares/spamProtection");
        const bot = { use: jest.fn() };
        await middlewareFactory(bot);
        const mw = bot.use.mock.calls[0][0];

        const ctx = {
            message: { chat: { id: 1 } },
            from: { id: 5, username: "ok" },
            reply: jest.fn(),
            kickChatMember: jest.fn(),
        };
        const next = jest.fn();
        await mw(ctx, next);

        expect(next).toHaveBeenCalled();
    });
});
