const SYMBOLS = {
  A: { code: 'A', label: '🀇', name: 'Wan 1', weight: 18, pays: { 3: 0.4, 4: 1.0, 5: 2.5 } },
  B: { code: 'B', label: '🀈', name: 'Wan 2', weight: 18, pays: { 3: 0.4, 4: 1.0, 5: 2.5 } },
  C: { code: 'C', label: '🀉', name: 'Wan 3', weight: 16, pays: { 3: 0.6, 4: 1.2, 5: 3.0 } },
  D: { code: 'D', label: '🀊', name: 'Wan 4', weight: 14, pays: { 3: 0.8, 4: 1.6, 5: 4.0 } },
  E: { code: 'E', label: '🀋', name: 'Wan 5', weight: 12, pays: { 3: 1.0, 4: 2.0, 5: 5.0 } },
  F: { code: 'F', label: '🀌', name: 'Wan 6', weight: 10, pays: { 3: 1.2, 4: 2.5, 5: 6.0 } },
  G: { code: 'G', label: '🀍', name: 'Wan 7', weight: 8, pays: { 3: 1.5, 4: 3.0, 5: 8.0 } },
  H: { code: 'H', label: '🀎', name: 'Wan 8', weight: 6, pays: { 3: 2.0, 4: 4.0, 5: 10.0 } },
  WILD: { code: 'WILD', label: '🀄', name: 'Wild', weight: 3, pays: {} },
  SCATTER: { code: 'SCATTER', label: '💰', name: 'Scatter', weight: 2, pays: {} }
};

const PAY_SYMBOL_CODES = Object.keys(SYMBOLS).filter(code => !['WILD', 'SCATTER'].includes(code));

function getSymbol(code) {
  return SYMBOLS[code];
}

module.exports = { SYMBOLS, PAY_SYMBOL_CODES, getSymbol };
