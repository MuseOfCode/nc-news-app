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

describe("PATCH /api/articles/:article_id", () => {
  test.each([
    ["increments article votes", { inc_votes: 1 }, 3],
    ["decrements article votes", { inc_votes: -1 }, 2],
  ])("Status 200, Successfully %s", (_, requestBody, expectedResult) => {
    return request(app)
      .patch("/api/articles/2")
      .send(requestBody)
      .expect(200)
      .then(({ body }) => {
        expect(body.article[0].votes).toBe(expectedResult);
      });
  });
  test("Status: 200, Updates the correct article based on article_id", () => {
    return request(app)
      .patch("/api/articles/5")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article[0].article_id).toBe(5);
        expect(body.article[0].votes).toBe(1);
      });
  });
  test("Status: 200, Responds with updated article with correct properties", () => {
    return request(app)
      .patch("/api/articles/3")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article[0]).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          author: expect.any(String),
          topic: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test.each([
    { article_id: 1, inc_votes: -100, expectedVotes: 0 },
    { article_id: 7, inc_votes: 100, expectedVotes: 100 },
  ])(
    "Status: 200, Handles large vote changes (inc_votes: $inc_votes)",
    ({ article_id, inc_votes, expectedVotes }) => {
      return request(app)
        .patch(`/api/articles/${article_id}`)
        .send({ inc_votes })
        .expect(200)
        .then(({ body }) => {
          expect(body.article[0].votes).toBe(expectedVotes);
        });
    }
  );
  test("Status: 400, Responds with error 'Votes cannot go below 0' when the vote count goes below 0", () => {
    return request(app)
      .patch("/api/articles/8")
      .send({ inc_votes: -10 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Votes cannot go below 0");
      });
  });
  test.each([
    ["inc_votes is missing from request body", {}, "inc_votes is required"],
    ["inc_votes is null", { inc_votes: null }, "inc_votes must be a number"],
    [
      "inc_votes is not a number",
      { inc_votes: "string" },
      "inc_votes must be a number",
    ],
  ])(
    "Status: 400, Responds with appropriate error message when %s",
    (_, requestBody, expectedMsg) => {
      return request(app)
        .patch("/api/articles/1")
        .send(requestBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(expectedMsg);
        });
    }
  );
  test.each([
    {
      inc_votes: 101,
      expectedMsg: "inc_votes exceeds the maximum allowed value of 100",
    },
    {
      inc_votes: -101,
      expectedMsg: "inc_votes exceeds the maximum allowed value of 100",
    },
  ])(
    "Status: 400, Responds with an error message when inc_votes is out of range (inc_votes: $inc_votes)",
    ({ inc_votes, expectedMsg }) => {
      return request(app)
        .patch("/api/articles/11")
        .send({ inc_votes })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(expectedMsg);
        });
    }
  );
  test("Status: 404, Responds with 404 - 'Article not found' if article does not exist when updating votes", () => {
    return request(app)
      .patch("/api/articles/999")
      .send({ inc_votes: 5 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});
