jest.resetModules();

describe("newMembers handler (isolated)", () => {
    test("ignores when groupValidator false", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => false,
            }));
            const bot = { on: jest.fn() };
            const register = require("../../handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];
            await handler({ message: {} });
        });
    });

    test("handles invalid member object", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            const bot = { on: jest.fn() };
            const register = require("../../handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];
            await handler({ message: { new_chat_participant: null } });
        });
    });

    test("handles bot member by replying with HTML and kicking", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            const bot = { on: jest.fn() };
            const register = require("../../handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];

            const ctx = {
                message: {
                    new_chat_participant: {
                        id: 2,
                        is_bot: true,
                        first_name: "bot",
                        username: "b",
                    },
                },
                replyWithHTML: jest.fn(),
                kickChatMember: jest.fn().mockResolvedValue(true),
            };

            await handler(ctx);

            expect(ctx.replyWithHTML).toHaveBeenCalled();
            expect(ctx.kickChatMember).toHaveBeenCalledWith(2);
        });
    });

    test("handles member with no username by prompting", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            const bot = { on: jest.fn() };
            const register = require("../../handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];

            const ctx = {
                message: {
                    new_chat_participant: {
                        id: 3,
                        first_name: "X",
                        is_bot: false,
                    },
                },
                reply: jest.fn(),
            };
            await handler(ctx);

            expect(ctx.reply).toHaveBeenCalled();
        });
    });

    test("creates work item and handles createWorkItem failure", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            const mockCreate = jest.fn().mockRejectedValue(new Error("fail"));
            jest.doMock("../../services/azure", () => ({
                createWorkItem: mockCreate,
            }));

            const bot = { on: jest.fn() };
            const register = require("../../handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];

            const ctx = {
                message: {
                    new_chat_participant: {
                        id: 4,
                        first_name: "Y",
                        is_bot: false,
                        username: "u",
                    },
                },
                reply: jest.fn(),
            };

            await handler(ctx);
            expect(mockCreate).toHaveBeenCalled();
        });
    });
});
