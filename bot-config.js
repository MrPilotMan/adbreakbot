const startMessage = "\
is taking an ad break to prevent pre-rolls. Don't worry, we'll wait for you to get back. You won't \
miss a minute of the stream!"

const endMessage = "\
The ad break is almost over. Time to get back to the fun!"

const adBreakTitle = "\
Taking a quick ad break, be right back"

module.exports = {
    account: {
        oauth: '',
        username: '',
    },
    default: {
        delay: 5,      // Minutes
        // Default duration and interval is a 90 second ad every 60 minutes to allow for 30 minutes
        // of adjustment time if the top of the hour is an inopportune moment to take a break.
        duration: 90,  // Seconds
        interval: 60,  // Minutes
        offset: 5,     // How long to wait before running the ad when using !ad (seconds)
    },
    settings: {
        adBreakTitle: adBreakTitle,
        auto: true,
        clearChat: false,
        // Start
        notifyChatOnStart: true,
        notifyChatMessageStart: startMessage,
        timesToSendStartMessage: 1,  // How many times should the notification message be sent to chat.
        // End
        notifyChatOnEnd: true,
        notifyChatMessageEnd: endMessage,
        timesToSendEndMessage: 1,
        slowmodeOn: true,
    },
    serverName: 'server',
    channels: [''],
}
