const moment = require("jalali-moment");
const { startCalendarDate } = require("../config/config");
const events = require("../constants/events");

const getEventForDate = (dateInput) => {
    let date;
    date = dateInput.clone().startOf("day");

    const startDate = moment(startCalendarDate, "YYYY-MM-DD");

    if (date.isBefore(startDate, "day")) return null;

    const daysSinceStart = date.diff(startDate, "days");
    const weekNumber = Math.floor(daysSinceStart / 7) % 2;

    const weekday = date.day();

    // Tuesday -> 2
    // Sunday -> 0
    if (weekday === 2) {
        return events[weekNumber];
    } else if (weekday === 0) {
        return events[2 + weekNumber];
    }

    return null;
};

const getTodayEvent = () => {
    const today = moment();
    const event = getEventForDate(today);

    if (event) {
        return {
            hasEvent: true,
            title: event.title,
        };
    }

    return {
        hasEvent: false,
        title: "برای امروز رویدادی وجود ندارد.",
    };
};

module.exports = { getTodayEvent, getEventForDate };
