const { addIDCommand } = require("./addID");
const { alohaCommand } = require("./aloha");
const { banCommand } = require("./ban");
const { groupIDCommand } = require("./groupId");
const { versionCommand } = require("./version");

const registerCommands = (bot) => {
    bot.command("group_id", groupIDCommand);
    bot.command("Version", versionCommand);
    bot.command("add_ID", addIDCommand);
    bot.command("Aloha", alohaCommand);
    bot.command("Ban", banCommand);
};

module.exports = registerCommands;
