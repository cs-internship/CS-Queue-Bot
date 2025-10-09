describe("adminChecker util", () => {
    let mockErrorReply;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();

        mockErrorReply = jest.fn();
    });

    test("returns true for administrator and creator statuses", async () => {
        jest.mock("../../utils/errorReply", () => ({
            errorReply: mockErrorReply,
        }));
        const { isAdminTalking } = require("../../utils/adminChecker");

        const ctx = {
            telegram: {
                getChatMember: jest
                    .fn()
                    .mockResolvedValue({ status: "administrator" }),
            },
            chat: { id: 111 },
            from: { id: 222 },
        };

        await expect(isAdminTalking(ctx)).resolves.toBe(true);
    });

    test("returns false for non-admin status", async () => {
        jest.mock("../../utils/errorReply", () => ({
            errorReply: mockErrorReply,
        }));
        const { isAdminTalking } = require("../../utils/adminChecker");

        const ctx = {
            telegram: {
                getChatMember: jest
                    .fn()
                    .mockResolvedValue({ status: "member" }),
            },
            chat: { id: 11 },
            from: { id: 22 },
        };

        await expect(isAdminTalking(ctx)).resolves.toBe(false);
    });

    test("on error calls errorReply and returns false", async () => {
        jest.mock("../../utils/errorReply", () => ({
            errorReply: mockErrorReply,
        }));
        const { isAdminTalking } = require("../../utils/adminChecker");

        const ctx = {
            telegram: {
                getChatMember: jest.fn().mockRejectedValue(new Error("boom")),
            },
            chat: { id: 1 },
            from: { id: 2 },
        };

        await expect(isAdminTalking(ctx)).resolves.toBe(false);
        expect(mockErrorReply).toHaveBeenCalledWith(ctx, expect.any(Error));
    });
});
