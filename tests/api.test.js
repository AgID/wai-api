/* eslint jest/no-hooks: ["error", { "allow": ["beforeAll", "afterAll"] }] */
jest.mock('node-fetch');

const request = require('supertest');
const querystring = require('querystring');
const fetch = require('node-fetch');
const app = require('../src/app').default;
const messages = require('../src/utils/messages');

const { Response, Headers } = jest.requireActual('node-fetch');

describe('api tests', () => {
  let query;
  let customId;
  let queryParsed;

  beforeAll(async () => {
    process.env.NODE_ENV = 'TEST';

    query = {
      module: 'test',
      method: 'api.test',
      idSite: '1',
      format: 'JSON',
      token_auth: 'anonymous',
    };

    customId = {
      type: 'analytics',
      siteId: [],
    };

    queryParsed = querystring.encode(query);
  });

  // avoid jest open handle error
  afterAll(async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 500));
  });

  it('test index', async () => {
    expect.assertions(2);

    const res = await request(app).get('/');
    const response = { error: messages.default.errors.malformedParameters };

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual(response);
  });

  it('valid queryString, no headers', async () => {
    expect.assertions(2);

    const res = await request(app).get(`/?${queryParsed}`);
    const response = { error: messages.default.errors.internalServerError };

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual(response);
  });

  it('valid headers, method not valid', async () => {
    expect.assertions(2);

    customId.siteId.push({
      id: 1,
      permission: 'R',
    });

    const testQuery = {
      ...query,
      method: 'method.doesnotexist',
    };

    const res = await request(app)
      .get(`/?${querystring.encode(testQuery)}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));
    const response = { error: messages.default.errors.forbidden };

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual(response);
  });

  it('valid headers no write permission', async () => {
    expect.assertions(2);

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'R',
    });

    const res = await request(app)
      .get(`/?${queryParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));
    const response = { error: messages.default.errors.forbidden };

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual(response);
  });

  it('valid headers, valid permission', async () => {
    expect.assertions(2);

    const response = {
      requestedKey: 'requestedValue',
    };

    const responseInit = {
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    };

    fetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify(response), responseInit)));

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(response);
  });
});
