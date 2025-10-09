describe("groupValidator util", () => {
    let mockReply, ctx;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        mockReply = jest.fn();
    });

    const mockConfig = { GROUP_ID: 10, ADMIN_GROUP_ID: 20 };

    test("returns false and replies when chat id not allowed", () => {
        jest.mock("../config/config", () => mockConfig);
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
        jest.mock("../config/config", () => mockConfig);
        const { groupValidator } = require("../utils/groupValidator");

        ctx = { message: { chat: { id: chatId } } };
        expect(groupValidator(ctx)).toBe(expected);
    });

    test("calls errorReply and returns false when ctx is malformed", () => {
        jest.mock("../config/config", () => mockConfig);
        const { groupValidator } = require("../utils/groupValidator");

        // Mock errorReply
        const mockErrorReply = jest.fn();
        jest.mock("../utils/errorReply", () => ({
            errorReply: mockErrorReply,
        }));

        ctx = {}; // ctx malformed

        const result = groupValidator(ctx);
        expect(result).toBe(false);
        expect(mockErrorReply).toHaveBeenCalled();
    });

    test("calls errorReply and returns false when ctx is malformed", () => {
        jest.mock("../config/config", () => ({
            GROUP_ID: 10,
            ADMIN_GROUP_ID: 20,
        }));

        // Mock errorReply
        const mockErrorReply = jest.fn();
        jest.mock("../utils/errorReply", () => ({
            errorReply: mockErrorReply,
        }));

        const { groupValidator } = require("../utils/groupValidator");

        const ctx = {}; 
        const result = groupValidator(ctx);

        expect(result).toBe(false); 
        expect(mockErrorReply).toHaveBeenCalled();
    });
});
