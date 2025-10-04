const express = require("express");

const startServer = (port = 3000) => {
    const app = express();
    app.use(express.json());

    app.get("/", (_req, res) => {
        res.send(`✅ Bot is running on port ${port}!`);
    });

    app.listen(port, () => {
        console.log(`✅ Express server is running on port ${port}`);
    });
};

module.exports = { startServer };
