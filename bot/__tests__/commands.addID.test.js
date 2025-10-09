describe("addID command", () => {
    beforeEach(() => jest.resetModules());

    test("returns when groupValidator false", async () => {
        jest.mock("../utils/groupValidator", () => ({
            groupValidator: () => false,
        }));
        const { addIDCommand } = require("../commands/addID");
        const ctx = { message: {} };
        await addIDCommand(ctx); // should return without throwing
    });

    test("sends reaction if not admin", async () => {
        jest.mock("../utils/groupValidator", () => ({
            groupValidator: () => true,
        }));
        jest.mock("../utils/adminChecker", () => ({
            isAdminTalking: async () => false,
        }));
        const mockSend = jest.fn();
        jest.mock("../utils/sendReaction", () => ({ sendReaction: mockSend }));

        const { addIDCommand } = require("../commands/addID");
        const ctx = { message: {} };
        await addIDCommand(ctx);
        expect(mockSend).toHaveBeenCalled();
    });
});
