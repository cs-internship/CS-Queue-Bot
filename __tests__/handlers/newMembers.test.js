jest.resetModules();

describe("newMembers handler (isolated)", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("ignores when groupValidator false", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => false,
            }));
            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];
            await handler({ message: {} });
        });
    });

    test("handles invalid member object", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];
            await handler({ message: { new_chat_participant: null } });
        });
    });

    test("handles bot member by replying with HTML and kicking", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/newMembers");
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
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/newMembers");
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

    test("newMembers removes bot even when names missing", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];

            const ctx = {
                message: { new_chat_participant: { id: 55, is_bot: true } },
                replyWithHTML: jest.fn(),
                kickChatMember: jest.fn().mockResolvedValue(true),
            };

            await handler(ctx);

            expect(ctx.replyWithHTML).toHaveBeenCalled();
            expect(ctx.kickChatMember).toHaveBeenCalledWith(55);
        });
    });

    test("newMembers createWorkItem success path calls createWorkItem", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockCreate = jest.fn().mockResolvedValue(true);
            jest.doMock("../../bot/services/azure", () => ({
                createWorkItem: mockCreate,
            }));
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));

            const bot = {
                on: jest.fn((evt, handler) => (bot._handler = handler)),
            };
            const register = require("../../bot/handlers/newMembers");
            register(bot);

            const ctx = {
                message: {
                    new_chat_participant: {
                        id: 77,
                        username: "u77",
                        first_name: "F",
                    },
                },
                reply: jest.fn(),
            };

            await bot._handler(ctx);

            expect(mockCreate).toHaveBeenCalled();
        });
    });

    test("newMembers handler calls createWorkItem and replies on failure", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockCreate = jest.fn().mockRejectedValue(new Error("fail"));
            jest.doMock("../../bot/services/azure", () => ({
                createWorkItem: mockCreate,
            }));
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));

            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];

            const ctx = {
                message: {
                    new_chat_participant: {
                        id: 4,
                        username: "u",
                        first_name: "Y",
                    },
                },
                reply: jest.fn(),
            };

            await handler(ctx);

            expect(mockCreate).toHaveBeenCalled();
            expect(ctx.reply).toHaveBeenCalledWith(
                expect.stringContaining("⚠️ خطا در ثبت اطلاعات اولیه کاربر")
            );
        });
    });

    test("returns early when groupValidator is false", async () => {
        const mockGroup = jest.fn().mockReturnValue(false);
        jest.doMock("../../bot/utils/groupValidator", () => ({
            groupValidator: mockGroup,
        }));

        const register = require("../../bot/handlers/newMembers");

        let stored;
        const bot = { on: (evt, cb) => (stored = cb) };
        register(bot);

        const ctx = { message: { new_chat_participant: { id: 1 } } };

        await stored(ctx);

        expect(mockGroup).toHaveBeenCalled();
    });

    test("handles invalid member object gracefully", async () => {
        const mockGroup = jest.fn().mockReturnValue(true);
        jest.doMock("../../bot/utils/groupValidator", () => ({
            groupValidator: mockGroup,
        }));

        const spy = jest.spyOn(console, "error").mockImplementation(() => {});

        const register = require("../../bot/handlers/newMembers");

        let stored;
        const bot = { on: (evt, cb) => (stored = cb) };
        register(bot);

        const ctx = { message: { new_chat_participant: null } };
        await stored(ctx);

        expect(spy).toHaveBeenCalledWith("Invalid member object:", null);
        spy.mockRestore();
    });

    test("removes bot members (replyWithHTML + kick)", async () => {
        const mockGroup = jest.fn().mockReturnValue(true);
        jest.doMock("../../bot/utils/groupValidator", () => ({
            groupValidator: mockGroup,
        }));

        const register = require("../../bot/handlers/newMembers");

        let stored;
        const bot = { on: (evt, cb) => (stored = cb) };
        register(bot);

        const member = {
            id: 999,
            is_bot: true,
            username: "botname",
            first_name: "B",
        };
        const ctx = {
            message: { new_chat_participant: member },
            replyWithHTML: jest.fn().mockResolvedValue(true),
            kickChatMember: jest.fn().mockResolvedValue(true),
        };

        await stored(ctx);

        expect(ctx.replyWithHTML).toHaveBeenCalled();
        expect(ctx.kickChatMember).toHaveBeenCalledWith(member.id);
    });

    test("prompts when username missing", async () => {
        const mockGroup = jest.fn().mockReturnValue(true);
        jest.doMock("../../bot/utils/groupValidator", () => ({
            groupValidator: mockGroup,
        }));

        const register = require("../../bot/handlers/newMembers");

        let stored;
        const bot = { on: (evt, cb) => (stored = cb) };
        register(bot);

        const member = { id: 3, is_bot: false, first_name: "Alice" };
        const ctx = {
            message: { new_chat_participant: member },
            reply: jest.fn(),
        };

        await stored(ctx);

        expect(ctx.reply).toHaveBeenCalled();
        const calledWith = ctx.reply.mock.calls[0][0];
        expect(calledWith).toMatch(/لطفاً/);
    });

    test("createWorkItem success and failure paths", async () => {
        const mockGroup = jest.fn().mockReturnValue(true);
        const mockCreate = jest.fn();

        // successful path
        jest.doMock("../../bot/utils/groupValidator", () => ({
            groupValidator: mockGroup,
        }));
        jest.doMock("../../bot/services/azure", () => ({
            createWorkItem: mockCreate,
        }));

        const register = require("../../bot/handlers/newMembers");

        let stored;
        const bot = { on: (evt, cb) => (stored = cb) };
        register(bot);

        const member = {
            id: 4,
            is_bot: false,
            username: "u1",
            first_name: "F",
        };
        const ctx = {
            message: { new_chat_participant: member, date: 1, message_id: 2 },
            reply: jest.fn(),
        };

        mockCreate.mockResolvedValueOnce(true);
        await stored(ctx);

        // now force createWorkItem to throw to exercise catch
        const spyErr = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        mockCreate.mockRejectedValueOnce({ message: "boom" });

        await stored(ctx);

        expect(spyErr).toHaveBeenCalled();
        spyErr.mockRestore();
    });

    test("newMembers prompts when member has no username (cover branch)", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));

            const bot = {
                on: jest.fn((evt, handler) => (bot._handler = handler)),
            };
            const register = require("../../bot/handlers/newMembers");
            register(bot);

            const ctx = {
                message: {
                    new_chat_participant: {
                        id: 9999,
                        first_name: "NoUser",
                        is_bot: false,
                    },
                },
                reply: jest.fn().mockResolvedValue(true),
            };

            await bot._handler(ctx);

            expect(ctx.reply).toHaveBeenCalled();
        });
    });

    test("newMembers handler outer catch logs and repliesWithHTML on unexpected error", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => {
                    throw new Error("boom");
                },
            }));
            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/newMembers");
            register(bot);
            const handler = bot.on.mock.calls[0][1];

            const ctx = {
                message: { new_chat_participant: { id: 1 } },
                replyWithHTML: jest.fn(),
            };

            await handler(ctx);

            expect(ctx.replyWithHTML).toHaveBeenCalledWith(
                expect.stringContaining("⛔ خطای سیستمی")
            );
        });
    });

    test("newMembers handler ignores invalid member object", async () => {
        const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };
        jest.doMock("../../bot/services/azure", () => ({
            createWorkItem: jest.fn(),
        }));
        jest.doMock("../../bot/utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        const register = require("../../bot/handlers/newMembers");
        register(bot);

        const ctx = { message: { new_chat_participant: null } };
        await bot._handler(ctx);
    });

    test("newMembers handler removes bot and kicks member", async () => {
        const sendReply = jest.fn();
        const kick = jest.fn();
        jest.doMock("../../bot/services/azure", () => ({
            createWorkItem: jest.fn(),
        }));
        jest.doMock("../../bot/utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        const bot = { on: jest.fn((evt, handler) => (bot._handler = handler)) };
        const register = require("../../bot/handlers/newMembers");
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

    test("creates work item and handles createWorkItem failure", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            const mockCreate = jest.fn().mockRejectedValue(new Error("fail"));
            jest.doMock("../../bot/services/azure", () => ({
                createWorkItem: mockCreate,
            }));

            const bot = { on: jest.fn() };
            const register = require("../../bot/handlers/newMembers");
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
