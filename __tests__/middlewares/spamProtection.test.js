jest.resetModules();

describe("spamProtection middleware", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("kicks and replies when isSpamming returns true", async () => {
        const mockIsSpamming = jest.fn().mockReturnValue(true);
        jest.doMock("../../bot/utils/spamProtection", () => ({
            isSpamming: mockIsSpamming,
        }));

        const cfg = { GROUP_ID: 1, userMessageCounts: new Map() };
        jest.doMock("../../bot/config/config", () => cfg);

        const middlewareFactory = require("../../bot/middlewares/spamProtection");
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

    test("spamProtection returns early when user already banned", async () => {
        const bot = { use: (fn) => (bot._middleware = fn) };
        jest.doMock("../../bot/config/config", () => ({
            GROUP_ID: 1,
            userMessageCounts: new Map([[7, { banned: true }]]),
        }));
        jest.doMock("../../bot/utils/spamProtection", () => ({
            isSpamming: () => false,
        }));
        const spam = require("../../bot/middlewares/spamProtection");
        await spam(bot);

        const ctx = { message: { chat: { id: 1 } }, from: { id: 7 } };
        let calledNext = false;
        await bot._middleware(ctx, () => {
            calledNext = true;
        });
        // should not call next when banned
        expect(calledNext).toBe(false);
    });

    test("calls next when not spamming", async () => {
        jest.resetModules();
        jest.doMock("../../bot/utils/spamProtection", () => ({
            isSpamming: () => false,
        }));
        const cfg = { GROUP_ID: 1, userMessageCounts: new Map() };
        jest.doMock("../../bot/config/config", () => cfg);
        const middlewareFactory = require("../../bot/middlewares/spamProtection");
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
