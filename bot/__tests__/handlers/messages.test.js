describe("messages handler", () => {
    beforeEach(() => jest.resetModules());

    test("returns early for pinned_message", () => {
        const bot = { on: jest.fn() };
        require("../handlers/messages")(bot);
        const handler = bot.on.mock.calls[0][1];

        const ctx = { message: { pinned_message: {} } };
        expect(handler(ctx)).resolves.toBeUndefined();
    });

    test("private valid username registers and sends admin message", async () => {
        jest.mock("../../config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set(),
        }));
        jest.mock("../utils/spamProtection", () => ({
            isSpamming: jest.fn().mockReturnValue(false),
        }));

        const bot = { on: jest.fn() };
        require("../handlers/messages")(bot);
        const handler = bot.on.mock.calls[0][1];

        const ctx = {
            chat: { type: "private" },
            from: { id: 1, first_name: "A", last_name: "B", username: "u1" },
            message: { text: "@validuser" },
            reply: jest.fn().mockResolvedValue(true),
            telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
        };

        await handler(ctx);

        expect(ctx.reply).toHaveBeenCalledWith(
            "✅ یوزرنیم شما با موفقیت ثبت شد."
        );
        expect(ctx.telegram.sendMessage).toHaveBeenCalled();
    });

    test("private non-text logs and still not crash", async () => {
        jest.mock("../../config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set(),
        }));
        jest.mock("../utils/spamProtection", () => ({
            isSpamming: jest.fn().mockReturnValue(false),
        }));

        const bot = { on: jest.fn() };
        require("../handlers/messages")(bot);
        const handler = bot.on.mock.calls[0][1];

        const ctx = {
            chat: { type: "private" },
            from: { id: 2, first_name: "X", username: "x" },
            message: { text: undefined, photo: {} },
            reply: jest.fn().mockResolvedValue(true),
            telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
        };

        await handler(ctx);
        expect(ctx.telegram.sendMessage).toHaveBeenCalled();
    });
});
