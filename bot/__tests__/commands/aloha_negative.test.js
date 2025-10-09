jest.resetModules();

test("aloha returns early when groupValidator false", async () => {
    jest.doMock("../../utils/groupValidator", () => ({
        groupValidator: () => false,
    }));
    const { alohaCommand } = require("../../commands/aloha");

    const ctx = { message: { from: { username: "x" } }, reply: jest.fn() };
    await alohaCommand(ctx);
    expect(ctx.reply).not.toHaveBeenCalled();
});
