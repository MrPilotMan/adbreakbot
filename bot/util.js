
exports.validDuration = (duration) => {
    // Max and min ad duration as set by twitch (seconds)
    const MAX_AD_DURATION = 300;
    const MIN_AD_DURATION = 30;

    return (duration >= MIN_AD_DURATION) && (duration <= MAX_AD_DURATION);
};
