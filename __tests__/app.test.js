const endpointsJson = require("../endpoints.json");
const app = require("../app");
const request = require("supertest");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const { toBeSortedBy } = require("jest-sorted");
const { getArticlesWithoutComments } = require("../db/queries/test.queries");

beforeAll(() => {
  return seed(data).then(() => {
    console.log("Seeding complete");
  });
});

afterAll(() => {
  return db.end().then(() => {
    console.log("Database connection closed");
  });
});

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
      .get("/api/not_a_route")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Endpoint not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("Status: 200, Responds with an articles array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBeGreaterThan(0);
      });
  });

  test("Status: 200, Responds with each article having correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              author: expect.any(String),
              title: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
          expect(article).not.toHaveProperty("body");
        });
      });
  });

  test("Status: 200, Responds with articles sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("Status: 200, Responds with one article object based on article_id", () => {
    return request(app)
      .get("/api/articles/4")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 4,
            author: expect.any(String),
            title: expect.any(String),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test("Status: 404, returns 404 - Not Found error", () => {
    return request(app)
      .get(`/api/articles/999`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });

  test("Status: 400, Responds with a 400 - Bad Request", () => {
    return request(app)
      .get("/api/articles/not_a_route")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("Status: 200, Responds with one article object based on article_id", () => {
    return request(app)
      .get("/api/articles/4")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 4,
            author: expect.any(String),
            title: expect.any(String),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test("Status: 404, returns 404 - Not Found error", () => {
    const invalidId = 999;
    return request(app)
      .get(`/api/articles/${invalidId}`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("Status: 400, Responds with a 400 - Bad Request", () => {
    return request(app)
      .get("/api/articles/lol")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("Status: 200, responds with array of comment objects", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 3,
            })
          );
        });
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("Status: 200, Responds with an empty array if article exists but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("Status: 201, Responds with a posted comment", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "lurker",
        body: "Code is fun... until it isn’t. Then it's just debugging.",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          article_id: 3,
          author: "lurker",
          body: "Code is fun... until it isn’t. Then it's just debugging.",
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });

  test("Status: 201, Ignores extra fields in the request body", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "lurker",
        body: "Code is fun... until it isn’t. Then it's just debugging.",
        extra_field: "should be ignored",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          article_id: 3,
          author: "lurker",
          body: "Code is fun... until it isn’t. Then it's just debugging.",
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
        expect(body.comment).not.toHaveProperty("extra_field");
      });
  });
  test("Status: 201, Responds with a posted comment on articles that have 0 comments", () => {
    return getArticlesWithoutComments().then((article) => {
      const articleWithNoComments = article[0];

      return request(app)
        .post(`/api/articles/${articleWithNoComments.article_id}/comments`)
        .send({
          username: "lurker",
          body: "Code is fun... until it isn’t. Then it's just debugging.",
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toMatchObject({
            comment_id: expect.any(Number),
            article_id: articleWithNoComments.article_id,
            author: "lurker",
            body: "Code is fun... until it isn’t. Then it's just debugging.",
            votes: expect.any(Number),
            created_at: expect.any(String),
          });
        });
    });
  });
  test("Status: 404, Responds with 404 - Not Found error if user doesn't exist", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({
        username: "test_user",
        body: "Code is fun... until it isn’t. Then it's just debugging.",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });
  test("Status: 404, Responds with 404 - Not Found error if article doesn't exist (Foreign Key Error)", () => {
    return request(app)
      .post("/api/articles/999/comments")
      .send({
        username: "lurker",
        body: "Code is fun... until it isn’t. Then it's just debugging.",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("Status: 400, Responds with 400 - Bad request if comment body is empty or only spaces", () => {
    const invalidBodies = ["", "  "];
    invalidBodies.forEach((invalidBody) => {
      return request(app)
        .post("/api/articles/3/comments")
        .send({
          username: "lurker",
          body: invalidBody,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Comment body cannot be empty.");
        });
    });
  });
});
