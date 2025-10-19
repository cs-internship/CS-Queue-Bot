jest.resetModules();

describe("banCommand (isolated)", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("returns when groupValidator is false", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => false,
            }));
            jest.doMock("../../bot/utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));
            const { banCommand } = require("../../bot/commands/ban");
            const ctx = {
                message: { chat: { id: 1 } },
                reply: jest.fn(),
                telegram: { sendMessage: jest.fn() },
            };
            await banCommand(ctx);
        });
    });

    test("ban command handles telegram.sendMessage failure to user and continues", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../bot/utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            const blocked = new Set();
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: blocked,
            }));

            // telegram.sendMessage will reject for first call (to user), resolve for admin call
            const sendMessage = jest
                .fn()
                .mockRejectedValueOnce(new Error("user send failed"))
                .mockResolvedValueOnce(true);

            const ctx = {
                message: {
                    chat: { id: 12345 },
                    reply_to_message: { text: "🆔 999" },
                },
                from: { username: "admin" },
                reply: jest.fn(),
                telegram: { sendMessage },
            };

            const { banCommand } = require("../../bot/commands/ban");
            await banCommand(ctx);

            expect(sendMessage).toHaveBeenCalled();
            expect(blocked.has(999)).toBe(true);
        });
    });

    test("ban command replies when parsed id is NaN", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../bot/utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            const blocked = new Set();
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: blocked,
            }));

            const ctx = {
                message: {
                    chat: { id: 12345 },
                    reply_to_message: { text: "🆔 321" },
                },
                from: { username: "admin" },
                reply: jest.fn(),
                telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
            };

            const parseSpy = jest
                .spyOn(global, "parseInt")
                .mockImplementation(() => NaN);

            const { banCommand } = require("../../bot/commands/ban");
            await banCommand(ctx);

            expect(ctx.reply).toHaveBeenCalledWith("❗️ آی‌دی معتبر نیست.");

            parseSpy.mockRestore();
        });
    });

    test("ban command logs warning when sending to user fails with description", async () => {
        await jest.isolateModulesAsync(async () => {
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../bot/utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            const blocked = new Set();
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: blocked,
            }));

            const sendMessage = jest
                .fn()
                .mockRejectedValueOnce({ description: "network error" })
                .mockResolvedValueOnce(true);

            const ctx = {
                message: {
                    chat: { id: 12345 },
                    reply_to_message: { text: "🆔 321" },
                },
                from: { username: "admin" },
                reply: jest.fn(),
                telegram: { sendMessage },
            };

            const warnSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            const { banCommand } = require("../../bot/commands/ban");
            await banCommand(ctx);

            expect(sendMessage).toHaveBeenCalled();
            expect(blocked.has(321)).toBe(true);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("ارسال پیام"),
                "network error"
            );

            warnSpy.mockRestore();
        });
    });

    test("sends reaction when not admin", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockSendReaction = jest.fn();
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../bot/utils/adminChecker", () => ({
                isAdminTalking: async () => false,
            }));
            jest.doMock("../../bot/utils/sendReaction", () => ({
                sendReaction: mockSendReaction,
            }));
            jest.doMock("../../bot/utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../bot/commands/ban");
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
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../bot/utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 999,
                blockedUsers: new Set(),
            }));
            jest.doMock("../../bot/utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../bot/commands/ban");
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
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../bot/utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: new Set(),
            }));
            jest.doMock("../../bot/utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../bot/commands/ban");
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
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../bot/utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: new Set(),
            }));
            jest.doMock("../../bot/utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../bot/commands/ban");
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
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../bot/utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            const blocked = new Set([42]);
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: blocked,
            }));
            jest.doMock("../../bot/utils/errorReply", () => ({
                errorReply: jest.fn(),
            }));

            const { banCommand } = require("../../bot/commands/ban");
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
            jest.doMock("../../bot/utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../bot/utils/adminChecker", () => ({
                isAdminTalking: async () => true,
            }));
            const blocked = new Set();
            jest.doMock("../../bot/config/config", () => ({
                ADMIN_GROUP_ID: 12345,
                blockedUsers: blocked,
            }));
            jest.doMock("../../bot/utils/errorReply", () => ({
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

            const { banCommand } = require("../../bot/commands/ban");
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
