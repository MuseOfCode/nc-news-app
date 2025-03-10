const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/api.controller");
const { getTopics } = require("./controllers/topics.controller");
const { handleServerErrors } = require("./controllers/error.controller");
const { getArticleById } = require("./controllers/articles.controller");

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Endpoint not found" });
});

app.use(handleServerErrors);

module.exports = app;
