const cooldowns = new Map();

function isOnCooldown(userId, cooldownTime) {
    const lastUsed = cooldowns.get(userId) || 0;
    return Date.now() - lastUsed < cooldownTime;
}

function setCooldown(userId) {
    cooldowns.set(userId, Date.now());
}

module.exports = { isOnCooldown, setCooldown };
