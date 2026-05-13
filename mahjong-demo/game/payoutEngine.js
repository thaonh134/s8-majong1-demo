const { PAY_SYMBOL_CODES, getSymbol } = require('./symbols');

class PayoutEngine {
  evaluate(board, betAmount, multiplier = 1) {
    const rows = board.length;
    const cols = board[0].length;
    const wins = [];
    const winCells = new Set();
    let totalWin = 0;

    for (const symbolCode of PAY_SYMBOL_CODES) {
      const matchedByColumn = [];

      for (let c = 0; c < cols; c++) {
        const cells = [];
        for (let r = 0; r < rows; r++) {
          const cell = board[r][c];
          if (cell === symbolCode || cell === 'WILD') {
            cells.push({ row: r, col: c });
          }
        }

        if (cells.length === 0) break;
        matchedByColumn.push(cells);
      }

      const matchCols = matchedByColumn.length;
      if (matchCols >= 3) {
        const ways = matchedByColumn.reduce((product, cells) => product * cells.length, 1);
        const payRate = getSymbol(symbolCode).pays[Math.min(matchCols, 5)] || 0;
        const rawWin = betAmount * payRate * ways;
        const winAmount = rawWin * multiplier;

        matchedByColumn.flat().forEach(cell => winCells.add(`${cell.row}:${cell.col}`));

        wins.push({
          symbol: symbolCode,
          symbolLabel: getSymbol(symbolCode).label,
          matchColumns: matchCols,
          ways,
          payRate,
          multiplier,
          winAmount
        });

        totalWin += winAmount;
      }
    }

    return {
      wins,
      winCells: Array.from(winCells).map(key => {
        const [row, col] = key.split(':').map(Number);
        return { row, col };
      }),
      totalWin
    };
  }

  countScatter(board) {
    return board.flat().filter(code => code === 'SCATTER').length;
  }
}

module.exports = PayoutEngine;
