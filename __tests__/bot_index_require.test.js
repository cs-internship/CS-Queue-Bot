jest.resetModules();

test("requiring bot index does not crash when Telegraf is mocked", () => {
    const mockUse = jest.fn();
    const mockOn = jest.fn();
    const mockCatch = jest.fn();
    const mockCommand = jest.fn();
    const mockLaunch = jest.fn();
    const mockStop = jest.fn();
    const mockTelegram = { sendMessage: jest.fn(), callApi: jest.fn() };

    const MockTelegraf = function () {
        return {
            use: mockUse,
            start: mockOn,
            on: mockOn,
            catch: mockCatch,
            command: mockCommand,
            launch: mockLaunch,
            stop: mockStop,
            telegram: mockTelegram,
        };
    };

    jest.doMock("telegraf", () => ({ Telegraf: MockTelegraf }));
    // mock the same module id that index.js requires
    jest.doMock("../bot/config/config", () => ({
        TELEGRAM_BOT_TOKEN: "x",
        PORT: 3000,
    }));
    // avoid starting an express server or scheduling jobs
    jest.doMock("../bot/server", () => ({ startServer: jest.fn() }));
    jest.doMock("../bot/utils/scheduleMessage", () => ({
        scheduleAdminMessage: jest.fn(),
    }));
    jest.doMock("../bot/commands/registerCommands", () => jest.fn());

    // require the bot module directly to avoid executing the top-level launcher in index.js
    const mod = require("../bot");
    expect(mod.bot).toBeDefined();
});
