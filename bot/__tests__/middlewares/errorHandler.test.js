jest.useFakeTimers();

describe("errorHandler middleware", () => {
    beforeEach(() => jest.resetModules());

    it("sends error to admin when ctx.telegram exists and no 429", async () => {
        const mockSendMessage = jest.fn().mockResolvedValue(true);
        const ctx = {
            telegram: { sendMessage: mockSendMessage },
            from: { first_name: "FN", username: "user", id: 1 },
        };

        const handler = require("../../middlewares/errorHandler");
        const err = new Error("boom");

        await handler(err, ctx);

        expect(mockSendMessage).toHaveBeenCalled();
    });

    it("schedules send when 429 rate limit is present", async () => {
        const mockSendMessage = jest.fn().mockResolvedValue(true);
        const ctx = {
            telegram: { sendMessage: mockSendMessage },
            from: { first_name: "FN" },
        };

        const handler = require("../../middlewares/errorHandler");
        const err = {
            response: { error_code: 429, parameters: { retry_after: 1 } },
            message: "rate",
        };

        // call handler
        await handler(err, ctx);

        // fast-forward timers (retry_after * 1000 + 5000)
        jest.advanceTimersByTime(6000 + 1000);

        expect(mockSendMessage).toHaveBeenCalled();
    });
});
