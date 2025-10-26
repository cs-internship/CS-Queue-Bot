jest.resetModules();

describe("messages handler", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("returns when pinned_message is present", async () => {
        const bot = { on: jest.fn() };
        const register = require("../../bot/handlers/messages");
        register(bot);

        const handler = bot.on.mock.calls[0][1];
        const ctx = { message: { pinned_message: {} } };
        await handler(ctx, jest.fn());
    });

    test("messages handler handles missing username in private message and includes placeholder", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 77,
                blockedUsers: new Set(),
            }));
            jest.doMock("../../bot/utils/spamProtection", () => ({
                isSpamming: () => false,
            }));

            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/messages");
            register(bot);
            const handler = bot.on.mock.calls[0][1];

            const sendMessage = jest.fn();
            const ctx = {
                chat: { type: "private" },
                from: { id: 10 }, // no username/first_name
                message: { text: "hello" },
                telegram: { sendMessage },
            };

            await handler(ctx);

            expect(sendMessage).toHaveBeenCalled();
            // admin message should include the placeholder for missing username
            const adminMsg = sendMessage.mock.calls[0][1];
            expect(adminMsg).toContain("(@—)");
        });
    });

    test("messages handler spam path with missing username blocks and notifies admin", async () => {
        await jest.isolateModulesAsync(async () => {
            const blocked = new Set();
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 88,
                blockedUsers: blocked,
            }));
            jest.doMock("../../bot/utils/spamProtection", () => ({
                isSpamming: () => true,
            }));

            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/messages");
            register(bot);
            const handler = bot.on.mock.calls[0][1];

            const sendMessage = jest.fn();
            const ctx = {
                chat: { type: "private" },
                from: { id: 11, first_name: "NoName" }, // no username
                message: { text: "spam" },
                telegram: { sendMessage },
            };

            await handler(ctx);

            expect(blocked.has(11)).toBe(true);
            expect(sendMessage).toHaveBeenCalledTimes(2);
            const adminMsg = sendMessage.mock.calls[1][1];
            expect(adminMsg).toContain("@—");
        });
    });

    test("non-text message sends admin notification and logs", async () => {
        const sendMessage = jest.fn();
        const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };

        jest.doMock("../../bot/config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set(),
        }));
        jest.doMock("../../bot/utils/spamProtection", () => ({
            isSpamming: () => false,
        }));

        const register = require("../../bot/handlers/messages");
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

        jest.doMock("../../bot/config/config", () => ({
            ADMIN_GROUP_ID: 321,
            blockedUsers: new Set(),
        }));
        jest.doMock("../../bot/utils/spamProtection", () => ({
            isSpamming: () => false,
        }));

        const register = require("../../bot/handlers/messages");
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
        jest.doMock("../../bot/config/config", () => ({
            ADMIN_GROUP_ID: 111,
            blockedUsers: blocked,
        }));
        jest.doMock("../../bot/utils/spamProtection", () => ({
            isSpamming: () => true,
        }));

        const register = require("../../bot/handlers/messages");
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

    test("handles non-private chat by calling next", async () => {
        const bot = { on: jest.fn() };
        const register = require("../../bot/handlers/messages");
        register(bot);

        const handler = bot.on.mock.calls[0][1];
        const next = jest.fn();
        const ctx = { chat: { type: "group" }, message: {} };
        await handler(ctx, next);
        expect(next).toHaveBeenCalled();
    });

    test("handles blocked user in private chat", async () => {
        const cfg = require("../../bot/config/config");
        cfg.blockedUsers.add(999);

        const bot = { on: jest.fn() };
        const register = require("../../bot/handlers/messages");
        register(bot);

        const handler = bot.on.mock.calls[0][1];
        const ctx = {
            chat: { type: "private" },
            from: { id: 999 },
            message: {},
        };
        await handler(ctx, jest.fn());
    });

    test("detects and registers valid username during allowed time", async () => {
        // Mock Date to be Sunday at 17:45 Tehran time
        const mockDate = new Date("2025-10-26T14:15:00Z"); // 17:45 Tehran time
        const realDate = global.Date;
        global.Date = class extends Date {
            constructor(...args) {
                if (args.length === 0) {
                    return mockDate;
                }
                return new realDate(...args);
            }
            static now() {
                return mockDate.getTime();
            }
        };

        // Ensure deterministic behavior by mocking config and spamProtection
        jest.doMock("../../bot/config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set(),
        }));
        jest.doMock("../../bot/utils/spamProtection", () => ({
            isSpamming: () => false,
        }));

        const bot = { on: jest.fn() };
        const register = require("../../bot/handlers/messages");
        register(bot);

        const handler = bot.on.mock.calls[0][1];
        const ctx = {
            chat: { type: "private" },
            from: { id: 5, first_name: "A", username: "u" },
            message: { text: "@abcde" },
            reply: jest.fn(),
            telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
        };

        await handler(ctx, jest.fn());

        expect(ctx.reply).toHaveBeenCalled();
        expect(ctx.telegram.sendMessage).toHaveBeenCalled();

        // Restore original Date
        global.Date = realDate;
    });

    test("messages handler returns early on pinned_message present", async () => {
        const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };
        jest.doMock("../../bot/config/config", () => ({
            ADMIN_GROUP_ID: 1,
            blockedUsers: new Set(),
        }));
        jest.doMock("../../bot/utils/spamProtection", () => ({
            isSpamming: () => false,
        }));
        const register = require("../../bot/handlers/messages");
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
        const register = require("../../bot/handlers/startMessage");
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

    test("returns early for pinned_message", () => {
        const bot = { on: jest.fn() };
        require("../../bot/handlers/messages")(bot);
        const handler = bot.on.mock.calls[0][1];

        const ctx = { message: { pinned_message: {} } };
        expect(handler(ctx)).resolves.toBeUndefined();
    });

    test("private valid username registers and sends admin message during allowed time", async () => {
        // Mock Date to be Sunday at 17:45 Tehran time
        const mockDate = new Date("2025-10-26T14:15:00Z"); // 17:45 Tehran time
        const realDate = global.Date;
        global.Date = class extends Date {
            constructor(...args) {
                if (args.length === 0) {
                    return mockDate;
                }
                return new realDate(...args);
            }
            static now() {
                return mockDate.getTime();
            }
        };

        jest.mock("../../bot/config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set(),
        }));
        jest.mock("../../bot/utils/spamProtection", () => ({
            isSpamming: jest.fn().mockReturnValue(false),
        }));

        const bot = { on: jest.fn() };
        require("../../bot/handlers/messages")(bot);
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

        // Restore original Date
        global.Date = realDate;
    });

    test("private non-text logs and still not crash", async () => {
        jest.mock("../../bot/config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set(),
        }));
        jest.mock("../../bot/utils/spamProtection", () => ({
            isSpamming: jest.fn().mockReturnValue(false),
        }));

        const bot = { on: jest.fn() };
        require("../../bot/handlers/messages")(bot);
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
