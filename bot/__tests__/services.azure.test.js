describe("azure service createWorkItem", () => {
    beforeEach(() => jest.resetModules());

    test("replies when user has no username", async () => {
        const { createWorkItem } = require("../services/azure");
        const ctx = { reply: jest.fn() };
        await createWorkItem(ctx, { username: null }, false);
        expect(ctx.reply).toHaveBeenCalled();
    });

    test("makes API calls and replies on success when isNewID", async () => {
        jest.mock("../config/config", () => ({
            ORGANIZATION: "org",
            PROJECT: "proj",
            WORKITEM_ID: 1,
            PARENT_ID: 2,
            PAT_TOKEN: "pat",
        }));
        const axios = require("axios");
        axios.get = jest
            .fn()
            .mockResolvedValue({
                data: {
                    fields: {
                        "System.AreaPath": "a",
                        "System.IterationPath": "i",
                    },
                },
            });
        axios.post = jest.fn().mockResolvedValue({});

        const { createWorkItem } = require("../services/azure");
        const ctx = {
            message: { date: Math.floor(Date.now() / 1000), message_id: 10 },
            reply: jest.fn(),
        };

        await createWorkItem(
            ctx,
            { username: "u", first_name: "F", last_name: "L" },
            true
        );
        expect(axios.get).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalled();
        expect(ctx.reply).toHaveBeenCalled();
    });

    test("calls errorReply on axios error", async () => {
        jest.mock("../config/config", () => ({
            ORGANIZATION: "org",
            PROJECT: "proj",
            WORKITEM_ID: 1,
            PARENT_ID: 2,
            PAT_TOKEN: "pat",
        }));
        const axios = require("axios");
        axios.get = jest.fn().mockRejectedValue(new Error("fail"));
        const mockErrorReply = jest.fn();
        jest.mock("../utils/errorReply", () => ({
            errorReply: mockErrorReply,
        }));

        const { createWorkItem } = require("../services/azure");
        const ctx = {
            message: { date: Math.floor(Date.now() / 1000), message_id: 10 },
            reply: jest.fn(),
        };

        await createWorkItem(ctx, { username: "u" }, false);
        expect(mockErrorReply).toHaveBeenCalled();
    });
});
