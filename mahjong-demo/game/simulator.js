const { spin } = require('./spinEngine');

function simulate({ rounds = 10000, betAmount = 1000, seedPrefix = 'sim' } = {}) {
  rounds = Math.max(1, Math.min(200000, Math.floor(Number(rounds))));
  let totalBet = 0;
  let totalWin = 0;
  let hits = 0;
  let bonuses = 0;
  let maxWin = 0;
  const buckets = {
    zero: 0,
    small_0_1x: 0,
    medium_1_10x: 0,
    big_10_100x: 0,
    mega_100x_plus: 0
  };

  for (let i = 0; i < rounds; i++) {
    const result = spin({ playerId: 'simulation', betAmount, seed: `${seedPrefix}-${i}`, useWallet: false });
    const win = result.totalWin;
    const multi = win / betAmount;
    totalBet += betAmount;
    totalWin += win;
    if (win > 0) hits += 1;
    if (result.freeSpinTriggered) bonuses += 1;
    if (win > maxWin) maxWin = win;

    if (multi === 0) buckets.zero += 1;
    else if (multi < 1) buckets.small_0_1x += 1;
    else if (multi < 10) buckets.medium_1_10x += 1;
    else if (multi < 100) buckets.big_10_100x += 1;
    else buckets.mega_100x_plus += 1;
  }

  return {
    rounds,
    betAmount,
    totalBet,
    totalWin,
    rtp: Number((totalWin / totalBet).toFixed(6)),
    hitRate: Number((hits / rounds).toFixed(6)),
    bonusRate: Number((bonuses / rounds).toFixed(6)),
    maxWin,
    maxWinMultiplier: Number((maxWin / betAmount).toFixed(2)),
    buckets
  };
}

module.exports = { simulate };
