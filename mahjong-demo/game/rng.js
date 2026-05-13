const crypto = require('crypto');

class Rng {
  nextInt(maxExclusive) {
    if (maxExclusive <= 0) throw new Error('maxExclusive must be positive');
    return crypto.randomInt(0, maxExclusive);
  }

  uuid() {
    return crypto.randomUUID();
  }
}

module.exports = Rng;
