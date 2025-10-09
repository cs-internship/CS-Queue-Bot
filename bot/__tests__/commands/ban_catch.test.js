jest.resetModules();

test("ban command handles telegram.sendMessage failure to user and continues", async () => {
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

        const { banCommand } = require("../../commands/ban");
        await banCommand(ctx);

        expect(sendMessage).toHaveBeenCalled();
        expect(blocked.has(999)).toBe(true);
    });
});
