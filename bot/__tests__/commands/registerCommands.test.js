const registerCommands = require("../../commands/registerCommands");

describe("registerCommands", () => {
    it("registers expected commands on the bot", () => {
        const bot = { command: jest.fn() };

        registerCommands(bot);

        expect(bot.command).toHaveBeenCalledTimes(5);

        const calledNames = bot.command.mock.calls.map((c) => c[0]);
        expect(calledNames).toEqual([
            "group_id",
            "Version",
            "add_ID",
            "Aloha",
            "Ban",
        ]);

        // Ensure each handler is a function
        bot.command.mock.calls.forEach(([, handler]) => {
            expect(typeof handler).toBe("function");
        });
    });
});
