/* eslint jest/no-hooks: ["error", { "allow": ["beforeEach", "afterAll"] }] */
jest.mock('node-fetch');

const request = require('supertest');
const app = require('../src/app').default;

describe('test app routes', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  // avoid jest open handle error
  afterAll(async () => {
    process.env = OLD_ENV;
    await new Promise(resolve => setTimeout(() => resolve(), 500));
  });

  it('test route not found', async () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'test';

    const res = await request(app).get('/login/');

    expect(res.status).toBe(404);
  });

  it('modules route not accessible', async () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'test';

    const res = await request(app).get('/modules/');

    expect(res.status).toBe(404);
  });

  it('modules route pass', async () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'dev';

    const res = await request(app).get('/modules/');

    expect(res.status).toBe(200);
  });
});
