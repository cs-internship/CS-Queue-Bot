describe("groupValidator util", () => {
    let mockReply, ctx;

    const mockConfig = { GROUP_ID: 10, ADMIN_GROUP_ID: 20 };

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        mockReply = jest.fn();
    });

    test("returns false and replies when chat id not allowed", () => {
        // Mock config
        jest.mock("../../config/config", () => mockConfig);

        const { groupValidator } = require("../utils/groupValidator");

        ctx = { message: { chat: { id: 999 } }, reply: mockReply };

        const res = groupValidator(ctx);
        expect(res).toBe(false);
        expect(mockReply).toHaveBeenCalledWith(
            expect.stringContaining(
                "این بات فقط در گروه صف برنامه CS Internship قابل استفاده است"
            )
        );
    });

    test.each([
        { chatId: mockConfig.GROUP_ID, expected: true },
        { chatId: mockConfig.ADMIN_GROUP_ID, expected: true },
    ])("returns true when chat id is allowed: %o", ({ chatId, expected }) => {
        jest.mock("../../config/config", () => mockConfig);

        const { groupValidator } = require("../utils/groupValidator");

        ctx = { message: { chat: { id: chatId } } };
        expect(groupValidator(ctx)).toBe(expected);
    });

    test("calls errorReply and returns false when ctx is malformed", () => {
        // Mock config
        jest.mock("../../config/config", () => mockConfig);

        // Mock errorReply
        jest.mock("../utils/errorReply", () => ({
            errorReply: jest.fn(),
        }));

        const { groupValidator } = require("../utils/groupValidator");
        const { errorReply } = require("../utils/errorReply");

        ctx = {}; // malformed ctx

        const result = groupValidator(ctx);

        expect(result).toBe(false);
        expect(errorReply).toHaveBeenCalled();
    });
});
