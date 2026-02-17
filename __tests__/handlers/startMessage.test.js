jest.resetModules();

describe("startMessage handler", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("startMessage private chat handles missing first/last name gracefully", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/sendReaction", () => ({
                sendReaction: jest.fn(),
            }));

            const bot = { start: jest.fn((fn) => (bot._handler = fn)) };
            require("../../bot/handlers/startMessage")(bot);

            const sentMessage = { message_id: 321 };
            const ctx = {
                chat: { type: "private", id: 5 },
                from: {}, // missing first_name/last_name
                reply: jest.fn().mockResolvedValue(sentMessage),
                pinChatMessage: jest.fn().mockResolvedValue(true),
                telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
            };

            await bot._handler(ctx);

            expect(ctx.reply).toHaveBeenCalled();
            expect(ctx.pinChatMessage).toHaveBeenCalledWith(321);
        });
    });

    test("startMessage sends reaction for non-private chat", async () => {
        await jest.isolateModulesAsync(async () => {
            const sendReaction = jest.fn();
            jest.doMock("../../bot/utils/sendReaction", () => ({
                sendReaction,
            }));

            const bot = { start: (fn) => (bot._handler = fn) };
            const register = require("../../bot/handlers/startMessage");
            register(bot);

            const ctx = { chat: { type: "group" }, from: { first_name: "A" } };

            await bot._handler(ctx);

            expect(sendReaction).toHaveBeenCalledWith(ctx, "👀");
        });
    });

    test("sends reaction when chat not private", async () => {
        const mockSendReaction = jest.fn();
        jest.doMock("../../bot/utils/sendReaction", () => ({
            sendReaction: mockSendReaction,
        }));

        const bot = { start: jest.fn() };
        const register = require("../../bot/handlers/startMessage");
        register(bot);

        const handler = bot.start.mock.calls[0][0];
        const ctx = { chat: { type: "group" } };
        await handler(ctx);

        expect(mockSendReaction).toHaveBeenCalledWith(ctx, "👀");
    });

    test("non-private chat calls sendReaction", async () => {
        const sendReaction = jest.fn();
        jest.doMock("../../bot/utils/sendReaction", () => ({ sendReaction }));

        const register = require("../../bot/handlers/startMessage");

        let stored;
        const bot = { start: (cb) => (stored = cb) };
        register(bot);

        const ctx = { chat: { type: "group" } };
        await stored(ctx);

        expect(sendReaction).toHaveBeenCalledWith(ctx, "👀");
    });

    test("private chat pins and sends message", async () => {
        const sendReaction = jest.fn();
        jest.doMock("../../bot/utils/sendReaction", () => ({ sendReaction }));

        const register = require("../../bot/handlers/startMessage");

        let stored;
        const bot = { start: (cb) => (stored = cb) };
        register(bot);

        const sent = { message_id: 123 };
        const ctx = {
            chat: { type: "private", id: 55 },
            from: { first_name: "A", last_name: "B" },
            reply: jest.fn().mockResolvedValue(sent),
            pinChatMessage: jest.fn().mockResolvedValue(true),
            telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
        };

        await stored(ctx);

        expect(ctx.reply).toHaveBeenCalled();
        expect(ctx.pinChatMessage).toHaveBeenCalledWith(sent.message_id);
        expect(ctx.telegram.sendMessage).toHaveBeenCalledWith(
            ctx.chat.id,
            "@yourusername"
        );
    });

    test("handles errors during start flow", async () => {
        const sendReaction = jest.fn();
        jest.doMock("../../bot/utils/sendReaction", () => ({ sendReaction }));

        const spyErr = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const register = require("../../bot/handlers/startMessage");

        let stored;
        const bot = { start: (cb) => (stored = cb) };
        register(bot);

        const ctx = {
            chat: { type: "private", id: 55 },
            from: { first_name: "A" },
            reply: jest.fn().mockRejectedValue(new Error("fail")),
            pinChatMessage: jest.fn(),
            telegram: { sendMessage: jest.fn() },
        };

        await stored(ctx);

        expect(spyErr).toHaveBeenCalled();
        spyErr.mockRestore();
    });

    test("private chat replies, pins and sends telegram message", async () => {
        jest.doMock("../../bot/utils/sendReaction", () => ({
            sendReaction: jest.fn(),
        }));

        const bot = { start: jest.fn() };
        const register = require("../../bot/handlers/startMessage");
        register(bot);

        const handler = bot.start.mock.calls[0][0];

        const sentMessage = { message_id: 123 };
        const ctx = {
            chat: { type: "private", id: 77 },
            from: { first_name: "F", last_name: "L" },
            reply: jest.fn().mockResolvedValue(sentMessage),
            pinChatMessage: jest.fn().mockResolvedValue(true),
            telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
        };

        await handler(ctx);

        expect(ctx.reply).toHaveBeenCalled();
        expect(ctx.pinChatMessage).toHaveBeenCalledWith(123);
        expect(ctx.telegram.sendMessage).toHaveBeenCalledWith(
            77,
            "@yourusername"
        );
    });

    test("for non-private chat calls sendReaction and does not reply", () => {
        const mockSendReaction = jest.fn();
        jest.mock("../../bot/utils/sendReaction", () => ({
            sendReaction: mockSendReaction,
        }));

        const bot = { start: jest.fn() };
        require("../../bot/handlers/startMessage")(bot);

        // find the registered handler and call it
        const handler = bot.start.mock.calls[0][0];

        const ctx = { chat: { type: "group" }, from: { first_name: "A" } };

        handler(ctx);
        expect(mockSendReaction).toHaveBeenCalled();
    });

    test("for private chat replies and pins message", async () => {
        const bot = { start: jest.fn() };
        jest.mock("../../bot/utils/sendReaction", () => ({
            sendReaction: jest.fn(),
        }));

        require("../../bot/handlers/startMessage")(bot);
        const handler = bot.start.mock.calls[0][0];

        const sentMessage = { message_id: 42 };
        const ctx = {
            chat: { type: "private", id: 10 },
            from: { first_name: "A", last_name: "B" },
            reply: jest.fn().mockResolvedValue(sentMessage),
            pinChatMessage: jest.fn().mockResolvedValue(true),
            telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
        };

        await handler(ctx);

        expect(ctx.reply).toHaveBeenCalled();
        expect(ctx.pinChatMessage).toHaveBeenCalledWith(42);
        expect(ctx.telegram.sendMessage).toHaveBeenCalled();
    });
});
