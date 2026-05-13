const express = require('express');
const cors = require('cors');
const path = require('path');
const spinEngine = require('./game/spinEngine');
const { SYMBOLS } = require('./game/symbols');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/config', (req, res) => {
  res.json({ symbols: SYMBOLS, rows: 4, cols: 5 });
});

app.post('/api/spin', (req, res) => {
  const betAmount = Number(req.body.betAmount || 1000);
  if (!Number.isFinite(betAmount) || betAmount <= 0) {
    return res.status(400).json({ error: 'betAmount không hợp lệ' });
  }

  const result = spinEngine.spin({
    playerId: req.body.playerId || 'demo-player',
    betAmount
  });

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Mahjong demo running at http://localhost:${PORT}`);
});
