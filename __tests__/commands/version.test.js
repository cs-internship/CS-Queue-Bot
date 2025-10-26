describe("version commands", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("version replies to owner and reacts for others", async () => {
        jest.mock("../../bot/config/config", () => ({ BOT_VERSION: "1.2.3" }));
        const mockSendReaction = jest.fn();
        jest.mock("../../bot/utils/sendReaction", () => ({
            sendReaction: mockSendReaction,
        }));

        const { versionCommand } = require("../../bot/commands/version");

        const ctxOwner = { from: { username: "Ali_Sdg90" }, reply: jest.fn() };
        await versionCommand(ctxOwner);
        expect(ctxOwner.reply).toHaveBeenCalled();

        const ctxOther = { from: { username: "someone" } };
        await versionCommand(ctxOther);
        expect(mockSendReaction).toHaveBeenCalled();
    });

    test("version error path calls errorReply when reply throws", async () => {
        jest.doMock("../../bot/config/config", () => ({
            BOT_VERSION: "0.0.0",
        }));
        const mockErrorReply = jest.fn();
        jest.doMock("../../bot/utils/errorReply", () => ({
            errorReply: mockErrorReply,
        }));

        const { versionCommand } = require("../../bot/commands/version");

        const ctx = {
            from: { username: "Ali_Sdg90" },
            reply: () => {
                throw new Error("boom");
            },
        };

        await versionCommand(ctx);

        expect(mockErrorReply).toHaveBeenCalled();
    });
});
