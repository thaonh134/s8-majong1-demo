const wallets = new Map();

function getBalance(playerId) {
  if (!wallets.has(playerId)) wallets.set(playerId, 1_000_000);
  return wallets.get(playerId);
}

function debit(playerId, amount) {
  const balance = getBalance(playerId);
  if (amount <= 0) throw new Error('Bet amount must be positive');
  if (balance < amount) throw new Error('Insufficient balance');
  wallets.set(playerId, balance - amount);
  return wallets.get(playerId);
}

function credit(playerId, amount) {
  const balance = getBalance(playerId);
  wallets.set(playerId, balance + Math.max(0, Math.floor(amount)));
  return wallets.get(playerId);
}

function reset(playerId, balance = 1_000_000) {
  wallets.set(playerId, balance);
  return balance;
}

module.exports = { getBalance, debit, credit, reset };
