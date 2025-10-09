describe("getTodayEvent util", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("returns no event for a date before startCalendarDate", () => {
        jest.mock("../../config/config", () => ({
            startCalendarDate: "2030-01-01",
        }));
        jest.mock("../../constants/events", () => [
            { title: "A" },
            { title: "B" },
            { title: "C" },
            { title: "D" },
        ]);

        const { getTodayEvent } = require("../../utils/getTodayEvent");
        const res = getTodayEvent();
        expect(res.hasEvent).toBe(false);
    });

    test("returns event for a date after startCalendarDate", () => {
        jest.mock("../../config/config", () => ({
            startCalendarDate: "2010-01-01",
        }));
        jest.mock("jalali-moment", () => {
            const originalMoment = jest.requireActual("jalali-moment");
            return (date) => {
                if (!date) return originalMoment("2025-09-30", "YYYY-MM-DD");
                return originalMoment(date);
            };
        });
        jest.mock("../../constants/events", () => [
            { title: "A" },
            { title: "B" },
            { title: "C" },
            { title: "D" },
        ]);

        const { getTodayEvent } = require("../../utils/getTodayEvent");
        const res = getTodayEvent();

        expect(res.hasEvent).toBe(true);
        expect(res.title).toMatch(/A|B|C|D/);
    });

    test("getEventForDate returns correct event for Tuesday parity", () => {
        // choose start date such that target date is Tuesday and weekNumber 0
        jest.mock("../../config/config", () => ({
            startCalendarDate: "2025-09-28",
        }));
        jest.mock("../../constants/events", () => [
            { title: "WeekA-Tuesday" },
            { title: "WeekB-Tuesday" },
            { title: "WeekA-Sunday" },
            { title: "WeekB-Sunday" },
        ]);

        const moment = require("jalali-moment");
        const target = moment("2025-09-30", "YYYY-MM-DD"); // Tuesday

        const { getEventForDate } = require("../../utils/getTodayEvent");
        const event = getEventForDate(target);
        expect(event.title).toMatch(/Tuesday/);
    });

    test("getEventForDate returns correct event for Sunday parity", () => {
        // choose start date such that target date is Sunday and weekNumber 0
        jest.mock("../../config/config", () => ({
            startCalendarDate: "2025-09-28",
        }));
        jest.mock("../../constants/events", () => [
            { title: "WeekA-Tuesday" },
            { title: "WeekB-Tuesday" },
            { title: "WeekA-Sunday" },
            { title: "WeekB-Sunday" },
        ]);

        const moment = require("jalali-moment");
        const target = moment("2025-09-28", "YYYY-MM-DD"); // Sunday

        const { getEventForDate } = require("../../utils/getTodayEvent");
        const event = getEventForDate(target);
        expect(event.title).toMatch(/Sunday/);
    });

    test("getEventForDate returns false event for Thursday parity", () => {
        // choose start date such that target date is Thursday and weekNumber 0
        jest.mock("../../config/config", () => ({
            startCalendarDate: "2025-09-28",
        }));
        jest.mock("../../constants/events", () => [
            { title: "WeekA-Tuesday" },
            { title: "WeekB-Tuesday" },
            { title: "WeekA-Sunday" },
            { title: "WeekB-Sunday" },
        ]);

        const moment = require("jalali-moment");
        const target = moment("2025-10-01", "YYYY-MM-DD"); // Thursday

        const { getEventForDate } = require("../../utils/getTodayEvent");
        const event = getEventForDate(target);
        expect(event).toBe(null);
    });
});
