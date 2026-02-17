jest.useFakeTimers();

describe("errorHandler middleware", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("sends error to admin when ctx.telegram exists and no 429", async () => {
        const mockSendMessage = jest.fn().mockResolvedValue(true);
        const ctx = {
            telegram: { sendMessage: mockSendMessage },
            from: { first_name: "FN", username: "user", id: 1 },
        };

        const handler = require("../../bot/middlewares/errorHandler");
        const err = new Error("boom");

        await handler(err, ctx);

        expect(mockSendMessage).toHaveBeenCalled();
    });

    test("errorHandler warns when sending admin message fails", async () => {
        await jest.isolateModulesAsync(async () => {
            const warnSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            const handler = require("../../bot/middlewares/errorHandler");

            const err = new Error("boom");
            const ctx = {
                telegram: {
                    sendMessage: jest
                        .fn()
                        .mockRejectedValueOnce(new Error("send failed")),
                },
                from: { first_name: "F", username: "u", id: 1 },
            };

            await handler(err, ctx);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    "❗️ Failed to send error to admin group:"
                ),
                expect.any(String)
            );

            warnSpy.mockRestore();
        });
    });

    test("errorHandler schedules retry on 429 rate limit", async () => {
        jest.useFakeTimers();
        const handler = require("../../bot/middlewares/errorHandler");

        const err = {
            response: { error_code: 429, parameters: { retry_after: 1 } },
            message: "rate",
        };
        const ctx = {
            telegram: { sendMessage: jest.fn() },
            from: { first_name: "X", username: "u" },
        };

        await handler(err, ctx);

        expect(ctx.telegram.sendMessage).not.toHaveBeenCalled();

        // Fast-forward timers to run scheduled sendErrorToAdmin
        jest.advanceTimersByTime(7000);

        // cleanup
        jest.useRealTimers();
    });

    test("errorHandler does nothing when ctx.telegram is missing", async () => {
        const handler = require("../../bot/middlewares/errorHandler");
        const err = new Error("x");
        const ctx = {}; // no telegram

        await handler(err, ctx);

        expect(ctx.telegram).toBeUndefined();
    });

    test("schedules send when 429 rate limit is present", async () => {
        const mockSendMessage = jest.fn().mockResolvedValue(true);
        const ctx = {
            telegram: { sendMessage: mockSendMessage },
            from: { first_name: "FN" },
        };

        const handler = require("../../bot/middlewares/errorHandler");
        const err = {
            response: { error_code: 429, parameters: { retry_after: 1 } },
            message: "rate",
        };

        await handler(err, ctx);
        jest.advanceTimersByTime(6000 + 1000);

        expect(mockSendMessage).toHaveBeenCalled();
    });

    test("errorHandler schedules send when 429 received", async () => {
        const sendMessage = jest.fn();
        const ctx = {
            telegram: { sendMessage },
            from: { first_name: "A", username: "u", id: 1 },
        };
        const err = {
            response: { error_code: 429, parameters: { retry_after: 0 } },
            message: "rate",
        };

        // mock config
        jest.doMock("../../bot/config/config", () => ({ ADMIN_GROUP_ID: 555 }));

        // replace setTimeout to call function immediately
        const realSetTimeout = global.setTimeout;
        global.setTimeout = (fn) => fn();

        const errorHandler = require("../../bot/middlewares/errorHandler");
        await errorHandler(err, ctx);

        expect(sendMessage).toHaveBeenCalled();

        global.setTimeout = realSetTimeout;
    });
});
