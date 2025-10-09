describe("getTodayEvent util", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test("returns no event for a date before startCalendarDate", () => {
        jest.mock("../config/config", () => ({
            startCalendarDate: "2030-01-01",
        }));
        jest.mock("../constants/events", () => [
            { title: "A" },
            { title: "B" },
            { title: "C" },
            { title: "D" },
        ]);

        const { getTodayEvent } = require("../utils/getTodayEvent");
        const res = getTodayEvent();
        expect(res.hasEvent).toBe(false);
    });

    test("getEventForDate returns correct event for Tuesday parity", () => {
        // choose start date such that target date is Tuesday and weekNumber 0
        jest.mock("../config/config", () => ({
            startCalendarDate: "2025-09-28",
        }));
        jest.mock("../constants/events", () => [
            { title: "WeekA-Tuesday" },
            { title: "WeekB-Tuesday" },
            { title: "WeekA-Sunday" },
            { title: "WeekB-Sunday" },
        ]);

        const moment = require("jalali-moment");
        const target = moment("2025-09-30", "YYYY-MM-DD"); // Tuesday

        const { getEventForDate } = require("../utils/getTodayEvent");
        const event = getEventForDate(target);
        expect(event.title).toMatch(/Tuesday/);
    });
});
