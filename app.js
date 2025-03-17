const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");
const {
  getArticles,
  getArticleById,
  updateArticleVotes,
} = require("./controllers/articles.controller");
const {
  getCommentsByArticleId,
  postComment,
  deleteComment,
} = require("./controllers/comments.controller");

const { getAllUsers } = require("./controllers/users.controller");

app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", updateArticleVotes);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api/users", getAllUsers);

app.all("/*", (req, res, next) => {
  res.status(404).send({ msg: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    console.log(err);
    return res.status(400).send({ msg: "Bad request: Invalid Input." });
    // } else if (err.code === "23503") {
    //   // Foreign key violation error code in PostgreSQL
    //   return res
    //     .status(404)
    //     .send({
    //       msg: "Foreign key violation: The referenced ID does not exist in the database.",
    //     });
  }
  next(err);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).send({ msg: message });
});

module.exports = app;
