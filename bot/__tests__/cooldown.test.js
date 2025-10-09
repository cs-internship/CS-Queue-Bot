const { isOnCooldown, setCooldown } = require("../utils/cooldown");

describe("cooldown util", () => {
    beforeEach(() => {
        // Reset internal map by re-requiring the module to get fresh state
        jest.resetModules();
    });

    test("setCooldown followed by immediate check returns true for short cooldown", () => {
        const {
            isOnCooldown: isOnCooldownFresh,
            setCooldown: setCooldownFresh,
        } = require("../utils/cooldown");
        const userId = "user1";
        setCooldownFresh(userId);
        expect(isOnCooldownFresh(userId, 1000)).toBe(true);
    });

    test("isOnCooldown returns false after time passes", (done) => {
        const {
            isOnCooldown: isOnCooldownFresh,
            setCooldown: setCooldownFresh,
        } = require("../utils/cooldown");
        const userId = "user2";
        setCooldownFresh(userId);
        setTimeout(() => {
            expect(isOnCooldownFresh(userId, 10)).toBe(false);
            done();
        }, 20);
    });
});
