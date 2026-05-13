const { ROWS, COLS, PAYTABLE, ENGINE_LIMITS } = require('./config');
const NORMAL_SYMBOLS = Object.keys(PAYTABLE);

function cellMatches(target, cell) {
  return cell === target || cell === 'W';
}

function checkWins(board, betAmount) {
  const wins = [];

  for (const symbol of NORMAL_SYMBOLS) {
    const matchedCells = [];
    const countsByCol = [];
    let consecutiveCols = 0;
    let ways = 1;

    for (let c = 0; c < COLS; c++) {
      const colCells = [];
      for (let r = 0; r < ROWS; r++) {
        if (cellMatches(symbol, board[r][c])) {
          colCells.push({ row: r, col: c, symbol: board[r][c] });
        }
      }

      if (colCells.length === 0) break;
      consecutiveCols += 1;
      countsByCol.push(colCells.length);
      matchedCells.push(...colCells);
      ways *= colCells.length;
    }

    if (consecutiveCols >= 3) {
      const payMultiplier = PAYTABLE[symbol][consecutiveCols] || 0;
      const winAmount = Math.floor(betAmount * payMultiplier * ways);
      wins.push({
        symbol,
        matchCount: consecutiveCols,
        ways,
        countsByCol,
        payMultiplier,
        baseWin: winAmount,
        cells: matchedCells
      });
    }
  }

  return wins;
}

function calculateStepWin(wins, multiplier) {
  const baseWin = wins.reduce((sum, w) => sum + w.baseWin, 0);
  return Math.min(baseWin * multiplier, Number.MAX_SAFE_INTEGER);
}

function capTotalWin(totalWin, betAmount) {
  const cap = betAmount * ENGINE_LIMITS.maxWinMultiplier;
  return Math.min(totalWin, cap);
}

module.exports = { checkWins, calculateStepWin, capTotalWin };
