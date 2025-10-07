const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = __dirname + '/data.json';
const PORT = process.env.PORT || 4000;
const SERVER_BASE = process.env.SERVER_BASE || `http://localhost:${PORT}`;

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { admins: [], events: [], sessions: {} };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Factory to create the express app (so it can be imported without side effects)
function createServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  let DATA = loadData();

  function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Malformed Authorization header' });
    const token = parts[1];
    const session = DATA.sessions[token];
    if (!session) return res.status(401).json({ error: 'Invalid or expired token' });
    req.admin = session;
    next();
  }

  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    const admin = DATA.admins.find(a => a.email === email && a.password === password);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const token = uuidv4();
    DATA.sessions[token] = { id: admin.id, email: admin.email, createdAt: Date.now() };
    saveData(DATA);
    res.json({ token, admin: { id: admin.id, email: admin.email } });
  });

  app.get('/api/admin/events', requireAuth, (req, res) => {
    res.json({ events: DATA.events });
  });

  app.post('/api/event', (req, res) => {
    const { type, payload } = req.body;
    if (!type || !payload) return res.status(400).json({ error: 'Missing type or payload' });
    const id = uuidv4();
    const ev = { id, type, payload, createdAt: new Date().toISOString() };
    DATA.events.push(ev);
    saveData(DATA);
    res.json({ ok: true, event: ev });
  });

  app.post('/api/create-payment', (req, res) => {
    const { amount, email } = req.body;
    if (!amount || !email) return res.status(400).json({ error: 'Missing amount or email' });
    const txnId = uuidv4();
    const paymentUrl = `${SERVER_BASE}/pay/${txnId}`;
    DATA.events.push({ id: uuidv4(), type: 'purchase_pending', payload: { txnId, amount, email }, createdAt: new Date().toISOString() });
    saveData(DATA);
    res.json({ paymentUrl, txnId });
  });

  app.get('/pay/:txnid', (req, res) => {
    const txnId = req.params.txnid;
    const html = `<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\" />\n  <title>Simulated PayU Gateway</title>\n</head>\n<body style=\"font-family: Arial, sans-serif; display:flex; align-it[...]`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  app.get('/pay-success', (req, res) => {
    const txn = req.query.txnid || '';
    res.send(`<!doctype html><html><body><h2>Payment Success</h2><p>Transaction ${txn} completed.</p></body></html>`);
  });

  app.get('/health', (req, res) => res.json({ ok: true }));

  return app;
}

// Provide both a named CommonJS export and an __esModule flag so bundlers
// doing ES import analysis (like Rollup) can detect `createServer` as a named export.
exports.createServer = createServer;
Object.defineProperty(exports, "__esModule", { value: true });

// If this file is run directly, start listening (preserve current behavior)
if (require.main === module) {
  const app = createServer();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}