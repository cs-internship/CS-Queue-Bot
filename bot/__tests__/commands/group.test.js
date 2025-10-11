describe("groupId commands", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });
    
    test("groupID replies with chat id", async () => {
        const { groupIDCommand } = require("../../commands/groupId");
        const ctx = { chat: { id: 123 }, reply: jest.fn() };
        await groupIDCommand(ctx);
        expect(ctx.reply).toHaveBeenCalled();
    });
});
