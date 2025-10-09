jest.resetModules();

describe("createWorkItem service", () => {
    test("replies when user has no username and does not call axios", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockAxios = { get: jest.fn(), post: jest.fn() };
            jest.doMock("axios", () => mockAxios);
            jest.doMock("../../config/config", () => ({
                ORGANIZATION: "org",
                PROJECT: "proj",
                WORKITEM_ID: 1,
                PARENT_ID: 2,
                PAT_TOKEN: "pat",
            }));
            const { createWorkItem } = require("../../services/azure");

            const ctx = {
                message: { date: 1, message_id: 10 },
                reply: jest.fn(),
            };
            await createWorkItem(ctx, { id: 5 }, false);

            expect(ctx.reply).toHaveBeenCalledWith(
                expect.stringContaining("یوزرنیم ندارد")
            );
            expect(mockAxios.get).not.toHaveBeenCalled();
            expect(mockAxios.post).not.toHaveBeenCalled();
        });
    });

    test("calls axios.get and axios.post and replies when isNewID true", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockGet = jest
                .fn()
                .mockResolvedValue({
                    data: {
                        fields: {
                            "System.AreaPath": "A",
                            "System.IterationPath": "I",
                            "Microsoft.VSTS.Common.Priority": 1,
                        },
                    },
                });
            const mockPost = jest.fn().mockResolvedValue({});
            jest.doMock("axios", () => ({ get: mockGet, post: mockPost }));
            jest.doMock("../../config/config", () => ({
                ORGANIZATION: "org",
                PROJECT: "proj",
                WORKITEM_ID: 1,
                PARENT_ID: 2,
                PAT_TOKEN: "pat",
            }));
            const { createWorkItem } = require("../../services/azure");

            const ctx = {
                message: { date: 1630000000, message_id: 42 },
                reply: jest.fn(),
            };
            const userData = {
                username: "tester",
                first_name: "Fn",
                last_name: "Ln",
            };

            await createWorkItem(ctx, userData, true);

            expect(mockGet).toHaveBeenCalled();
            expect(mockPost).toHaveBeenCalled();
            expect(ctx.reply).toHaveBeenCalledWith(
                expect.stringContaining("@tester")
            );
        });
    });

    test("calls errorReply when axios.post throws", async () => {
        await jest.isolateModulesAsync(async () => {
            const mockGet = jest
                .fn()
                .mockResolvedValue({
                    data: {
                        fields: {
                            "System.AreaPath": "A",
                            "System.IterationPath": "I",
                        },
                    },
                });
            const postErr = new Error("post failed");
            const mockPost = jest.fn().mockRejectedValue(postErr);
            jest.doMock("axios", () => ({ get: mockGet, post: mockPost }));
            const mockErrorReply = jest.fn();
            jest.doMock("../../utils/errorReply", () => ({
                errorReply: mockErrorReply,
            }));
            jest.doMock("../../config/config", () => ({
                ORGANIZATION: "org",
                PROJECT: "proj",
                WORKITEM_ID: 1,
                PARENT_ID: 2,
                PAT_TOKEN: "pat",
            }));

            const { createWorkItem } = require("../../services/azure");
            const ctx = {
                message: { date: 1630000000, message_id: 42 },
                reply: jest.fn(),
            };
            const userData = { username: "tester", first_name: "Fn" };

            await createWorkItem(ctx, userData, false);

            expect(mockGet).toHaveBeenCalled();
            expect(mockPost).toHaveBeenCalled();
            expect(mockErrorReply).toHaveBeenCalledWith(ctx, postErr);
        });
    });

    test("calls errorReply when axios.get throws", async () => {
        await jest.isolateModulesAsync(async () => {
            const getErr = new Error("get failed");
            const mockGet = jest.fn().mockRejectedValue(getErr);
            jest.doMock("axios", () => ({ get: mockGet, post: jest.fn() }));
            const mockErrorReply = jest.fn();
            jest.doMock("../../utils/errorReply", () => ({
                errorReply: mockErrorReply,
            }));
            jest.doMock("../../config/config", () => ({
                ORGANIZATION: "org",
                PROJECT: "proj",
                WORKITEM_ID: 1,
                PARENT_ID: 2,
                PAT_TOKEN: "pat",
            }));

            const { createWorkItem } = require("../../services/azure");
            const ctx = {
                message: { date: 1630000000, message_id: 42 },
                reply: jest.fn(),
            };
            const userData = { username: "tester" };

            await createWorkItem(ctx, userData, false);

            expect(mockGet).toHaveBeenCalled();
            expect(mockErrorReply).toHaveBeenCalledWith(ctx, getErr);
        });
    });
});
