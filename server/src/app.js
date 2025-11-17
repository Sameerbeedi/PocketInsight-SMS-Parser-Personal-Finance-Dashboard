const express = require('express');
const cors = require('cors');
const { parseMessages, summarizeTransactions, collectReminders } = require('./parser');
const { SAMPLE_MESSAGES } = require('./sampleMessages');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/sample', (req, res) => {
  const region = req.query.region;
  const { transactions, region: resolvedRegion } = parseMessages(SAMPLE_MESSAGES, { region });
  const insights = summarizeTransactions(transactions);
  const reminders = collectReminders(transactions);
  res.json({ messages: SAMPLE_MESSAGES, transactions, insights, reminders, region: resolvedRegion });
});

app.post('/api/parse', (req, res) => {
  const { messages, region } = req.body || {};
  if (!messages || (Array.isArray(messages) && messages.length === 0)) {
    return res.status(400).json({ error: 'messages field is required' });
  }

  try {
    const { transactions, region: resolvedRegion } = parseMessages(messages, {
      region: region || req.query?.region,
    });
    const insights = summarizeTransactions(transactions);
    const reminders = collectReminders(transactions);
    res.json({ transactions, insights, reminders, region: resolvedRegion });
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse messages', details: error.message });
  }
});

module.exports = app;

