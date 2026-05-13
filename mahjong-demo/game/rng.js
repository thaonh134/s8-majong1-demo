const crypto = require('crypto');

function hashStringToSeed(input) {
  const hash = crypto.createHash('sha256').update(String(input)).digest();
  return hash.readUInt32LE(0);
}

// PRNG deterministic để replay/simulation. Production nên dùng CSPRNG + lưu seed/result audit.
class RngEngine {
  constructor(seed = crypto.randomUUID()) {
    this.seed = String(seed);
    this.state = hashStringToSeed(this.seed) || 0x9e3779b9;
    this.calls = 0;
  }

  nextUInt32() {
    // Mulberry32
    this.calls += 1;
    let t = (this.state += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0);
  }

  nextFloat() {
    return this.nextUInt32() / 4294967296;
  }

  nextInt(maxExclusive) {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new Error('nextInt(maxExclusive) expects positive integer');
    }
    return Math.floor(this.nextFloat() * maxExclusive);
  }

  snapshot() {
    return { seed: this.seed, calls: this.calls, state: this.state >>> 0 };
  }
}

function createSeed(prefix = 'spin') {
  return `${prefix}-${Date.now()}-${crypto.randomUUID()}`;
}

module.exports = { RngEngine, createSeed };
