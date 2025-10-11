jest.resetModules();

describe("addIDCommand (isolated)", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("returns early when groupValidator is false", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockCreateWorkItem = jest.fn();
            const mockSendReaction = jest.fn();
            const mockIsAdminTalking = jest.fn();

            jest.doMock("../../config/config", () => ({
                ADMIN_GROUP_ID: "-100123",
                blockedUsers: new Set(),
                userMessageCounts: new Map(),
            }));
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => false,
            }));
            jest.doMock("../../utils/sendReaction", () => ({
                sendReaction: mockSendReaction,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: mockIsAdminTalking,
            }));
            jest.doMock("../../services/azure", () => ({
                createWorkItem: mockCreateWorkItem,
            }));

            const { addIDCommand } = require("../../commands/addID");

            const ctx = { chat: { id: 1 }, message: {}, reply: jest.fn() };
            await addIDCommand(ctx);

            expect(mockCreateWorkItem).not.toHaveBeenCalled();
        });
    });

    test("reacts when caller is not admin", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockCreateWorkItem = jest.fn();
            const mockSendReaction = jest.fn();
            const mockIsAdminTalking = jest.fn().mockResolvedValue(false);

            jest.doMock("../../config/config", () => ({
                ADMIN_GROUP_ID: "-100123",
                blockedUsers: new Set(),
                userMessageCounts: new Map(),
            }));
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../utils/sendReaction", () => ({
                sendReaction: mockSendReaction,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: mockIsAdminTalking,
            }));
            jest.doMock("../../services/azure", () => ({
                createWorkItem: mockCreateWorkItem,
            }));

            const { addIDCommand } = require("../../commands/addID");
            const ctx = { chat: { id: 1 }, message: {}, reply: jest.fn() };

            await addIDCommand(ctx);

            expect(mockSendReaction).toHaveBeenCalledWith(ctx, "👀");
            expect(mockCreateWorkItem).not.toHaveBeenCalled();
        });
    });

    test("reacts when no reply_to_message", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockCreateWorkItem = jest.fn();
            const mockSendReaction = jest.fn();
            const mockIsAdminTalking = jest.fn().mockResolvedValue(true);

            jest.doMock("../../config/config", () => ({
                ADMIN_GROUP_ID: "-100123",
                blockedUsers: new Set(),
                userMessageCounts: new Map(),
            }));
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../utils/sendReaction", () => ({
                sendReaction: mockSendReaction,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: mockIsAdminTalking,
            }));
            jest.doMock("../../services/azure", () => ({
                createWorkItem: mockCreateWorkItem,
            }));

            const { addIDCommand } = require("../../commands/addID");
            const ctx = { chat: { id: 1 }, message: {}, reply: jest.fn() };

            await addIDCommand(ctx);

            expect(mockSendReaction).toHaveBeenCalledWith(ctx, "🤷‍♂️");
            expect(mockCreateWorkItem).not.toHaveBeenCalled();
        });
    });

    test("calls createWorkItem when admin and reply_to_message exists", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockCreateWorkItem = jest.fn();
            const mockSendReaction = jest.fn();
            const mockIsAdminTalking = jest.fn().mockResolvedValue(true);

            jest.doMock("../../config/config", () => ({
                ADMIN_GROUP_ID: "-100123",
                blockedUsers: new Set(),
                userMessageCounts: new Map(),
            }));
            jest.doMock("../../utils/groupValidator", () => ({
                groupValidator: () => true,
            }));
            jest.doMock("../../utils/sendReaction", () => ({
                sendReaction: mockSendReaction,
            }));
            jest.doMock("../../utils/adminChecker", () => ({
                isAdminTalking: mockIsAdminTalking,
            }));
            jest.doMock("../../services/azure", () => ({
                createWorkItem: mockCreateWorkItem,
            }));

            const { addIDCommand } = require("../../commands/addID");
            const repliedUser = { id: 555, username: "test" };
            const ctx = {
                chat: { id: 1 },
                message: { reply_to_message: { from: repliedUser } },
                reply: jest.fn(),
            };

            await addIDCommand(ctx);

            expect(mockCreateWorkItem).toHaveBeenCalledWith(
                ctx,
                repliedUser,
                true
            );
        });
    });
});
