/*
    Command Name:
    Function: Rolls Dice
    Date Created: 01/26/19
    Last Updated: 01/27/19
    Last Updated By: AllusiveBox

*/

// Load in Required Files
const Discord = require(`discord.js`);
const { debug, error: errorLog } = require(`../functions/log.js`);

// Command Variables
const command = {
    bigDescription: ("Allows the user to roll dice. The number and type of dice rolled depend on user arguments provided."),
    description: "Rolls dice.",
    fullName: "Dice Roll",
    name: "roll"
}

function randomIntFrom(min, max) {
    console.log(`min ${min}`);
    console.log(`max ${max}`);
    let rando = Math.floor(Math.random() * (max - min + 1) + min);
    return rando;
}

/**
 * 
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */
module.exports.run = async (bot, message) => {
    // Debug to Console
    debug(`I am inside the ${command.fullName} command.`);

    // Grab the Arguments Passed
    let args = bot.params.get("args").split("d");

    // Figure Out Number of Dice to Roll
    let numToRoll = args.shift() || 1;

    // Split on modifier
    args = args[0].split(/([+-])/);

    // Figure Out Type of Die to Roll
    let dieToRoll = args.shift() || null;

    // Grab Modifier and ModifyBy, or Make Null
    let modifier = args.shift() || null;
    let modifyBy = args.shift() || null;

    let totalRolled = 0;
    let rolls = [];
    let totalMath = "";

    if (!dieToRoll) {
        let reply = `I'm sorry, ${message.author}, I'm unable to roll any dice due to you not telling me what kind to roll...`;
        debug(`Unable to roll due to no dice type being provided.`);
        return message.channel.send(reply);
    } 

    // Get the Roll
    for (i = 0; i < numToRoll; i++) {
        if (i !== 0) totalMath += ` + `;
        let rando = randomIntFrom(1, dieToRoll);
        totalRolled += rando;
        rolls.push(rando);
        totalMath += `${rando}`;
    }

    // Get the Final Die Roll
    let finalRoll = rolls[rolls.length - 1];

    // Check for Modifier
    if (modifier) {
        switch (modifier) {
            case "+":
                totalRolled += parseInt(modifyBy);
                totalMath += ` + ${modifyBy}`;
                break;
            case "-":
                totalRolled -= parseInt(modifyBy);
                totalMath += ` - ${modifyBy}`;
                break;
            default:
                break;
        }
    }

    // Build the Reply
    let reply = `${message.author} rolled **${totalRolled}** (${totalMath}).`;

    try {
        return message.channel.send(reply, { file: `./assets/diceanimations/roll${finalRoll}.gif` });
    } catch (error) {
        errorLog(error);
        return message.channel.send(`Error: \n${error.toString()}`)
    }
}

module.exports.help = command;