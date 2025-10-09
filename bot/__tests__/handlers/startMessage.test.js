jest.resetModules();

describe("startMessage handler", () => {
    test("sends reaction when chat not private", async () => {
        const mockSendReaction = jest.fn();
        jest.doMock("../../utils/sendReaction", () => ({
            sendReaction: mockSendReaction,
        }));

        const bot = { start: jest.fn() };
        const register = require("../../handlers/startMessage");
        register(bot);

        const handler = bot.start.mock.calls[0][0];
        const ctx = { chat: { type: "group" } };
        await handler(ctx);

        expect(mockSendReaction).toHaveBeenCalledWith(ctx, "👀");
    });

    test("private chat replies, pins and sends telegram message", async () => {
        jest.doMock("../../utils/sendReaction", () => ({
            sendReaction: jest.fn(),
        }));

        const bot = { start: jest.fn() };
        const register = require("../../handlers/startMessage");
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
});
describe("startMessage handler", () => {
    beforeEach(() => jest.resetModules());

    test("for non-private chat calls sendReaction and does not reply", () => {
        const mockSendReaction = jest.fn();
        jest.mock("../../utils/sendReaction", () => ({
            sendReaction: mockSendReaction,
        }));

        const bot = { start: jest.fn() };
        require("../../handlers/startMessage")(bot);

        // find the registered handler and call it
        const handler = bot.start.mock.calls[0][0];

        const ctx = { chat: { type: "group" }, from: { first_name: "A" } };

        handler(ctx);
        expect(mockSendReaction).toHaveBeenCalled();
    });

    test("for private chat replies and pins message", async () => {
        const bot = { start: jest.fn() };
        jest.mock("../../utils/sendReaction", () => ({
            sendReaction: jest.fn(),
        }));

        require("../../handlers/startMessage")(bot);
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
