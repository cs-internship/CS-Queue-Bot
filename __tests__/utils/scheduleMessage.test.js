describe("scheduleAdminMessage util", () => {
    let bot;
    const mockSendMessage = jest.fn();

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();

        bot = { telegram: { sendMessage: mockSendMessage } };
    });

    test("schedules a job and handles no event", () => {
        // Mock node-cron
        jest.mock("node-cron", () => ({
            schedule: (expr, fn, options) => {
                expect(options).toEqual({ timezone: "Asia/Tehran" });
                fn(); // call immediately for test
                return { destroy: jest.fn() };
            },
        }));

        // Mock getTodayEvent
        jest.mock("../../bot/utils/getTodayEvent", () => ({
            getTodayEvent: () => ({ hasEvent: false }),
        }));

        // Mock config
        jest.mock("../../bot/config/config", () => ({ ADMIN_GROUP_ID: 123 }));

        const {
            scheduleAdminMessage,
        } = require("../../bot/utils/scheduleMessage");

        expect(() => scheduleAdminMessage(bot)).not.toThrow();
        expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test("when event exists, calls sendMessage with correct formatting", () => {
        jest.mock("node-cron", () => ({
            schedule: (expr, fn, options) => {
                expect(options).toEqual({ timezone: "Asia/Tehran" });
                fn();
                return { destroy: jest.fn() };
            },
        }));

        jest.mock("../../bot/utils/getTodayEvent", () => ({
            getTodayEvent: () => ({ hasEvent: true, title: "TestTitle" }),
        }));

        jest.mock("../../bot/config/config", () => ({ ADMIN_GROUP_ID: 123 }));

        const {
            scheduleAdminMessage,
        } = require("../../bot/utils/scheduleMessage");

        scheduleAdminMessage(bot);

        expect(mockSendMessage).toHaveBeenCalledWith(
            123,
            expect.stringContaining("TestTitle"),
            expect.objectContaining({ parse_mode: "MarkdownV2" })
        );
    });

    test("handles initial sendMessage error and sends error notification", async () => {
        const errorMessage = "sendMessage failed";
        const firstSendError = new Error(errorMessage);
        let sendMessageCallCount = 0;

        jest.mock("node-cron", () => ({
            schedule: (expr, fn, options) => {
                expect(options).toEqual({ timezone: "Asia/Tehran" });
                return fn(); // call immediately
            },
        }));

        jest.mock("../../bot/utils/getTodayEvent", () => ({
            getTodayEvent: () => ({ hasEvent: true, title: "TestTitle" }),
        }));

        jest.mock("../../bot/config/config", () => ({ ADMIN_GROUP_ID: 123 }));

        // Mock bot that fails first message but succeeds error notification
        const botWithRecoverableError = {
            telegram: {
                sendMessage: jest.fn(() => {
                    sendMessageCallCount++;
                    if (sendMessageCallCount === 1) {
                        throw firstSendError;
                    }
                    return Promise.resolve();
                }),
            },
        };

        const {
            scheduleAdminMessage,
        } = require("../../bot/utils/scheduleMessage");

        expect(() =>
            scheduleAdminMessage(botWithRecoverableError)
        ).not.toThrow();

        expect(
            botWithRecoverableError.telegram.sendMessage
        ).toHaveBeenCalledTimes(2);
        expect(
            botWithRecoverableError.telegram.sendMessage
        ).toHaveBeenLastCalledWith(
            123,
            expect.stringContaining(errorMessage),
            expect.objectContaining({ parse_mode: "Markdown" })
        );
    });

    test("handles both initial and error notification failures", async () => {
        jest.mock("node-cron", () => ({
            schedule: (expr, fn, options) => {
                expect(options).toEqual({ timezone: "Asia/Tehran" });
                return fn(); // call immediately
            },
        }));

        jest.mock("../../bot/utils/getTodayEvent", () => ({
            getTodayEvent: () => ({ hasEvent: true, title: "TestTitle" }),
        }));

        jest.mock("../../bot/config/config", () => ({ ADMIN_GROUP_ID: 123 }));

        // Mock bot where both messages fail
        const botWithTotalError = {
            telegram: {
                sendMessage: jest.fn(() => {
                    throw new Error("Complete failure");
                }),
            },
        };

        const {
            scheduleAdminMessage,
        } = require("../../bot/utils/scheduleMessage");

        expect(() => scheduleAdminMessage(botWithTotalError)).not.toThrow();
        expect(botWithTotalError.telegram.sendMessage).toHaveBeenCalledTimes(2);
    });
});
