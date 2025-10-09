jest.resetModules();

test("version error path calls errorReply when reply throws", async () => {
    jest.doMock("../../config/config", () => ({ BOT_VERSION: "0.0.0" }));
    const mockErrorReply = jest.fn();
    jest.doMock("../../utils/errorReply", () => ({
        errorReply: mockErrorReply,
    }));

    const { versionCommand } = require("../../commands/version");

    const ctx = {
        from: { username: "Ali_Sdg90" },
        reply: () => {
            throw new Error("boom");
        },
    };

    await versionCommand(ctx);

    expect(mockErrorReply).toHaveBeenCalled();
});
