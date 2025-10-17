const events = require("../../constants/events");

describe("events constants", () => {
    test("exports an array of objects with title property", () => {
        expect(Array.isArray(events)).toBe(true);
        expect(events.length).toBeGreaterThan(0);
        events.forEach((e) => expect(e).toHaveProperty("title"));
    });
});
