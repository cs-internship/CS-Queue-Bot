describe("errorReply util", () => {
    let mockReply, mockSendMessage, ctx;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();

        // Mock config
        jest.mock("../../config/config", () => ({ ADMIN_GROUP_ID: 999 }));

        mockReply = jest.fn().mockResolvedValue(true);
        mockSendMessage = jest.fn().mockResolvedValue(true);

        ctx = {
            reply: mockReply,
            chat: { id: 123, title: "TestChat" },
            from: { id: 321, first_name: "Alice" },
            telegram: { sendMessage: mockSendMessage },
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test("sends reply to user and forwards error with message to admin group", async () => {
        const error = new Error("Something went wrong");

        // Require after mocking
        const { errorReply } = require("../../utils/errorReply");

        await errorReply(ctx, error);

        // Reply به کاربر
        expect(mockReply).toHaveBeenCalledWith("خطایی رخ داده است! 🤖");

        // پیام به ادمین
        expect(mockSendMessage).toHaveBeenCalledTimes(1);
        const sentText = mockSendMessage.mock.calls[0][1];
        expect(sentText).toContain("⚠️ *خطایی رخ داده است!*");
        expect(sentText).toContain("TestChat");
        expect(sentText).toContain("Alice");
        expect(sentText).toContain("Something went wrong");

        // گزینه parse_mode
        expect(mockSendMessage.mock.calls[0][2]).toEqual({
            parse_mode: "Markdown",
        });
    });

    test("forwards error.response correctly", async () => {
        const error = {
            response: { error_code: 400, description: "Bad Request" },
        };

        const { errorReply } = require("../../utils/errorReply");

        await errorReply(ctx, error);

        const sentText = mockSendMessage.mock.calls[0][1];
        expect(sentText).toContain("*کد خطا:* `400`");
        expect(sentText).toContain("*توضیح:* `Bad Request`");
    });

    test("handles unknown error object", async () => {
        const error = { foo: "bar" };

        const { errorReply } = require("../../utils/errorReply");

        await errorReply(ctx, error);

        const sentText = mockSendMessage.mock.calls[0][1];
        expect(sentText).toContain("*خطای ناشناخته:*");
        expect(sentText).toContain(JSON.stringify(error));
    });

    test("works if ctx.chat or ctx.from missing", async () => {
        const error = new Error("No user info");
        ctx.chat = undefined;
        ctx.from = undefined;

        const { errorReply } = require("../../utils/errorReply");

        await errorReply(ctx, error);

        const sentText = mockSendMessage.mock.calls[0][1];
        expect(sentText).toContain("⚠️ *خطایی رخ داده است!*");
        expect(sentText).toContain("No user info");
    });

    test.each([
        [{ title: "Title", username: "User123", first_name: "Alice" }, "Title"],
        [{ title: null, username: "User123", first_name: "Alice" }, "User123"],
        [{ title: null, username: null, first_name: "Alice" }, "Alice"],
    ])(
        "chooses correct chat display name from title, username, first_name",
        async (chatObj, expectedName) => {
            const mockReply = jest.fn().mockResolvedValue(true);
            const mockSendMessage = jest.fn().mockResolvedValue(true);

            const ctx = {
                reply: mockReply,
                chat: { id: 123, ...chatObj },
                from: { id: 321, first_name: "Alice" },
                telegram: { sendMessage: mockSendMessage },
            };

            const { errorReply } = require("../../utils/errorReply");

            await errorReply(ctx, new Error("Test Error"));

            const sentText = mockSendMessage.mock.calls[0][1];
            expect(sentText).toContain(
                `*چت:* [${expectedName}](tg://user?id=123)`
            );
        }
    );
});
