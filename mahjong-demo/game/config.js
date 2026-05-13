const ROWS = 4;
const COLS = 5;

const SYMBOLS = {
  A: { label: '🀇', name: 'High 1', type: 'normal' },
  B: { label: '🀈', name: 'High 2', type: 'normal' },
  C: { label: '🀉', name: 'High 3', type: 'normal' },
  D: { label: '🀊', name: 'Mid 1', type: 'normal' },
  E: { label: '🀋', name: 'Mid 2', type: 'normal' },
  F: { label: '🀌', name: 'Low 1', type: 'normal' },
  G: { label: '🀍', name: 'Low 2', type: 'normal' },
  W: { label: '🀄', name: 'Wild', type: 'wild' },
  S: { label: '🀅', name: 'Scatter', type: 'scatter' }
};

// Paytable dạng multiplier theo tổng bet. Demo dùng ways count để nhân thêm.
const PAYTABLE = {
  A: { 3: 0.08, 4: 0.20, 5: 0.50 },
  B: { 3: 0.07, 4: 0.18, 5: 0.40 },
  C: { 3: 0.06, 4: 0.15, 5: 0.30 },
  D: { 3: 0.04, 4: 0.10, 5: 0.20 },
  E: { 3: 0.03, 4: 0.08, 5: 0.15 },
  F: { 3: 0.02, 4: 0.05, 5: 0.10 },
  G: { 3: 0.02, 4: 0.04, 5: 0.08 }
};

// Trọng số theo từng cột để dễ cân RTP/volatility hơn random đồng đều.
const BASE_REEL_WEIGHTS = [
  { A: 7, B: 8, C: 9, D: 16, E: 17, F: 20, G: 22, W: 1, S: 2 },
  { A: 7, B: 8, C: 10, D: 16, E: 17, F: 20, G: 21, W: 1, S: 2 },
  { A: 7, B: 9, C: 10, D: 16, E: 17, F: 20, G: 20, W: 1, S: 2 },
  { A: 7, B: 9, C: 11, D: 16, E: 17, F: 20, G: 19, W: 1, S: 2 },
  { A: 7, B: 9, C: 11, D: 16, E: 17, F: 20, G: 18, W: 1, S: 2 }
];

const FREE_SPIN_REEL_WEIGHTS = [
  { A: 8, B: 9, C: 10, D: 15, E: 16, F: 19, G: 20, W: 2, S: 1 },
  { A: 8, B: 9, C: 10, D: 15, E: 16, F: 19, G: 20, W: 2, S: 1 },
  { A: 8, B: 9, C: 10, D: 15, E: 16, F: 19, G: 20, W: 2, S: 1 },
  { A: 8, B: 9, C: 10, D: 15, E: 16, F: 19, G: 20, W: 2, S: 1 },
  { A: 8, B: 9, C: 10, D: 15, E: 16, F: 19, G: 20, W: 2, S: 1 }
];

const BASE_MULTIPLIERS = [1, 2, 3, 5];
const FREE_SPIN_MULTIPLIERS = [2, 4, 6, 10];

const FREE_SPIN_RULES = {
  triggerScatterCount: 3,
  awardSpins: 8,
  buyFeatureCostMultiplier: 100,
  retriggerSpins: 3,
  maxSpins: 30
};

const ENGINE_LIMITS = {
  maxCascadeSteps: 20,
  maxWinMultiplier: 5000
};

module.exports = {
  ROWS,
  COLS,
  SYMBOLS,
  PAYTABLE,
  BASE_REEL_WEIGHTS,
  FREE_SPIN_REEL_WEIGHTS,
  BASE_MULTIPLIERS,
  FREE_SPIN_MULTIPLIERS,
  FREE_SPIN_RULES,
  ENGINE_LIMITS
};
