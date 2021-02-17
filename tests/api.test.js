const request = require("supertest");
const { app } = require("../src/index");
const querystring = require("querystring");

describe("API Tests", function () {
  let query;
  let customId;
  let queryParsed;

  beforeAll(async () => {
    process.env.NODE_ENV = "TEST";

    query = {
      module: "test",
      method: "api.test",
      idSite: "1",
      format: "JSON",
      token_auth: "anonymous",
    };

    customId = {
      type: "analytics",
      siteId: [],
    };

    queryParsed = querystring.encode(query);
  });

  it("test index", async () => {
    const res = await request(app).get("/");
    const response = { error: "Failed to find credential" };
    expect(res.status).toBe(403);
    expect(res.body).toEqual(response);
  });

  it("valid queryString, no headers", async () => {
    const res = await request(app).get("/?" + queryParsed);
    const response = { error: "Failed to find credential" };
    expect(res.status).toBe(403);
    expect(res.body).toEqual(response);
  });

  it("valid headers, method not valid", async () => {
    customId.siteId.push({
      id: 1,
      permission: "R",
    });

    const testQuery = {
      ...query,
      method: "method.doesnotexist",
    };

    const res = await request(app)
      .get("/?" + querystring.encode(testQuery))
      .set("x-consumer-custom-id", JSON.stringify(customId));
    const response = { error: "Method not allowed" };
    expect(res.status).toBe(403);
    expect(res.body).toEqual(response);
  });

  it("valid headers no write permission", async () => {
    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: "R",
    });

    const res = await request(app)
      .get("/?" + queryParsed)
      .set("x-consumer-custom-id", JSON.stringify(customId));
    const response = {
      error: "Not allowed to access the method '" + query.method + "' with the current permission settings",
    };
    expect(res.status).toBe(403);
    expect(res.body).toEqual(response);
  });

  it("valid headers, valid permission", async () => {
    customId.siteId = [];
    customId.siteId.push({
      id: 1,
      permission: "RW",
    });

    const res = await request(app)
      .get("/?" + queryParsed)
      .set("x-consumer-custom-id", JSON.stringify(customId));

    expect(res.status).not.toBe(403);
    expect(res.body).toBeDefined();
  });
});
