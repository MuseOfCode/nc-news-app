const endpointsJson = require("../endpoints.json");
const app = require("../app");
const request = require("supertest");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");

beforeAll(() => seed(data));
afterAll(() => db.end());

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("Status: 200, Responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const expectedLength = body.topics.length;
        expect(body.topics.length).toBe(expectedLength);
        body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              description: expect.any(String),
              slug: expect.any(String),
            })
          );
        });
      });
  });
  test("Status: 404, Responds with a 404 - Not Found error if the endpoint is incorrect", () => {
    return request(app)
      .get("/api/topic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Endpoint not found");
      });
  });
});

describe.skip("GET /api/articles/:articles_id", () => {
  let minId;
  let maxId;

  beforeEach(() => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articleIds = body.articles.map((article) => article.article.id);
        minId = Math.min(articleIds);
        maxId = Math.max(articleIds);
      });
  });

  test("Status:200, Responds with one article object that has the max article_id", () => {
    return request(app)
      .get(`/api/articles/${maxId}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.length).toBe(1);
        expect(body.article.article_id(maxId));
      });
  });

  test("Status:200, Responds with one article object that has the min article_id", () => {
    return request(app)
      .get(`/api/articles/${minId}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.length).toBe(1);
        expect(body.article.article_id(minId));
      });
  });

  test("Status: 200, Responds with one article object based on article_id", () => {
    console.log(articles.length);
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.length).toBeEqualTo(1);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: 2,
              author: expect.any(String),
              title: expect.any(String),
              body: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(Number),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
            })
          );
        });
      });
  });
});
