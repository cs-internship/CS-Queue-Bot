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
            schedule: (expr, fn) => {
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

        const { scheduleAdminMessage } = require("../../bot/utils/scheduleMessage");

        expect(() => scheduleAdminMessage(bot)).not.toThrow();
        expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test("when event exists, calls sendMessage", () => {
        jest.mock("node-cron", () => ({
            schedule: (expr, fn) => {
                fn();
                return { destroy: jest.fn() };
            },
        }));

        jest.mock("../../bot/utils/getTodayEvent", () => ({
            getTodayEvent: () => ({ hasEvent: true, title: "TestTitle" }),
        }));

        jest.mock("../../bot/config/config", () => ({ ADMIN_GROUP_ID: 123 }));

        const { scheduleAdminMessage } = require("../../bot/utils/scheduleMessage");

        scheduleAdminMessage(bot);

        expect(mockSendMessage).toHaveBeenCalledWith(
            123,
            expect.stringContaining("TestTitle"),
            expect.objectContaining({ parse_mode: "Markdown" })
        );
    });

    test("handles sendMessage error gracefully", async () => {
        jest.mock("node-cron", () => ({
            schedule: (expr, fn) => {
                return fn(); // call immediately
            },
        }));

        jest.mock("../../bot/utils/getTodayEvent", () => ({
            getTodayEvent: () => ({ hasEvent: true, title: "TestTitle" }),
        }));

        jest.mock("../../bot/config/config", () => ({ ADMIN_GROUP_ID: 123 }));

        // Mock bot.telegram.sendMessage to throw error
        const botWithError = {
            telegram: {
                sendMessage: jest.fn(() => {
                    throw new Error("sendMessage failed");
                }),
            },
        };

        const { scheduleAdminMessage } = require("../../bot/utils/scheduleMessage");

        expect(() => scheduleAdminMessage(botWithError)).not.toThrow();
    });
});
