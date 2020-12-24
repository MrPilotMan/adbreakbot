const notify = require('./notify.js')

function run(channel, duration, bot, client) {
    // If the ad was cancelled (dequeued) exit
    if (!bot.ad.queued) return;

    // Save time
    let adStartTime = new Date().getTime();

    // Start ad
    client.commercial(channel, duration);
    // Update ad.queued and ad.running in this order prevent them from being
    // simulatenously false while the runAdBreak function is executing.
    bot.ad.running = true;
    bot.ad.queued = false;

    // Turn on slowmode
    if (bot.settings.slowmodeOn) {
        client.slow(channel, duration + 1000)
            .then((data) => log(bot.account.username, 'Slow mode on', 'SEND'))
            .catch((err) => log(bot.serverName, 'Failed to turn on slow mode', 'SEND'))
    }

    // Clear chat
    if (bot.settings.clearChat) {
        client.clear(channel)
            .then((data) => log(bot.account.username, 'Chat cleared', 'SEND'))
            .catch((err) => log(bot.serverName, 'Failed to clear chat', 'ERR'));
    }

    // Set stream title (no tmi command?)

    // Stuff to do repeatedly while the ad is running
    while (bot.ad.running) {
        if (bot.settings.notifyChat) {
            let timesStartMessageSent = 0;

            while (timesStartMessageSent < bot.settings.timesToSendStartMessage) {
                setTimeout(() => {
                    notify.adBreakStarted(channel, bot.settings.notifyChatMessageStart, client);
                    timesStartMessageSent++;
                }, 500);
            }
        }
    }

    // End of ad break
    if (bot.settings.notifyChatOnEnd) {
        let timesEndMessageSent = 0;

        while (timesEndMessageSent < bot.settings.timesToSendEndMessage) {
            setTimeout(() => {
                notify.adBreakEnded(channel, bot.settings.notifyChatMessageEnd, client)
                timesEndMessageSent++;
            }, 500);
        }
    }

    bot.ad.lastAdTime = adStartTime;
}

module.exports = { run }
