jest.resetModules();

test("newMembers handler ignores invalid member object", async () => {
    const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };
    jest.doMock("../../services/azure", () => ({ createWorkItem: jest.fn() }));
    jest.doMock("../../utils/groupValidator", () => ({
        groupValidator: () => true,
    }));
    const register = require("../../handlers/newMembers");
    register(bot);

    const ctx = { message: { new_chat_participant: null } };
    await bot._handler(ctx);
});

test("newMembers handler removes bot and kicks member", async () => {
    const sendReply = jest.fn();
    const kick = jest.fn();
    jest.doMock("../../services/azure", () => ({ createWorkItem: jest.fn() }));
    jest.doMock("../../utils/groupValidator", () => ({
        groupValidator: () => true,
    }));
    const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };
    const register = require("../../handlers/newMembers");
    register(bot);

    const ctx = {
        message: {
            new_chat_participant: {
                id: 999,
                username: "b",
                first_name: "B",
                is_bot: true,
            },
        },
        replyWithHTML: sendReply,
        kickChatMember: kick,
    };

    await bot._handler(ctx);
    expect(sendReply).toHaveBeenCalled();
    expect(kick).toHaveBeenCalled();
});
