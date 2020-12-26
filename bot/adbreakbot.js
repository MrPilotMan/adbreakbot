const chalk = require('chalk');
const tmi = require('tmi.js');

const adBreak = require('./adbreak.js');
const log = require('./log.js');
const util = require('./util.js');
const notify = require('./notify.js');

// Load correct bot config file
const dev = true;
const configFilePath = (dev === true) ? '../dev-config.js' : '../bot-config.js';
const config = require(configFilePath);

// Max time between ads to prevent preroll ads (seconds)
const MAX_AD_INTERVAL = 5400;

// Object to store any bot state
var bot = {
    account: config.account,
    ad: { queued: false, running: false, lastAdTime: 0, },
    channel: "",
    default: config.default,
    isMod: false,
    serverName: config.serverName,
    settings: config.settings,
};

const client = new tmi.Client({
    connection: {
        reconnect: true,
        maxReconnectAttempts: 10,
        reconnectDecay: 2,
    },
    identity: {
        username: bot.account.username,
        password: bot.account.oauth,
    },
    channels: config.channels,
});

client.connect();

client.on('connected', (addr, port) => {
    log.info('twitch.tv', bot.serverName, `Connected to ${addr}:${port}`);
});

// Triggers on joining a room
client.on('roomstate', (channel, state) => {
    // Say hello to chat
    log.info(channel, bot.serverName, `AdBreakBot connected to ${channel.substr(1)}`);
    notify.connectedToChannel(channel, client);

    // Confirm bot is a mod and notify streamer if it isn't then try reconnecting
    var checkMod = setInterval(() => {
        client.mods(channel)  // Gets an array of mod usernames
            .then((mods) => {
                if (mods.includes(bot.account.username.toLowerCase())) {
                    bot.isMod = true;
                    log.recv(channel, bot.serverName, 'Mod granted');
                    clearInterval(checkMod);
                } else {
                    log.warn(channel, bot.serverName, 'Bot is not a mod');
                    notify.botIsNotMod(channel, client);
                }
            })
            .catch((err) => log.err(channel, bot.serverName, 'Unable to fetch mods list'));
    }, 3000);
})

client.on('message', (channel, userstate, command, self) => {
    // Ignore messages from non-moderators and the bots own messages
    // ORDER OF CHECKS MATTERS!
    if (!userstate.mod && !userstate.badges.broadcaster && !bot.isMod) return;

    // If the message was from the bot, log it and return
    if (self) { log.bot(channel, bot, command); return; }

    // parse and clean command and sender info
    command = command.trim().split(' ');
    sender = userstate.username.toLowerCase();

    switch (command[0]) {
        // Manually start or schedule and ad break. (eg. !ad [duration] [offset])
        case '!ad':
            // Log the received command
            log.recv(channel, sender, command);

            // Parse out duration and offset and resort to defaults if neccesary
            let duration = parseInt(command[1]);
            duration = (!isNaN(duration) && util.validDuration(duration))
                         ? Math.abs(duration)
                         : bot.default.duration;

            let offset = parseInt(command[2]);
            offset = (!isNaN(offset))
                       ? Math.abs(offset)
                       : bot.default.offset;

            // Log offset period starting
            log.info(channel, bot.serverName, `Starting ${duration} second ad in ${offset} seconds`)

            // Set the ad queued flag and start the offset timer
            bot.ad.queued = setTimeout(() => {
                adBreak.run(channel, duration, bot, client);
            }, 1000 * offset);

            break;

        // Put the bot into automatic managment mode. (!auto)
        case '!auto':
            // Log the received command
            log.warn(channel, sender, command);

            if (!bot.settings.auto) {
                bot.settings.auto = false;

                log.actn(channel, bot.account.username, 'Bot set to auto mode.');
                notify.successfulCommand(channel, sender, 'AdBreakBot is now in manual mode', client);
            } else {
                let help = 'bot is already in manual mode';
                log.warn(channel, bot.serverName, `Unnecessary command (${help})`);
                notify.invalidCommand(channel, sender, help, client);
            }

            break;

        // Cancel a queued ad break. (!cancel)
        case '!cancel':
            // Log the received command
            log.recv(channel, sender, command);

            if (bot.ad.queued) {
                clearTimeout(bot.ad.queued);
                bot.ad.queued = false;

                log.actn(channel, bot.account.username, 'Ad cancelled');
                notify.successfulCommand(channel, sender, 'Upcoming ad cancelled', client);
            } else {
                let help = 'no an ad in queue';
                log.warn(channel, bot.serverName, `Unnecessary command (${help})`);
                notify.invalidCommand(channel, sender, help, client)
            }

            break;

        // TODO
        case '!delay':
            log.recv(channel, sender, command);
            break;

        // Adjust the bot's settings from chat. (!default (delay | duration | interval | offset) [value])
        case '!default':
            log.recv(channel, sender, command);

            if (command.length !== 3) {
                let help = 'wrong number of arguments';
                log.err(channel, bot.serverName, `Invalid command (${help})`)
                notify.invalidCommand(channel, sender, help, client);
                return;
            }

            if (bot.default.keys().includes(command[1])) {
                let key = command[1];
                let value = Math.abs(parseInt(command[2]))

                if (!isNaN(value)) {
                    bot.default.key = value;
                    log.info(channel, bot.serverName, `Updated bot.default.${key} = ${value}`);
                    notify.successfulCommand(channel, sender, `Default ${key} is now set to ${value}`, client);
                } else {
                    let help = `invalid value for ${key}`
                    log.err(channel, bot.serverName, `Invalid command (${help})`);
                    notify.invalidCommand(channel, sender, help, client);
                }
            } else {
                let help = `invalid key - ${key}`
                log.err(channel, bot.serverName, `Invalid command (${help})`);
                notify.invalidCommand(channel, sender, help, client);
            }

            break;

        // Put the bot into manual managment mode. (!manual)
        case '!manual':
            log.recv(channel, sender, command);

            if (bot.settings.auto) {
                bot.settings.auto = false;

                log.actn(channel, bot.serverName, 'Bot set to manual mode.');
                notify.successfulCommand(channel, sender, 'AdBreakBot is now in manual mode', client);
            } else {
                let help = 'bot is already in manual mode';
                log.warn(channel, bot.serverName, `Unnecessary command (${help})`);
                notify.invalidCommand(channel, sender, help, client);
            }

            break;

    }
});

client.on('ping', () => client.pong());
