describe("newMembers handler", () => {
    beforeEach(() => jest.resetModules());

    test("ignores when groupValidator returns false", async () => {
        jest.mock("../../utils/groupValidator", () => ({
            groupValidator: () => false,
        }));
        const bot = { on: jest.fn() };
        require("../../handlers/newMembers")(bot);
        const handler = bot.on.mock.calls[0][1];

        const ctx = { message: { new_chat_participant: {} } };
        await handler(ctx);
        // should not throw and simply return
    });

    test("handles bot join by replying and kicking", async () => {
        jest.mock("../../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        const bot = { on: jest.fn() };
        require("../../handlers/newMembers")(bot);
        const handler = bot.on.mock.calls[0][1];

        const member = {
            is_bot: true,
            id: 77,
            first_name: "bot",
            username: "bot",
        };
        const ctx = {
            message: { new_chat_participant: member },
            replyWithHTML: jest.fn().mockResolvedValue(true),
            kickChatMember: jest.fn().mockResolvedValue(true),
        };

        await handler(ctx);
        expect(ctx.replyWithHTML).toHaveBeenCalled();
        expect(ctx.kickChatMember).toHaveBeenCalledWith(77);
    });

    test("handles user without username by prompting", async () => {
        jest.mock("../../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        const bot = { on: jest.fn() };
        require("../../handlers/newMembers")(bot);
        const handler = bot.on.mock.calls[0][1];

        const member = {
            is_bot: false,
            id: 88,
            first_name: "NoName",
            username: null,
        };
        const ctx = {
            message: { new_chat_participant: member },
            reply: jest.fn().mockResolvedValue(true),
        };

        await handler(ctx);
        expect(ctx.reply).toHaveBeenCalled();
    });

    test("creates work item when username present and handles createWorkItem error", async () => {
        jest.mock("../../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        const mockCreate = jest.fn().mockRejectedValue(new Error("ax"));
        jest.mock("../../services/azure", () => ({ createWorkItem: mockCreate }));

        const bot = { on: jest.fn() };
        require("../../handlers/newMembers")(bot);
        const handler = bot.on.mock.calls[0][1];

        const member = {
            is_bot: false,
            id: 99,
            first_name: "Has",
            username: "u99",
        };
        const ctx = {
            message: { new_chat_participant: member },
            reply: jest.fn().mockResolvedValue(true),
        };

        await handler(ctx);
        expect(mockCreate).toHaveBeenCalled();
    });
});
