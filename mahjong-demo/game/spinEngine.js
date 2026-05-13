const crypto = require('crypto');
const { RngEngine, createSeed } = require('./rng');
const { generateBoard, countSymbol } = require('./boardGenerator');
const { checkWins, calculateStepWin, capTotalWin } = require('./payoutEngine');
const { cascade } = require('./cascadeEngine');
const { appendAudit } = require('./auditLog');
const wallet = require('./wallet');
const sessionStats = require('./sessionStats');
const {
  BASE_MULTIPLIERS,
  FREE_SPIN_MULTIPLIERS,
  FREE_SPIN_RULES,
  ENGINE_LIMITS
} = require('./config');

function multiplierAt(index, mode) {
  const table = mode === 'freeSpin' ? FREE_SPIN_MULTIPLIERS : BASE_MULTIPLIERS;
  return table[Math.min(index, table.length - 1)];
}

function playOneBoard({ rng, betAmount, mode, spinIndex = 0 }) {
  let board = generateBoard(rng, mode);
  const initialBoard = board.map(row => [...row]);
  const steps = [];
  let totalWin = 0;
  let cascadeIndex = 0;

  while (cascadeIndex < ENGINE_LIMITS.maxCascadeSteps) {
    const wins = checkWins(board, betAmount);
    if (wins.length === 0) break;

    const multiplier = multiplierAt(cascadeIndex, mode);
    const stepWin = calculateStepWin(wins, multiplier);
    totalWin += stepWin;

    const { removedBoard, nextBoard } = cascade(board, wins, rng, mode);

    steps.push({
      spinIndex,
      cascadeIndex,
      mode,
      boardBefore: board,
      wins,
      multiplier,
      stepWin,
      removedBoard,
      boardAfter: nextBoard
    });

    board = nextBoard;
    cascadeIndex += 1;
  }

  return {
    mode,
    spinIndex,
    initialBoard,
    finalBoard: board,
    scatterCount: countSymbol(initialBoard, 'S'),
    totalWin,
    steps
  };
}

function spin({ playerId = 'demo-player', betAmount = 1000, seed, useWallet = true, buyFeature = false } = {}) {
  betAmount = Math.floor(Number(betAmount));
  if (!Number.isFinite(betAmount) || betAmount <= 0) throw new Error('Invalid betAmount');

  const spinId = `SPIN-${crypto.randomUUID()}`;
  const finalSeed = seed || createSeed(spinId);
  const rng = new RngEngine(finalSeed);

  const featureCost = buyFeature ? betAmount * FREE_SPIN_RULES.buyFeatureCostMultiplier : betAmount;
  const balanceBefore = wallet.getBalance(playerId);
  if (useWallet) wallet.debit(playerId, featureCost);

  let base;
  let totalWin = 0;
  let freeSpinTriggered = false;
  let remainingFreeSpins = 0;

  if (buyFeature) {
    base = {
      mode: 'base',
      spinIndex: 0,
      initialBoard: [],
      finalBoard: [],
      scatterCount: FREE_SPIN_RULES.triggerScatterCount,
      totalWin: 0,
      steps: [],
      skippedByBuyFeature: true
    };
    freeSpinTriggered = true;
    remainingFreeSpins = FREE_SPIN_RULES.awardSpins;
  } else {
    base = playOneBoard({ rng, betAmount, mode: 'base', spinIndex: 0 });
    totalWin = base.totalWin;
    freeSpinTriggered = base.scatterCount >= FREE_SPIN_RULES.triggerScatterCount;
    remainingFreeSpins = freeSpinTriggered ? FREE_SPIN_RULES.awardSpins : 0;
  }

  const freeSpins = [];
  let freeSpinIndex = 0;

  while (remainingFreeSpins > 0 && freeSpinIndex < FREE_SPIN_RULES.maxSpins) {
    remainingFreeSpins -= 1;
    freeSpinIndex += 1;
    const fsResult = playOneBoard({ rng, betAmount, mode: 'freeSpin', spinIndex: freeSpinIndex });
    totalWin += fsResult.totalWin;

    if (fsResult.scatterCount >= FREE_SPIN_RULES.triggerScatterCount) {
      remainingFreeSpins += FREE_SPIN_RULES.retriggerSpins;
    }

    freeSpins.push({ ...fsResult, remainingFreeSpinsAfter: remainingFreeSpins });
  }

  const cappedTotalWin = capTotalWin(totalWin, betAmount);
  const wasCapped = cappedTotalWin !== totalWin;
  if (useWallet) wallet.credit(playerId, cappedTotalWin);
  const balanceAfter = wallet.getBalance(playerId);

  const allSteps = base.steps.length + freeSpins.reduce((sum, fs) => sum + fs.steps.length, 0);
  const session = useWallet ? sessionStats.record(playerId, {
    betAmount: featureCost,
    totalWin: cappedTotalWin,
    freeSpinTriggered,
    isBuyFeature: buyFeature
  }) : undefined;

  const result = {
    spinId,
    playerId,
    seed: finalSeed,
    rng: rng.snapshot(),
    betAmount,
    costAmount: featureCost,
    buyFeature,
    buyFeatureCostMultiplier: FREE_SPIN_RULES.buyFeatureCostMultiplier,
    balanceBefore,
    balanceAfter,
    profit: cappedTotalWin - featureCost,
    totalWin: cappedTotalWin,
    rawTotalWin: totalWin,
    wasCapped,
    freeSpinTriggered,
    base,
    freeSpins,
    session,
    summary: {
      cascades: allSteps,
      freeSpinCount: freeSpins.length,
      hit: cappedTotalWin > 0,
      winMultiplier: Number((cappedTotalWin / betAmount).toFixed(2)),
      costMultiplier: Number((featureCost / betAmount).toFixed(2)),
      profitMultiplier: Number(((cappedTotalWin - featureCost) / betAmount).toFixed(2))
    }
  };

  appendAudit({ createdAt: new Date().toISOString(), type: buyFeature ? 'buy-feature' : 'spin', result });
  return result;
}

module.exports = { spin, playOneBoard };
