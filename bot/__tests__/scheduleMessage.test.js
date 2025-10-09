describe("scheduleMessage util", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test("schedules a job and handles no event", () => {
        // Mock node-cron schedule to call the function immediately for test
        jest.mock("node-cron", () => ({
            schedule: (expr, fn) => {
                fn();
                return { destroy: jest.fn() };
            },
        }));

        jest.mock("../utils/getTodayEvent", () => ({
            getTodayEvent: () => ({ hasEvent: false }),
        }));
        jest.mock("../config/config", () => ({ ADMIN_GROUP_ID: 123 }));

        const bot = { telegram: { sendMessage: jest.fn() } };

        const { scheduleAdminMessage } = require("../utils/scheduleMessage");
        expect(() => scheduleAdminMessage(bot)).not.toThrow();
    });

    test("when event exists, calls sendMessage", () => {
        jest.mock("node-cron", () => ({
            schedule: (expr, fn) => {
                fn();
                return { destroy: jest.fn() };
            },
        }));

        jest.mock("../utils/getTodayEvent", () => ({
            getTodayEvent: () => ({ hasEvent: true, title: "TestTitle" }),
        }));
        jest.mock("../config/config", () => ({ ADMIN_GROUP_ID: 123 }));

        const bot = { telegram: { sendMessage: jest.fn() } };

        const { scheduleAdminMessage } = require("../utils/scheduleMessage");
        scheduleAdminMessage(bot);
        expect(bot.telegram.sendMessage).toHaveBeenCalled();
    });
});
