const express = require('express');
const path = require('path');
const { spin } = require('./game/spinEngine');
const { simulate } = require('./game/simulator');
const wallet = require('./game/wallet');
const { readLatest } = require('./game/auditLog');
const config = require('./game/config');
const sessionStats = require('./game/sessionStats');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/config', (req, res) => {
  res.json(config);
});

app.get('/api/wallet/:playerId', (req, res) => {
  res.json({ playerId: req.params.playerId, balance: wallet.getBalance(req.params.playerId) });
});

app.post('/api/wallet/reset', (req, res) => {
  const playerId = req.body.playerId || 'demo-player';
  const balance = wallet.reset(playerId, Number(req.body.balance || 1000000));
  const session = sessionStats.reset(playerId);
  res.json({ playerId, balance, session });
});

app.get('/api/stats/:playerId', (req, res) => {
  res.json({ playerId: req.params.playerId, ...sessionStats.get(req.params.playerId) });
});

app.post('/api/spin', (req, res) => {
  try {
    const result = spin({
      playerId: req.body.playerId || 'demo-player',
      betAmount: req.body.betAmount || 1000,
      seed: req.body.seed || undefined,
      useWallet: req.body.useWallet !== false,
      buyFeature: req.body.buyFeature === true
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/buy-feature', (req, res) => {
  try {
    const result = spin({
      playerId: req.body.playerId || 'demo-player',
      betAmount: req.body.betAmount || 1000,
      seed: req.body.seed || undefined,
      useWallet: req.body.useWallet !== false,
      buyFeature: true
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/simulate', (req, res) => {
  try {
    const result = simulate({
      rounds: req.body.rounds || 10000,
      betAmount: req.body.betAmount || 1000,
      seedPrefix: req.body.seedPrefix || 'sim'
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/audit/latest', (req, res) => {
  res.json(readLatest(Number(req.query.limit || 20)));
});

app.listen(PORT, () => {
  console.log(`Mahjong demo v3 running at http://localhost:${PORT}`);
});
