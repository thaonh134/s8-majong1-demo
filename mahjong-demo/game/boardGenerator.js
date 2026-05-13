const { ROWS, COLS, BASE_REEL_WEIGHTS, FREE_SPIN_REEL_WEIGHTS } = require('./config');

function cloneBoard(board) {
  return board.map(row => [...row]);
}

function pickWeighted(rng, weightMap) {
  const entries = Object.entries(weightMap).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng.nextInt(total);

  for (const [symbol, weight] of entries) {
    if (roll < weight) return symbol;
    roll -= weight;
  }
  return entries[entries.length - 1][0];
}

function generateBoard(rng, mode = 'base') {
  const weights = mode === 'freeSpin' ? FREE_SPIN_REEL_WEIGHTS : BASE_REEL_WEIGHTS;
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(pickWeighted(rng, weights[c]));
    }
    board.push(row);
  }
  return board;
}

function countSymbol(board, symbol) {
  return board.flat().filter(s => s === symbol).length;
}

function fillEmptyCells(board, rng, mode = 'base') {
  const weights = mode === 'freeSpin' ? FREE_SPIN_REEL_WEIGHTS : BASE_REEL_WEIGHTS;
  const out = cloneBoard(board);

  for (let c = 0; c < COLS; c++) {
    const kept = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (out[r][c] !== null) kept.push(out[r][c]);
    }

    for (let r = ROWS - 1; r >= 0; r--) {
      out[r][c] = kept.length ? kept.shift() : pickWeighted(rng, weights[c]);
    }
  }

  return out;
}

module.exports = { generateBoard, fillEmptyCells, cloneBoard, countSymbol };
