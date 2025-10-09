jest.resetModules();

test("errorHandler schedules send when 429 received", async () => {
    const sendMessage = jest.fn();
    const ctx = {
        telegram: { sendMessage },
        from: { first_name: "A", username: "u", id: 1 },
    };
    const err = {
        response: { error_code: 429, parameters: { retry_after: 0 } },
        message: "rate",
    };

    // mock config
    jest.doMock("../../config/config", () => ({ ADMIN_GROUP_ID: 555 }));

    // replace setTimeout to call function immediately
    const realSetTimeout = global.setTimeout;
    global.setTimeout = (fn) => fn();

    const errorHandler = require("../../middlewares/errorHandler");
    await errorHandler(err, ctx);

    expect(sendMessage).toHaveBeenCalled();

    global.setTimeout = realSetTimeout;
});
