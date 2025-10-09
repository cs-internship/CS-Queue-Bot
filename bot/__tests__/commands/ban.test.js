jest.resetModules();

describe("banCommand (isolated)", () => {
    test("returns when groupValidator is false", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => false,
            }));
            jest.doMock("../../utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));
            const { banCommand } = require("../../commands/ban");
            const ctx = {
                message: { chat: { id: 1 } },
                reply: jest.fn(),
                telegram: { sendMessage: jest.fn() },
            };
            await banCommand(ctx);
        });
    });

    test("sends reaction when not admin", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockSendReaction = jest.fn();
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: async () => false,
            }));
            jest.doMock("../../utils/sendReaction", () => ({
                sendReaction: mockSendReaction,
            }));
            jest.doMock("../../utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../commands/ban");
            const ctx = {
                message: { chat: { id: 12345 } },
                reply: jest.fn(),
                telegram: { sendMessage: jest.fn() },
            };
            await banCommand(ctx);

            expect(mockSendReaction).toHaveBeenCalledWith(ctx, "👀");
        });
    });

    test("returns if chat isn't admin group", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            jest.doMock("../../config/config", () => ({
                ADMIN_GROUP_ID: 999,
                blockedUsers: new Set(),
            }));
            jest.doMock("../../utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../commands/ban");
            const ctx = {
                message: { chat: { id: 1 } },
                reply: jest.fn(),
                telegram: { sendMessage: jest.fn() },
            };
            await banCommand(ctx);
        });
    });

    test("replies if no reply_to_message", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            jest.doMock("../../config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: new Set(),
            }));
            jest.doMock("../../utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../commands/ban");
            const ctx = {
                message: { chat: { id: 12345 } },
                reply: jest.fn(),
                telegram: { sendMessage: jest.fn() },
            };
            await banCommand(ctx);
            expect(ctx.reply).toHaveBeenCalled();
        });
    });

    test("replies when id not found or invalid", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            jest.doMock("../../config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: new Set(),
            }));
            jest.doMock("../../utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../commands/ban");
            const ctx = {
                message: {
                    chat: { id: 12345 },
                    reply_to_message: { text: "no id here" },
                },
                reply: jest.fn(),
                telegram: { sendMessage: jest.fn() },
            };
            await banCommand(ctx);
            expect(ctx.reply).toHaveBeenCalled();
        });
    });

    test("replies when already blocked", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            const blocked = new Set([42]);
            jest.doMock("../../config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: blocked,
            }));
            jest.doMock("../../utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../commands/ban");
            const ctx = {
                message: {
                    chat: { id: 12345 },
                    reply_to_message: { text: "🆔 42" },
                },
                reply: jest.fn(),
                telegram: { sendMessage: jest.fn() },
            };
            await banCommand(ctx);
            expect(ctx.reply).toHaveBeenCalledWith(
                "ℹ️ این کاربر قبلاً بلاک شده است"
            );
        });
    });

    test("successful ban flow sends messages and registers inline keyboard", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            const blocked = new Set();
            jest.doMock("../../config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: blocked,
            }));
            jest.doMock("../../utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const ctx = {
                message: {
                    chat: { id: 12345 },
                    reply_to_message: { text: "🆔 777" },
                },
                from: { username: "adminUser" },
                reply: jest.fn(),
                telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
            };

            const { banCommand } = require("../../commands/ban");
            await banCommand(ctx);

            expect(ctx.telegram.sendMessage).toHaveBeenCalled();
            expect(blocked.has(777)).toBe(true);
        });
    });
});
const ctx = {
    message: { chat: { id: 12345 }, reply_to_message: { text: "🆔 777" } },
    from: { username: "adminUser" },
    reply: jest.fn(),
    telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
};
