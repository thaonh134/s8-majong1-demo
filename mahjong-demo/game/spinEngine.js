const Rng = require('./rng');
const BoardGenerator = require('./boardGenerator');
const PayoutEngine = require('./payoutEngine');
const CascadeEngine = require('./cascadeEngine');

class SpinEngine {
  constructor() {
    this.rng = new Rng();
    this.boardGenerator = new BoardGenerator(this.rng);
    this.payoutEngine = new PayoutEngine();
    this.cascadeEngine = new CascadeEngine(this.boardGenerator);
  }

  spin({ playerId = 'demo-player', betAmount = 1000 }) {
    const spinId = `SPIN-${this.rng.uuid()}`;
    let board = this.boardGenerator.generate(4, 5);
    const initialBoard = cloneBoard(board);
    const steps = [];
    let totalWin = 0;
    let multiplier = 1;
    const maxCascade = 20;

    const scatterCount = this.payoutEngine.countScatter(board);
    const freeSpinTriggered = scatterCount >= 3;

    for (let index = 0; index < maxCascade; index++) {
      const evaluation = this.payoutEngine.evaluate(board, betAmount, multiplier);

      steps.push({
        index,
        board: cloneBoard(board),
        wins: evaluation.wins,
        winCells: evaluation.winCells,
        winAmount: roundMoney(evaluation.totalWin),
        multiplier
      });

      if (evaluation.wins.length === 0) break;

      totalWin += evaluation.totalWin;
      const cascaded = this.cascadeEngine.apply(board, evaluation.winCells);
      board = cascaded.board;
      multiplier += 1;

      steps[steps.length - 1].newCellsAfterCascade = cascaded.newCells;
    }

    if (freeSpinTriggered) {
      // Demo rule: scatter >= 3 tặng bonus nhỏ. Bản sau có thể làm free spin thật.
      totalWin += betAmount * 2;
    }

    return {
      spinId,
      playerId,
      betAmount,
      totalWin: roundMoney(totalWin),
      initialBoard,
      finalBoard: cloneBoard(board),
      scatterCount,
      freeSpinTriggered,
      steps
    };
  }
}

function cloneBoard(board) {
  return board.map(row => [...row]);
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

module.exports = new SpinEngine();
