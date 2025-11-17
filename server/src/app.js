const express = require('express');
const cors = require('cors');
const { parseMessages, summarizeTransactions } = require('./parser');
const { SAMPLE_MESSAGES } = require('./sampleMessages');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/sample', (_req, res) => {
  const transactions = parseMessages(SAMPLE_MESSAGES);
  const insights = summarizeTransactions(transactions);
  res.json({ messages: SAMPLE_MESSAGES, transactions, insights });
});

app.post('/api/parse', (req, res) => {
  const { messages } = req.body || {};
  if (!messages || (Array.isArray(messages) && messages.length === 0)) {
    return res.status(400).json({ error: 'messages field is required' });
  }

  try {
    const transactions = parseMessages(messages);
    const insights = summarizeTransactions(transactions);
    res.json({ transactions, insights });
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse messages', details: error.message });
  }
});

module.exports = app;

