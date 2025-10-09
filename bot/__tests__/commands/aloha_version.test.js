describe("aloha and version commands", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test("aloha replies when username present and groupValidator true", async () => {
        // mock groupValidator to return true
        jest.doMock("../../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));

        const ctx = {
            message: { from: { username: "testuser" } },
            reply: jest.fn(),
        };

        const { alohaCommand } = require("../../commands/aloha");
        await alohaCommand(ctx);

        expect(ctx.reply).toHaveBeenCalledWith(
            expect.stringContaining("@testuser")
        );
    });

    test("aloha does nothing when username missing", async () => {
        jest.doMock("../../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        const ctx = { message: { from: {} }, reply: jest.fn() };
        const { alohaCommand } = require("../../commands/aloha");
        await alohaCommand(ctx);
        expect(ctx.reply).not.toHaveBeenCalled();
    });

    test("version replies to owner and sendReaction called for others", async () => {
        // mock sendReaction
        const sendReaction = jest.fn();
        jest.doMock("../../utils/sendReaction", () => ({ sendReaction }));
        jest.doMock("../../config/config", () => ({ BOT_VERSION: "1.2.3" }));

        // owner
        const ctxOwner = { from: { username: "Ali_Sdg90" }, reply: jest.fn() };
        const { versionCommand } = require("../../commands/version");
        await versionCommand(ctxOwner);
        expect(ctxOwner.reply).toHaveBeenCalled();

        // non-owner
        const ctxOther = { from: { username: "someone" }, reply: jest.fn() };
        await versionCommand(ctxOther);
        expect(sendReaction).toHaveBeenCalled();
    });
});
