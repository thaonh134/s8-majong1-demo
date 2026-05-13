const symbolMap = {
  A: '🀇', B: '🀈', C: '🀉', D: '🀊', E: '🀋', F: '🀌', G: '🀍', W: '🀄', S: '🀅'
};

const $ = id => document.getElementById(id);
let currentResult = null;
let currentFrames = [];
let frameIndex = 0;

function fmt(n) { return Number(n || 0).toLocaleString('vi-VN'); }
function pct(n) { return `${(Number(n || 0) * 100).toFixed(2)}%`; }

function uniqueWinKeys(wins = []) {
  const set = new Set();
  for (const win of wins) for (const cell of win.cells || []) set.add(`${cell.row},${cell.col}`);
  return set;
}

function renderBoard(board, highlightKeys = new Set()) {
  const target = $('board');
  target.innerHTML = '';
  if (!board || !board.length) {
    target.innerHTML = '<div class="emptyBoard">Không có board base vì đây là Buy Feature.</div>';
    return;
  }
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      const div = document.createElement('div');
      div.className = `tile tile-${cell || 'empty'} ${highlightKeys.has(`${r},${c}`) ? 'winCell' : ''}`;
      if (cell) {
        const icon = symbolMap[cell] || cell;
        div.innerHTML = `
          <span class="tileCode">${cell}</span>
          <span class="tileIcon">${icon}</span>
        `;
      } else {
        div.textContent = '';
      }
      target.appendChild(div);
    });
  });
}

function collectFrames(result) {
  const frames = [];
  if (result.base?.initialBoard?.length) {
    frames.push({ title: 'Base initial board', board: result.base.initialBoard, wins: [], info: 'Board ban đầu trước khi check win.' });
  }
  for (const step of collectSteps(result)) {
    frames.push({
      title: `${step.mode === 'freeSpin' ? `Free Spin #${step.spinIndex}` : 'Base Spin'} - Cascade #${step.cascadeIndex + 1}`,
      board: step.boardBefore,
      wins: step.wins,
      info: `Win ${fmt(step.stepWin)} | Multiplier x${step.multiplier} | ${step.wins.map(w => `${w.symbol}:${w.matchCount} cols/${w.ways} ways`).join(', ')}`
    });
    frames.push({
      title: `Sau cascade #${step.cascadeIndex + 1}`,
      board: step.boardAfter,
      wins: [],
      info: 'Board sau khi xoá ô thắng, rơi symbol và fill symbol mới.'
    });
  }
  if (!frames.length && result.freeSpins?.[0]?.initialBoard?.length) {
    frames.push({ title: 'Free Spin initial board', board: result.freeSpins[0].initialBoard, wins: [], info: 'Buy Feature bắt đầu từ free spin.' });
  }
  return frames;
}

function collectSteps(result) {
  const steps = [...(result.base?.steps || [])];
  for (const fs of result.freeSpins || []) steps.push(...(fs.steps || []));
  return steps;
}

function renderFrame() {
  const frame = currentFrames[frameIndex];
  if (!frame) {
    renderBoard(null);
    $('boardCaption').textContent = 'Chưa có dữ liệu board.';
    $('stepCounter').textContent = '0 / 0';
    $('winInfo').textContent = 'Ô thắng sẽ được tô sáng sau khi có cascade.';
    return;
  }
  renderBoard(frame.board, uniqueWinKeys(frame.wins));
  $('boardCaption').textContent = frame.title;
  $('stepCounter').textContent = `${frameIndex + 1} / ${currentFrames.length}`;
  $('winInfo').textContent = frame.info;
}

function renderStats(result) {
  $('balance').textContent = fmt(result.balanceAfter);
  $('costAmount').textContent = fmt(result.costAmount);
  $('costNote').textContent = result.buyFeature ? `Buy = ${result.buyFeatureCostMultiplier}x bet` : 'Cược thường';
  $('totalWin').textContent = fmt(result.totalWin);
  $('winMulti').textContent = `${result.summary.winMultiplier}x bet`;
  $('profit').textContent = fmt(result.profit);
  $('profit').className = result.profit >= 0 ? 'positive' : 'negative';

  const s = result.session || {};
  $('sessionRtp').textContent = pct(s.rtp);
  $('sessionVolume').textContent = `${fmt(s.spins)} spins | Bet ${fmt(s.totalBet)} | Win ${fmt(s.totalWin)}`;
  $('hitBonus').textContent = `${pct(s.hitRate)} / ${pct(s.bonusRate)}`;
  $('buyCount').textContent = `Buy: ${fmt(s.buyFeatures)}`;
}

