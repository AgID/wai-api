/* eslint jest/no-hooks: ["error", { "allow": ["beforeAll", "afterAll"] }] */
jest.mock('node-fetch');
jest.mock('../src/config/config', () => ({
  matomo: {
    enabled: {},
  },
}));

const request = require('supertest');
const querystring = require('querystring');
const fetch = require('node-fetch');
const app = require('../src/app').default;
const messages = require('../src/utils/messages');

const { Response, Headers } = jest.requireActual('node-fetch');

describe('test configurations', () => {
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

  it('server configuration check', async () => {
    expect.assertions(2);

    const response = {
      error: messages.default.errors.misconfiguredServer,
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

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual(response);
  });
});
