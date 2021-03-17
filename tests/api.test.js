/* eslint jest/no-hooks: ["error", { "allow": ["beforeAll", "afterAll"] }] */
jest.mock('node-fetch');
jest.mock('../src/config/config');

const request = require('supertest');
const querystring = require('querystring');
const fetch = require('node-fetch');
const app = require('../src/app').default;
const messages = require('../src/utils/messages');

const { Response, Headers, FetchError } = jest.requireActual('node-fetch');

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

  it('valid headers, invalid permission', async () => {
    expect.assertions(2);

    const response = {
      error: 'Request is forbidden to the provided credential',
    };

    customId.siteId = [];
    customId.siteId.push({
      id: 156,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

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

  it('valid headers, valid permission, admin permissions', async () => {
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

    const customIdTest = { ...customId };

    customIdTest.type = 'admin';

    customIdTest.siteId = [];
    customIdTest.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customIdTest));

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(response);
  });

  it('test post request', async () => {
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
      .post(`/?${queryParsed}`)
      .send({ data: 'fake data' })
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(response);
  });

  it('invalid id list in customId', async () => {
    expect.assertions(2);

    const response = {
      error: messages.default.errors.forbidden,
    };

    const responseInit = {
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    };

    fetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify(response), responseInit)));

    const customIdTest = { ...customId };

    customIdTest.siteId = 'not an array';

    const res = await request(app)
      .get(`/?${queryParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customIdTest));

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual(response);
  });

  it('matomo response error', async () => {
    expect.assertions(2);

    const response = {
      message: 'Matomo Error',
    };

    const responseInit = {
      status: 400,
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

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual(response);
  });

  it('request without siteId', async () => {
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

    const { idSite, ...queryNoSiteId } = { ...query, method: 'API.testRead' };

    const queryNoSiteIdParsed = querystring.encode(queryNoSiteId);

    fetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify(response), responseInit)));

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryNoSiteIdParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(response);
  });

  it('request with malformed siteId', async () => {
    expect.assertions(2);

    const response = {
      error: messages.default.errors.invalidSiteId,
    };

    const responseInit = {
      status: 200,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    };

    const queryTest = { ...query, method: 'API.testRead', idSite: 'not a number' };

    const queryTestParsed = querystring.encode(queryTest);

    fetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify(response), responseInit)));

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryTestParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual(response);
  });

  it('request public API', async () => {
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

    const { idSite, ...queryTest } = { ...query, method: 'API.testPublic', module: 'test' };

    const queryTestParsed = querystring.encode(queryTest);

    fetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify(response), responseInit)));

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryTestParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(response);
  });

  it('malformed method or module', async () => {
    expect.assertions(2);

    const response = {
      error: messages.default.errors.malformedParameters,
    };

    const { idSite, ...queryTest } = { ...query, method: '', module: '' };

    const queryTestParsed = querystring.encode(queryTest);

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryTestParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual(response);
  });

  it('module not allowed by configuration', async () => {
    expect.assertions(2);

    const response = {
      error: messages.default.errors.forbidden,
    };

    const { idSite, ...queryTest } = { ...query, method: 'DoesNotExit', module: 'DoesNotExist' };

    const queryTestParsed = querystring.encode(queryTest);

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryTestParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(403);
    expect(res.body).toStrictEqual(response);
  });

  it('x-consumer-id not a json fail', async () => {
    expect.assertions(2);

    const response = {
      error: messages.default.errors.internalServerError,
    };

    const { idSite, ...queryTest } = { ...query, method: 'DoesNotExit', module: 'DoesNotExist' };

    const queryTestParsed = querystring.encode(queryTest);

    const res = await request(app)
      .get(`/?${queryTestParsed}`)
      .set('x-consumer-custom-id', 'this is not json.');

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual(response);
  });

  it('response not in json format', async () => {
    expect.assertions(2);

    const response = `
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>HTML</title>
        </head>
        <body>
        </body>
      </html>
    `;

    const responseInit = {
      status: 200,
      headers: new Headers({
        'Content-Type': 'text/html',
      }),
    };

    fetch.mockReturnValue(Promise.resolve(new Response(response, responseInit)));

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({ message: 'Response was not in JSON format' });
  });

  it('matomo fetch error', async () => {
    expect.assertions(2);

    fetch.mockRejectedValue(new FetchError('fetch error'));

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(503);
    expect(res.body).toStrictEqual({
      message: 'Error in backend network',
    });
  });

  it('malformed format in query string', async () => {
    expect.assertions(2);

    const response = {
      error: messages.default.errors.malformedParameters,
    };

    const queryTest = { ...query, format: ['JSON', 'JSON'] };
    const queryTestParsed = querystring.encode(queryTest);

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryTestParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual(response);
  });

  it('forbidden format in query string', async () => {
    expect.assertions(2);

    const response = {
      error: messages.default.errors.malformedParameters,
    };

    const queryTest = { ...query, format: 'XML' };
    const queryTestParsed = querystring.encode(queryTest);

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryTestParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual(response);
  });

  it('missing format param in query string is added', async () => {
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

    const { format, ...queryTest } = { ...query };
    const queryTestParsed = querystring.encode(queryTest);

    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: 'RW',
    });

    const res = await request(app)
      .get(`/?${queryTestParsed}`)
      .set('x-consumer-custom-id', JSON.stringify(customId));

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(response);
  });
});
