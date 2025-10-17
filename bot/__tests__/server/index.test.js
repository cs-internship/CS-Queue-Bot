jest.resetModules();

describe("startServer", () => {
    test("registers GET / and calls listen", () => {
        const mockUse = jest.fn();
        const capturedHandlers = [];
        const mockGet = jest.fn((path, handler) => {
            capturedHandlers.push(handler);
        });
        const mockListen = jest.fn((port, cb) => cb());

        const mockExpress = () => ({
            use: mockUse,
            get: mockGet,
            listen: mockListen,
        });
        mockExpress.json = jest.fn();

        jest.doMock("express", () => mockExpress);

        const { startServer } = require("../../server/index");
        startServer(4000);
        expect(mockGet).toHaveBeenCalledWith("/", expect.any(Function));
        expect(mockListen).toHaveBeenCalledWith(4000, expect.any(Function));
        // also call with no argument to exercise default port path
        startServer();
        expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));

        // call the captured GET handler to exercise res.send
        // call both captured handlers (first -> 4000, second -> 3000)
        expect(capturedHandlers.length).toBeGreaterThanOrEqual(2);
        const mockRes = { send: jest.fn() };
        capturedHandlers[0]({}, mockRes);
        expect(mockRes.send).toHaveBeenCalledWith(
            expect.stringContaining("Bot is running on port 4000")
        );

        const mockRes2 = { send: jest.fn() };
        capturedHandlers[1]({}, mockRes2);
        expect(mockRes2.send).toHaveBeenCalledWith(
            expect.stringContaining("Bot is running on port 3000")
        );
    });
});
