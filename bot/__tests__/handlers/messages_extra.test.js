describe("messages handler extra branches", () => {
    beforeEach(() => jest.resetModules());

    test("non-text message sends admin notification and logs", async () => {
        const sendMessage = jest.fn();
        const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };

        jest.doMock("../../config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set(),
        }));
        jest.doMock("../../utils/spamProtection", () => ({
            isSpamming: () => false,
        }));

        const register = require("../../handlers/messages");
        register(bot);

        const ctx = {
            chat: { type: "private" },
            from: { id: 42, first_name: "FN", last_name: "LN", username: "u" },
            message: {
                /* no text */
            },
            telegram: { sendMessage },
            reply: jest.fn(),
        };

        await bot._handler(ctx, jest.fn());

        expect(sendMessage).toHaveBeenCalled();
        // admin message contains PrivateMessage tag
        expect(sendMessage.mock.calls[0][0]).toBe(999);
        expect(sendMessage.mock.calls[0][1]).toContain("#PrivateMessage");
    });

    test("invalid username does not set valid flag but still notifies admin", async () => {
        const sendMessage = jest.fn();
        const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };

        jest.doMock("../../config/config", () => ({
            ADMIN_GROUP_ID: 321,
            blockedUsers: new Set(),
        }));
        jest.doMock("../../utils/spamProtection", () => ({
            isSpamming: () => false,
        }));

        const register = require("../../handlers/messages");
        register(bot);

        const ctx = {
            chat: { type: "private" },
            from: { id: 43, first_name: "A", last_name: "B", username: "u" },
            message: { text: "@__bad__" },
            telegram: { sendMessage },
            reply: jest.fn(),
        };

        await bot._handler(ctx, jest.fn());

        // reply shouldn't be called as username invalid
        expect(ctx.reply).not.toHaveBeenCalled();
        expect(sendMessage).toHaveBeenCalled();
        expect(sendMessage.mock.calls[0][0]).toBe(321);
    });

    test("spam path blocks user and notifies admin and user", async () => {
        const sendMessage = jest.fn();
        const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };

        // simulate isSpamming true
        const blocked = new Set();
        jest.doMock("../../config/config", () => ({
            ADMIN_GROUP_ID: 111,
            blockedUsers: blocked,
        }));
        jest.doMock("../../utils/spamProtection", () => ({
            isSpamming: () => true,
        }));

        const register = require("../../handlers/messages");
        register(bot);

        const ctx = {
            chat: { type: "private" },
            from: { id: 44, first_name: "Spam", username: "sp", last_name: "" },
            message: { text: "hello" },
            telegram: { sendMessage },
        };

        await bot._handler(ctx, jest.fn());

        // user should be added to blockedUsers
        expect(blocked.has(44)).toBe(true);
        // two messages should be sent: to user and to admin
        expect(sendMessage).toHaveBeenCalledTimes(2);
    });
});
