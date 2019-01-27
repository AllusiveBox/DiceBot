/**
 * 
 * Dice Bot DnD Bot Script
 * Version 1.0.0
 * Author: AllusiveBox
 * Date Started: 01/26/19
 * Last Updated: 01/27/19
 * Last Updated By: AllusiveBox
 * 
 */

process.chdir(__dirname); // Ensure Working Directory is Same as Current File

// Required Libraries and Files
const Discord = require('discord.js');
const fs = require('fs');
const { token: botToken } = require('./assets/files/token.json');
const config = require('./assets/files/config.json');

// Load in Required Functions
const { command: commandLog, debug, error: errorLog } = require('./assets/functions/log.js');

// Declare Bot Things
const bot = new Discord.Client({ disableEveryone: true });
bot.commands = new Discord.Collection();

// Misc
const commandRegex = new RegExp("[^A-Za-z0-9+-]");

fs.readdir('./assets/commands/', async (error, files) => {
    if (error) {
        return errorLog(error);
    }

    let jsFile = files.filter(f => f.split(".").pop() === "js");
    if (jsFile.length <= 0) {
        await debug("Unable to locate any commands!");
        return process.exit(4);
    }

    jsFile.forEach(async (file, i) => {
        let props = require(`./assets/commands/${file}`);

        bot.commands.set(props.help.name.toLowerCase(), props);
    });
})

// Ready Handler
bot.on('ready', async () => {
    debug(`${bot.user.username} is starting up...`);
});

// Uncaught Exception Handler
bot.on('UncaughtException', async (error) => {
    await errorLog(error);
    return process.exit(1);
});

// SIGINT Handler
process.on('SIGINT', async () => {
    await debug("SIGINT Signal detected. Terminating...")
    return process.exit(2);
});

// Disconnect Handler
bot.on('disconnect', async () => {
    await debug("Connection Lost. Terminating...");
    return process.exit(3);
});

// Unhandled Rejection Handler
process.on('unhandledRejection', async (reason, p) => {
    await errorLog(reason);
});

// Message Handler
bot.on('message', async (message) => {
    let prefix = config.prefix;
    let content = message.cleanContent;
    bot.params = new Discord.Collection();
    bot.params.set("args", content.slice(prefix.length).split(/ +/g));
    bot.params.set("command", bot.params.get("args").shift().toLowerCase());

    // Ignore Other Bots and DMs
    if ((message.author.bot)) return; //|| (message.channel.type == "dm")

    // Ignore Non Commands
    if (!message.content.startsWith(prefix)) return;

    if ((bot.params.get("command").includes('r')) && (bot.params.get("command").includes('d'))) { // If Roll Command
        bot.params.set("args", bot.params.get("command").substring(1, bot.params.get("command".length)));
        bot.params.set("command", "roll");
        //bot.params.set("args", bot.params.get("args").substring(1, bot.params.get("args").length - 1));
        bot.commands.get('roll').run(bot, message);
    } else {
        // Check Command Validity
        if (commandRegex.test(bot.params.get("command"))) {
            return debug(`Attempted use of Invalid Command Elements by ${message.author.username}`);
        }

        let commandFile = bot.commands.get(bot.params.get("command"));

        // Check if Command Exists
        if (!commandFile) return;

        await commandFile.run(bot, message);

    // Log Commands
    }
    return commandLog(message.author.username, bot.params);
});

bot.login(botToken);