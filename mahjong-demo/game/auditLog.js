const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit-log.jsonl');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function appendAudit(record) {
  ensureDir();
  fs.appendFileSync(AUDIT_FILE, JSON.stringify(record) + '\n');
}

function readLatest(limit = 20) {
  ensureDir();
  if (!fs.existsSync(AUDIT_FILE)) return [];
  const lines = fs.readFileSync(AUDIT_FILE, 'utf8').trim().split('\n').filter(Boolean);
  return lines.slice(-limit).map(line => JSON.parse(line)).reverse();
}

module.exports = { appendAudit, readLatest, AUDIT_FILE };
