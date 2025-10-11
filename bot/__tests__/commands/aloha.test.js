describe("aloha Command", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });
    
    test("returns early when groupValidator is false", async () => {
        jest.doMock("../../utils/groupValidator", () => ({
            groupValidator: () => false,
        }));
        const { alohaCommand } = require("../../commands/aloha");

        const ctx = { message: { from: { username: "x" } }, reply: jest.fn() };
        await alohaCommand(ctx);
        expect(ctx.reply).not.toHaveBeenCalled();
    });

    test("replies with username when present", async () => {
        jest.doMock("../../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        const { alohaCommand } = require("../../commands/aloha");

        const ctx = {
            message: { from: { username: "alice", first_name: "Alice" } },
            reply: jest.fn(),
        };
        await alohaCommand(ctx);
        expect(ctx.reply).toHaveBeenCalledWith(
            expect.stringContaining("@alice")
        );
    });

    test("replies with first_name when username is empty", async () => {
        jest.doMock("../../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        const { alohaCommand } = require("../../commands/aloha");

        const ctx = {
            message: { from: { username: "", first_name: "Bob" } },
            reply: jest.fn(),
        };
        await alohaCommand(ctx);
        expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining("@Bob"));
    });
});
