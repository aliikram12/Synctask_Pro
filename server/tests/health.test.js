const request = require('supertest');
const app = require('../app');

describe('Health endpoint', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toMatch(/running/i);
  });
});
