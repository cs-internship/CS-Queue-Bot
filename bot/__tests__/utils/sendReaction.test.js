describe("sendReaction util", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test("calls callApi when ctx is valid", async () => {
        const callApi = jest.fn().mockResolvedValue(true);
        const ctx = {
            chat: { id: 1 },
            message: { message_id: 2 },
            telegram: { callApi },
        };
        const { sendReaction } = require("../../utils/sendReaction");
        await sendReaction(ctx, "👍");
        expect(callApi).toHaveBeenCalled();
    });

    test("calls errorReply when ctx invalid", async () => {
        const mockErrorReply = jest.fn();
        jest.mock("../../utils/errorReply", () => ({
            errorReply: mockErrorReply,
        }));
        const { sendReaction } = require("../../utils/sendReaction");

        const ctx = {}; // invalid
        await sendReaction(ctx, "👍");
        expect(mockErrorReply).toHaveBeenCalled();
    });

    test("calls errorReply when callApi throws", async () => {
        const mockErrorReply = jest.fn();
        jest.mock("../../utils/errorReply", () => ({
            errorReply: mockErrorReply,
        }));

        const callApi = jest.fn().mockRejectedValue(new Error("boom"));
        const ctx = {
            chat: { id: 1 },
            message: { message_id: 2 },
            telegram: { callApi },
        };
        const { sendReaction } = require("../../utils/sendReaction");

        await sendReaction(ctx, "👍");
        expect(mockErrorReply).toHaveBeenCalled();
    });
});
