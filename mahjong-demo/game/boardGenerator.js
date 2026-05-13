const { SYMBOLS } = require('./symbols');

class BoardGenerator {
  constructor(rng) {
    this.rng = rng;
    this.weighted = Object.values(SYMBOLS);
    this.totalWeight = this.weighted.reduce((sum, s) => sum + s.weight, 0);
  }

  generate(rows = 4, cols = 5) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => this.pickSymbolCode())
    );
  }

  pickSymbolCode() {
    let roll = this.rng.nextInt(this.totalWeight);
    for (const symbol of this.weighted) {
      roll -= symbol.weight;
      if (roll < 0) return symbol.code;
    }
    return this.weighted[this.weighted.length - 1].code;
  }
}

module.exports = BoardGenerator;
