let config = null;
let lastResult = null;
let activeStepIndex = 0;

const boardEl = document.getElementById('board');
const timelineEl = document.getElementById('timeline');
const spinBtn = document.getElementById('spinBtn');
const betInput = document.getElementById('betAmount');

async function init() {
  const res = await fetch('/api/config');
  config = await res.json();
  renderBoard(emptyBoard(), []);
}

function emptyBoard() {
  return Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => null));
}

spinBtn.addEventListener('click', async () => {
  spinBtn.disabled = true;
  spinBtn.textContent = 'SPINNING...';

  try {
    const res = await fetch('/api/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: 'demo-player', betAmount: Number(betInput.value) })
    });

    lastResult = await res.json();
    activeStepIndex = 0;
    renderResult(lastResult);
  } finally {
    spinBtn.disabled = false;
    spinBtn.textContent = 'SPIN';
  }
});

function renderResult(result) {
  document.getElementById('totalWin').textContent = formatMoney(result.totalWin);
  document.getElementById('scatterCount').textContent = result.scatterCount;
  document.getElementById('freeSpin').textContent = result.freeSpinTriggered ? 'Yes' : 'No';
  document.getElementById('stepCount').textContent = result.steps.length;
  document.getElementById('spinId').textContent = result.spinId;
  document.getElementById('jsonResult').textContent = JSON.stringify(result, null, 2);

  renderTimeline(result.steps);
  renderStep(0);
}

function renderTimeline(steps) {
  timelineEl.innerHTML = '';
  steps.forEach(step => {
    const el = document.createElement('button');
    el.className = 'step';
    el.innerHTML = `
      <b>Step ${step.index + 1} — x${step.multiplier}</b>
      <span>Win: ${formatMoney(step.winAmount)} | Combos: ${step.wins.length}</span>
    `;
    el.addEventListener('click', () => renderStep(step.index));
    timelineEl.appendChild(el);
  });
}

function renderStep(index) {
  if (!lastResult) return;
  activeStepIndex = index;
  const step = lastResult.steps[index];
  renderBoard(step.board, step.winCells || []);

  [...timelineEl.children].forEach((child, i) => {
    child.classList.toggle('active', i === index);
  });
}

function renderBoard(board, winCells) {
  const winSet = new Set(winCells.map(c => `${c.row}:${c.col}`));
  boardEl.innerHTML = '';

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const code = board[r][c];
      const symbol = code && config ? config.symbols[code] : null;
      const cell = document.createElement('div');
      cell.className = 'cell' + (winSet.has(`${r}:${c}`) ? ' win' : '');
      cell.innerHTML = `<span>${symbol ? symbol.label : ''}</span><small>${code || ''}</small>`;
      boardEl.appendChild(cell);
    }
  }
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

init();