function renderSummary(result) {
  $('summary').innerHTML = `
    <div><span>Spin ID</span><b>${result.spinId}</b></div>
    <div><span>Mode</span><b>${result.buyFeature ? 'Buy Feature' : 'Normal Spin'}</b></div>
    <div><span>Seed</span><b>${result.seed}</b></div>
    <div><span>Base Scatter</span><b>${result.base.scatterCount}</b></div>
    <div><span>Free Spin</span><b>${result.freeSpinTriggered ? 'Có' : 'Không'} (${result.summary.freeSpinCount})</b></div>
    <div><span>Cascades</span><b>${result.summary.cascades}</b></div>
    <div><span>Hit</span><b>${result.summary.hit ? 'Có thắng' : 'Không thắng'}</b></div>
    <div><span>Win Cap</span><b>${result.wasCapped ? 'Đã cap' : 'Không cap'}</b></div>
  `;
}

function renderResult(result) {
  currentResult = result;
  currentFrames = collectFrames(result);
  frameIndex = 0;
  renderStats(result);
  renderSummary(result);
  renderFrame();
  $('debugJson').textContent = JSON.stringify(result, null, 2);
}

async function postJson(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

async function getJson(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

function requestBody(extra = {}) {
  return {
    playerId: $('playerId').value || 'demo-player',
    betAmount: Number($('betAmount').value || 1000),
    seed: $('seed').value.trim() || undefined,
    ...extra
  };
}

async function refreshWalletAndStats() {
  const playerId = $('playerId').value || 'demo-player';
  const wallet = await getJson(`/api/wallet/${encodeURIComponent(playerId)}`);
  const stats = await getJson(`/api/stats/${encodeURIComponent(playerId)}`);
  $('balance').textContent = fmt(wallet.balance);
  $('sessionRtp').textContent = pct(stats.rtp);
  $('sessionVolume').textContent = `${fmt(stats.spins)} spins | Bet ${fmt(stats.totalBet)} | Win ${fmt(stats.totalWin)}`;
  $('hitBonus').textContent = `${pct(stats.hitRate)} / ${pct(stats.bonusRate)}`;
  $('buyCount').textContent = `Buy: ${fmt(stats.buyFeatures)}`;
}

async function doSpin(buyFeature = false) {
  const btn = buyFeature ? $('buyFeatureBtn') : $('spinBtn');
  btn.disabled = true;
  try {
    const result = await postJson(buyFeature ? '/api/buy-feature' : '/api/spin', requestBody({ buyFeature }));
    renderResult(result);
    await loadLog();
  } catch (err) { alert(err.message); }
  finally { btn.disabled = false; }
}

async function loadLog() {
  const log = await getJson('/api/audit/latest?limit=10');
  $('logOutput').textContent = JSON.stringify(log.map(x => ({
    createdAt: x.createdAt,
    type: x.type,
    spinId: x.result?.spinId,
    cost: x.result?.costAmount,
    win: x.result?.totalWin,
    profit: x.result?.profit,
    freeSpins: x.result?.summary?.freeSpinCount,
    rtp: x.result?.session?.rtp
  })), null, 2);
}

async function loadConfig() {
  const cfg = await getJson('/api/config');
  $('configOutput').textContent = JSON.stringify(cfg, null, 2);
}

$('spinBtn').addEventListener('click', () => doSpin(false));
$('buyFeatureBtn').addEventListener('click', () => doSpin(true));
$('resetBtn').addEventListener('click', async () => {
  await postJson('/api/wallet/reset', { playerId: $('playerId').value || 'demo-player', balance: 1000000 });
  currentResult = null; currentFrames = []; frameIndex = 0;
  renderFrame();
  $('totalWin').textContent = '0'; $('costAmount').textContent = '0'; $('profit').textContent = '0'; $('winMulti').textContent = '0x bet';
  $('summary').textContent = 'Chưa có spin.'; $('debugJson').textContent = 'Chưa có API response.';
  await refreshWalletAndStats(); await loadLog();
});
$('prevStep').addEventListener('click', () => { if (currentFrames.length) { frameIndex = Math.max(0, frameIndex - 1); renderFrame(); } });
$('nextStep').addEventListener('click', () => { if (currentFrames.length) { frameIndex = Math.min(currentFrames.length - 1, frameIndex + 1); renderFrame(); } });
$('loadLogBtn').addEventListener('click', loadLog);
$('loadConfigBtn').addEventListener('click', loadConfig);
$('simulateBtn').addEventListener('click', async () => {
  $('simulateBtn').disabled = true;
  $('simulationResult').textContent = 'Đang chạy...';
  try {
    const result = await postJson('/api/simulate', {
      rounds: Number($('rounds').value || 10000),
      betAmount: Number($('betAmount').value || 1000),
      seedPrefix: `ui-${Date.now()}`
    });
    $('simulationResult').textContent = JSON.stringify(result, null, 2);
  } catch (err) { $('simulationResult').textContent = err.message; }
  finally { $('simulateBtn').disabled = false; }
});

document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tabContent').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  $(btn.dataset.tab).classList.add('active');
}));

refreshWalletAndStats();
loadConfig();
loadLog().catch(() => {});
