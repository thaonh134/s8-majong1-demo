class CascadeEngine {
  constructor(boardGenerator) {
    this.boardGenerator = boardGenerator;
  }

  apply(board, winCells) {
    const rows = board.length;
    const cols = board[0].length;
    const removeSet = new Set(winCells.map(c => `${c.row}:${c.col}`));
    const next = Array.from({ length: rows }, () => Array(cols).fill(null));
    const newCells = [];

    for (let c = 0; c < cols; c++) {
      const remaining = [];

      for (let r = rows - 1; r >= 0; r--) {
        if (!removeSet.has(`${r}:${c}`)) {
          remaining.push(board[r][c]);
        }
      }

      let writeRow = rows - 1;
      for (const symbol of remaining) {
        next[writeRow][c] = symbol;
        writeRow--;
      }

      while (writeRow >= 0) {
        next[writeRow][c] = this.boardGenerator.pickSymbolCode();
        newCells.push({ row: writeRow, col: c });
        writeRow--;
      }
    }

    return { board: next, newCells };
  }
}

module.exports = CascadeEngine;
