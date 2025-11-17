const request = require('supertest');
const app = require('../src/app');

describe('PocketInsight API', () => {
  it('returns sample data', async () => {
    const res = await request(app).get('/api/sample');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(Array.isArray(res.body.transactions)).toBe(true);
    expect(res.body.region).toBe('IN');
    expect(Array.isArray(res.body.reminders)).toBe(true);
  });

  it('parses posted messages', async () => {
    const res = await request(app)
      .post('/api/parse')
      .send({ messages: 'ICICI: Rs 500 debited at Amazon on 01-11-2025' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.transactions).toHaveLength(1);
    expect(res.body.insights.totals.debit).toBe(500);
    expect(res.body.region).toBe('IN');
    expect(res.body.reminders).toBeDefined();
  });

  it('parses with regional override', async () => {
    const res = await request(app)
      .post('/api/parse')
      .send({ messages: 'DBS: SGD 120 spent at GrabFood on 05-11-2025', region: 'SG' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.region).toBe('SG');
    expect(res.body.transactions[0].category).toBe('Dining');
  });

  it('surfaces reminders for due messages', async () => {
    const res = await request(app)
      .post('/api/parse')
      .send({
        messages: 'HDFC Card: Credit card payment due Rs 12,500 due on 28-10-2025.',
      })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.reminders).toHaveLength(1);
    expect(res.body.reminders[0].type).toBe('credit_card_due');
  });

  it('validates request payload', async () => {
    const res = await request(app).post('/api/parse').send({});
    expect(res.status).toBe(400);
  });
});

