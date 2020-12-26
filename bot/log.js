const chalk = require('chalk')

function log(channel, sender, entry, logType, logStyle) {
    if (channel[0] == '#') channel = channel.substr(1);
    console.log(logStyle(`${logType.padEnd(4)} :: ${channel.padEnd(25)} :: ${sender.padEnd(25)}: ${entry}`));
}

function actn(channel, sender, entry) {
    const ACTN = chalk.magenta;
    log(channel, sender, ACTN(entry), 'ACTN');
}

function bot(channel, bot, entry) {
    const type = 'BOT';
    const style = chalk.gray;
    log(channel, bot.account.username, entry, type, style);
}

function err(channel, sender, entry) {
    const type = 'ERR';
    const style = chalk.red;
    log(channel, sender, entry, type, style);
}

function info(channel, sender, entry) {
    const type = 'INFO';
    const style = chalk.white;
    log(channel, sender, entry, type, style);
}

function recv(channel, sender, entry) {
    const type = 'RECV';
    const style = chalk.cyan;
    log(channel, sender, entry, type, style);
}

function send(channel, sender, entry) {
    const type = 'SEND';
    const style = chalk.green;
    log(channel, sender, entry, type, style);
}

function warn(channel, sender, entry) {
    const type = 'WARN';
    const style = chalk.yellow;
    log(channel, sender, entry, type, style);
}

module.exports = {
    recv,
    send,
    actn,
    info,
    warn,
    err,
    bot
}
