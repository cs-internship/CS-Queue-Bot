describe("aloha and groupId and version commands", () => {
    beforeEach(() => jest.resetModules());

    test("aloha replies when in group and has username", async () => {
        jest.mock("../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        const { alohaCommand } = require("../commands/aloha");
        const ctx = {
            message: { from: { username: "xname" } },
            reply: jest.fn(),
        };
        await alohaCommand(ctx);
        expect(ctx.reply).toHaveBeenCalled();
    });

    test("groupID replies with chat id", async () => {
        const { groupIDCommand } = require("../commands/groupId");
        const ctx = { chat: { id: 123 }, reply: jest.fn() };
        await groupIDCommand(ctx);
        expect(ctx.reply).toHaveBeenCalled();
    });

    test("version replies to owner and reacts for others", async () => {
        jest.mock("../config/config", () => ({ BOT_VERSION: "1.2.3" }));
        const mockSendReaction = jest.fn();
        jest.mock("../utils/sendReaction", () => ({
            sendReaction: mockSendReaction,
        }));

        const { versionCommand } = require("../commands/version");
        const ctxOwner = { from: { username: "Ali_Sdg90" }, reply: jest.fn() };
        await versionCommand(ctxOwner);
        expect(ctxOwner.reply).toHaveBeenCalled();

        const ctxOther = { from: { username: "someone" } };
        await versionCommand(ctxOther);
        expect(mockSendReaction).toHaveBeenCalled();
    });
});
