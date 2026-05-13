const { fillEmptyCells, cloneBoard } = require('./boardGenerator');

function uniqueWinCells(wins) {
  const set = new Set();
  for (const win of wins) {
    for (const cell of win.cells) {
      set.add(`${cell.row},${cell.col}`);
    }
  }
  return set;
}

function removeWinningCells(board, wins) {
  const out = cloneBoard(board);
  const cells = uniqueWinCells(wins);

  for (const key of cells) {
    const [row, col] = key.split(',').map(Number);
    out[row][col] = null;
  }

  return out;
}

function cascade(board, wins, rng, mode = 'base') {
  const removedBoard = removeWinningCells(board, wins);
  const nextBoard = fillEmptyCells(removedBoard, rng, mode);
  return { removedBoard, nextBoard };
}

module.exports = { cascade, removeWinningCells, uniqueWinCells };
