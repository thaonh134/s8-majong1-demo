const stats = new Map();

function empty() {
  return {
    spins: 0,
    totalBet: 0,
    totalWin: 0,
    net: 0,
    hits: 0,
    bonuses: 0,
    buyFeatures: 0,
    biggestWin: 0,
    lastUpdatedAt: null
  };
}

function get(playerId) {
  if (!stats.has(playerId)) stats.set(playerId, empty());
  const s = stats.get(playerId);
  return {
    ...s,
    rtp: s.totalBet > 0 ? Number((s.totalWin / s.totalBet).toFixed(6)) : 0,
    hitRate: s.spins > 0 ? Number((s.hits / s.spins).toFixed(6)) : 0,
    bonusRate: s.spins > 0 ? Number((s.bonuses / s.spins).toFixed(6)) : 0
  };
}

function record(playerId, { betAmount, totalWin, freeSpinTriggered, isBuyFeature = false }) {
  const s = get(playerId);
  const next = {
    spins: s.spins + 1,
    totalBet: s.totalBet + betAmount,
    totalWin: s.totalWin + totalWin,
    net: s.net + totalWin - betAmount,
    hits: s.hits + (totalWin > 0 ? 1 : 0),
    bonuses: s.bonuses + (freeSpinTriggered ? 1 : 0),
    buyFeatures: s.buyFeatures + (isBuyFeature ? 1 : 0),
    biggestWin: Math.max(s.biggestWin, totalWin),
    lastUpdatedAt: new Date().toISOString()
  };
  stats.set(playerId, next);
  return get(playerId);
}

function reset(playerId) {
  stats.set(playerId, empty());
  return get(playerId);
}

module.exports = { get, record, reset };
