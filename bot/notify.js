
// A bunch of functions for sending bot notifications to chat

function adBreakEnded(channel, message, client) {
    client.say(channel, `${channel.substr(1)} message`);
}

function adBreakStarted() {
    client.say(channel, message);
}

function botIsNotMod(channel, client) {
    // Channel comes in as #channelName, .substr(1) removes the # sign.
    client.say(channel, `@${channel.substr(1)} AdBreakBot needs moderator privilleges to function properly`);
}

function connectedToChannel(channel, client) {
    client.say(channel, 'AdBreakBot connected to your channel');
}

function gotMod(channel, client) {
    client.say(channel, 'Mod status granted, begining management');
}

function invalidCommand(channel, user, help, client) {
    client.say(channel, `@${user} Invalid command (${help}).`);
}

function successfulCommand(channel, user, msg, client) {
    client.say(channel, `@${user} ${msg}.`);
}

module.exports = {
    adBreakEnded,
    adBreakStarted,
    botIsNotMod,
    connectedToChannel,
    gotMod,
    invalidCommand,
    successfulCommand
};
