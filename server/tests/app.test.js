const request = require('supertest');
const app = require('../src/app');

describe('PocketInsight API', () => {
  it('returns sample data', async () => {
    const res = await request(app).get('/api/sample');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(Array.isArray(res.body.transactions)).toBe(true);
  });

  it('parses posted messages', async () => {
    const res = await request(app)
      .post('/api/parse')
      .send({ messages: 'ICICI: Rs 500 debited at Amazon on 01-11-2025' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.transactions).toHaveLength(1);
    expect(res.body.insights.totals.debit).toBe(500);
  });

  it('validates request payload', async () => {
    const res = await request(app).post('/api/parse').send({});
    expect(res.status).toBe(400);
  });
});

