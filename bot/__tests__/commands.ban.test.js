describe("ban command", () => {
    beforeEach(() => jest.resetModules());

    test("returns when groupValidator false", async () => {
        jest.mock("../utils/groupValidator", () => ({
            groupValidator: () => false,
        }));
        const { banCommand } = require("../commands/ban");
        await banCommand({ message: {} });
    });

    test("sends reaction when not admin", async () => {
        jest.mock("../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        jest.mock("../utils/adminChecker", () => ({
            isAdminTalking: async () => false,
        }));
        const mockSend = jest.fn();
        jest.mock("../utils/sendReaction", () => ({ sendReaction: mockSend }));

        const { banCommand } = require("../commands/ban");
        await banCommand({ message: {} });
        expect(mockSend).toHaveBeenCalled();
    });

    test("requires admin group id to proceed", async () => {
        jest.mock("../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        jest.mock("../utils/adminChecker", () => ({
            isAdminTalking: async () => true,
        }));
        jest.mock("../config/config", () => ({
            ADMIN_GROUP_ID: 999,
            blockedUsers: new Set(),
        }));

        const { banCommand } = require("../commands/ban");
        const ctx = { message: { chat: { id: 1 } }, reply: jest.fn() };
        await banCommand(ctx);
        // should return early because chat id != ADMIN_GROUP_ID
    });

    test("parses id and bans user successfully", async () => {
        jest.mock("../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        jest.mock("../utils/adminChecker", () => ({
            isAdminTalking: async () => true,
        }));
        jest.mock("../config/config", () => ({
            ADMIN_GROUP_ID: 1,
            blockedUsers: new Set(),
        }));

        const ctx = {
            message: { chat: { id: 1 }, reply_to_message: { text: "🆔 123" } },
            from: { username: "adm" },
            reply: jest.fn(),
            telegram: { sendMessage: jest.fn().mockResolvedValue(true) },
        };

        const { banCommand } = require("../commands/ban");
        // read mocked config to inspect the same Set instance
        const config = require("../config/config");

        await banCommand(ctx);
        expect(config.blockedUsers.has(123)).toBe(true);
        expect(ctx.telegram.sendMessage).toHaveBeenCalled();
    });
});
